import readline from 'readline';

import wrap from 'fast-word-wrap';
import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { conf, packageJson, settings } from './settings.js';

import { commandList, COMMAND_PREFIX, exitCmd, runCommand } from './commands.js';
import { askChatGPT } from './openai.js';
import { formatUsage } from './usage.js';
import { clearLine, errorMsg } from './utils.js';

const promptText = pc.green('You: ');

let rl;

function initReadline() {
  rl = readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line) => {
        const cmd = line?.split(' ')?.[0];
        const commands = Object.keys(commandList).map((c) => `${COMMAND_PREFIX}${c}`);

        if (!cmd || !line.startsWith(COMMAND_PREFIX) || commands.includes(cmd)) return [[], line];

        const hits = commands.filter((c) => c.startsWith(line));

        return [hits.length ? hits.map((c) => `${c} `) : commands, cmd];
      },
    })
    .on('close', exitCmd);
}

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

  const answerFormatted = settings.wordWrap
    ? wrap(`${pc.cyan('ChatGPT')}: ${answer}`, columns - 5)
    : answer;

  console.log(`\n${answerFormatted}`);

  showFinishReason(finishReason);

  return answer;
}

function handleError(error) {
  const { response, message } = error;

  if (response) {
    if (response?.status === 401) {
      conf.delete('apiKey');
      errorMsg('Invalid API key. Please restart and enter a new one.');

      process.exit(1);
    } else errorMsg(`${response?.status}: ${response?.statusText} ${pc.dim(`(${message})`)}\n`);
  } else if (message) {
    errorMsg(`${message}\n`);
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

async function inputPrompt() {
  return new Promise((resolve) => {
    rl.question(promptText, resolve);
  });
}

export async function chatLoop() {
  console.log(
    `ChatGPT REPL v${packageJson.version} ${pc.dim(
      `(Ctrl-C or ${COMMAND_PREFIX}exit to exit, ${COMMAND_PREFIX}help for more commands)\n`
    )}`
  );

  initReadline();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let input = await inputPrompt();

    if (input.startsWith(COMMAND_PREFIX)) input = runCommand(input);

    if (input) {
      const startTime = Date.now();

      process.stdout.write(`\n${pc.cyan('ChatGPT')}: Thinking...`);

      try {
        const response = await askChatGPT(input);

        clearLine();
        console.log(responseHeader({ response, startTime }));
        const answer = showAnswer(response);

        if (settings.clipboard) clipboard.writeSync(answer);
      } catch (error) {
        handleError(error);
      }
    }
  }
}
