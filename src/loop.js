import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import wrap from 'fast-word-wrap';
import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { conf, packageJson, settings, settingsSummary } from './settings.js';

import { runCommand } from './commands.js';
import { askChatGPT } from './openai.js';
import { formatTotalUsage, formatUsage } from './usage.js';
import { errorMsg } from './utils.js';

function showFinishReason(finishReason) {
  if (!finishReason || finishReason === 'stop') return;

  if (finishReason === 'length')
    console.log(pc.dim('Incomplete response due to hitting max_tokens or token limit.\n'));
  else if (finishReason === 'content_filter')
    console.log(pc.dim('Incomplete response due to content filter\n'));
  else console.log(pc.dim(`Unknown finish reason: ${pc.magenta(finishReason)}\n`));
}

function showAnswer(response) {
  const answer = response?.data?.choices[0]?.message?.content?.trim();
  const finishReason = response?.data?.choices[0]?.finish_reason;
  const { columns } = terminalSize();

  if (!answer) return pc.red('\nNo answer received.\n');

  const answerFormatted = settings.disableWordWrap ? answer : wrap(answer, columns - 5);

  console.log(`\n${answerFormatted}`);

  showFinishReason(finishReason);

  return answer;
}

function handleError(error, s) {
  const { response, message } = error;

  if (response) {
    if (response?.status === 401) {
      conf.delete('apiKey');
      s.stop(errorMsg('Invalid API key. Please restart and enter a new one.'));

      process.exit(1);
    } else
      s.stop(errorMsg(`${response?.status}: ${response?.statusText} ${pc.dim(`(${message})`)}`));
  } else if (message) {
    s.stop(errorMsg(message));
  }
}

function responseHeader({ response, startTime }) {
  const usage = formatUsage(response);

  return pc.dim(
    `Response${settings.clipboard ? ' (copied to clipboard)' : ''} in ${pc.green(
      prettyMilliseconds(Date.now() - startTime)
    )}. ${usage}`
  );
}

export async function chatLoop() {
  const s = spinner();
  let initialValue = '';

  intro(`ChatGPT REPL v${packageJson.version} (${settingsSummary(settings)})`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let input = await text({
      message: `Prompt? ${pc.dim('(Ctrl-C or enter to exit or !help for commands)')}`,
      placeholder: '',
      initialValue,
    });
    initialValue = null;

    if (isCancel(input) || !input || input.trim().length === 0) break;

    if (input.startsWith('!')) {
      const { updatedInput, updatedInitialValue } = runCommand(input) || {};

      input = updatedInput || null;
      if (updatedInitialValue) initialValue = updatedInitialValue;
    }

    if (input) {
      const startTime = Date.now();

      s.start('Thinking...');
      try {
        const response = await askChatGPT(input);

        s.stop(responseHeader({ response, startTime }));
        const answer = showAnswer(response);

        if (settings.clipboard) clipboard.writeSync(answer);
      } catch (error) {
        handleError(error, s);
      }
    }
  }

  outro('See you next time! 🤖');

  const totalUsage = formatTotalUsage();
  console.log(totalUsage);
}
