import readline from 'readline';

import pc from 'picocolors';

import { COMMAND_PREFIX, completeCommand, runCommand } from './commands/commands.js';
import exitCmd from './commands/exitCmd.js';
import { askChatGPT } from './openai/openai.js';

const promptText: string = pc.green('You: ');

export let rl: readline.Interface;

function initReadline() {
  rl = readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: completeCommand,
    })
    .on('close', exitCmd);
}

async function inputPrompt(): Promise<string> {
  return new Promise((resolve) => {
    rl.question(promptText, resolve);
  });
}

export async function chatLoop() {
  initReadline();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const input = (await inputPrompt())?.trim();
    const prompt = input.startsWith(COMMAND_PREFIX) ? await runCommand(input) : input;

    if (prompt) await askChatGPT(prompt);
  }
}
