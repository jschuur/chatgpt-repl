import readline from 'readline';

import pc from 'picocolors';

import { COMMAND_PREFIX, commandList, runCommand } from './commands/commands.js';
import exitCmd from './commands/exitCmd.js';

import { askChatGPT } from './openai/openai.js';
import { packageJson } from './settings.js';

const promptText: string = pc.green('You: ');

export let rl: readline.Interface;

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

    if (prompt) await askChatGPT(prompt);
  }
}
