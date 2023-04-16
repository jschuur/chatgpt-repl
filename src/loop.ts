import ora from 'ora';
import readline from 'readline';

import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { packageJson, settings } from './settings.js';

import { COMMAND_PREFIX, commandList, runCommand } from './commands/commands.js';
import exitCmd from './commands/exitCmd.js';

import { conversation } from './conversation.js';
import { askChatGPT, handleError } from './openai.js';
import { formatUsage } from './usage.js';
import { clearLine, errorMsg, wrap } from './utils.js';

const promptText: string = pc.green('You: ');

let rl: readline.Interface;

function initReadline() {
  rl = readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line: string) => {
        const input = line.trim();
        const cmd = input.split(' ')?.[0];
        const commands = Object.keys(commandList).map((c) => `${COMMAND_PREFIX}${c}`);

        if (!cmd || !input.startsWith(COMMAND_PREFIX) || commands.includes(cmd)) return [[], input];

        const hits = commands.filter((c) => c.startsWith(input));

        return [hits.length ? hits.map((c) => `${c} `) : commands, cmd];
      },
    })
    .on('close', exitCmd);
}

function showFinishReason(finishReason: string | undefined) {
  if (!finishReason || finishReason === 'stop') return;

  if (finishReason === 'length')
    console.log(pc.dim('Incomplete response due to hitting max_tokens or token limit.\n'));
  else if (finishReason === 'content_filter')
    console.log(pc.dim('Incomplete response due to content filter\n'));
  else console.log(pc.dim(`Unknown finish reason: ${pc.magenta(finishReason)}\n`));
}

export function showLastResponse() {
  const { role, content: answer } = conversation[conversation.length - 1] || {};

  if (role !== 'assistant' || !answer) return errorMsg('No previous response to show.');

  const { columns } = terminalSize();

  const answerFormatted = settings.wordWrap
    ? wrap(`${pc.cyan('ChatGPT')}: ${answer}`, columns - 5)
    : answer;

  console.log(`\n${answerFormatted}\n`);

  if (settings.clipboard) clipboard.writeSync(answer);
}

function responseHeader({
  response,
  startTime,
}: {
  response: any;
  // TODO: refactor to remove any
  // response: AxiosResponse<CreateChatCompletionResponse, any>;
  startTime: number;
}) {
  const usage = formatUsage(response);

  return pc.dim(
    `Response${settings.clipboard ? ' (copied to clipboard)' : ''} in ${pc.green(
      prettyMilliseconds(Date.now() - startTime)
    )}. ${usage}`
  );
}

async function inputPrompt(): Promise<string> {
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
    const input = (await inputPrompt())?.trim();
    const prompt = input.startsWith(COMMAND_PREFIX) ? runCommand(input) : input;
    let spinner;

    if (prompt) {
      const startTime = Date.now();

      try {
        console.log();

        spinner = ora({
          discardStdin: false,
          prefixText: `${pc.cyan('ChatGPT')}: Thinking`,
          spinner: 'point',
        }).start();
        const { answer, finishReason, response } = await askChatGPT(prompt);
        spinner.stop();

        clearLine();
        console.log(responseHeader({ response, startTime }));

        if (answer) showLastResponse();
        showFinishReason(finishReason);
      } catch (error) {
        if (spinner) spinner.stop();
        handleError(error);
      }
    }
  }
}
