import fs from 'fs';
import readline from 'readline';

import pc from 'picocolors';
import readLastLines from 'read-last-lines';

import { COMMAND_PREFIX, completeCommand, runCommand } from './commands/commands.js';
import exitCmd from './commands/exitCmd.js';
import { askChatGPT } from './openai/openai.js';
import { settings } from './settings.js';

const promptText: string = pc.green('You: ');

export let rl: readline.Interface;

async function initReadline() {
  const historyStream = fs.createWriteStream(settings.historyFile, { flags: 'a' });

  const history: string[] = fs.existsSync(settings.historyFile)
    ? ((await readLastLines.read(settings.historyFile, settings.historySize)) as string)
        .split('\n')
        .reverse()
        .filter(Boolean)
        .map((line) => line.split(' ', 2)[1])
    : [];

  rl = readline
    .createInterface({
      input: process.stdin,
      output: process.stdout,
      history,
      historySize: settings.historySize,
      completer: completeCommand,
    })
    .on('history', (history: string[]) => {
      if (settings.history && !history[0]?.startsWith(' '))
        historyStream.write(`${new Date().toISOString()} ${history[0]}\n`);
    })
    .on('close', () => {
      historyStream.end();
      exitCmd;
    });
}

async function inputPrompt(): Promise<string> {
  return new Promise((resolve) => {
    rl.question(promptText, resolve);
  });
}

export async function chatLoop() {
  await initReadline();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const input = (await inputPrompt())?.trim();
    const prompt = input.startsWith(COMMAND_PREFIX) ? await runCommand(input) : input;

    if (prompt) await askChatGPT(prompt);
  }
}
