import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import wrap from 'fast-word-wrap';
import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { conf, options, optionsSummary } from './settings.js';

import { packageJson } from './cli.js';
import { askChatGPT } from './openai.js';
import { formatTotalUsage, formatUsage } from './usage.js';
import { errorMsg } from './utils.js';

function showAnswer(response) {
  const answer = response?.data?.choices[0]?.message?.content?.trim();
  const { columns } = terminalSize();

  if (!answer) return pc.red('\nNo answer received.\n');

  const answerFormatted = options['disable-word-wrap'] ? answer : wrap(answer, columns - 5);

  console.log(`\n${answerFormatted}`);

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
    `Response${options?.clipboard ? ' (copied to clipboard)' : ''} in ${pc.green(
      prettyMilliseconds(Date.now() - startTime)
    )}. ${usage}`
  );
}

export async function chatLoop() {
  const s = spinner();

  intro(`ChatGPT REPL v${packageJson.version} (${optionsSummary})`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const question = await text({
      message: `Prompt? ${pc.dim('(Ctrl-C or enter to exit)')}`,
    });

    if (isCancel(question) || !question || question.trim().length === 0) break;

    const startTime = Date.now();

    s.start('Thinking...');
    try {
      const response = await askChatGPT(question);

      s.stop(responseHeader({ response, startTime }));
      const answer = showAnswer(response);

      if (options?.clipboard) clipboard.writeSync(answer);
    } catch (error) {
      handleError(error, s);
    }
  }

  outro('See you next time! 🤖');

  const totalUsage = formatTotalUsage();
  console.log(totalUsage);
}
