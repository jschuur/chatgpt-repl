import { clearConversation, updateConversation } from '../openai/conversation.js';
import { showLastResponse } from '../openai/response.js';
import { packageJson, resetSettings, updateSetting } from '../settings.js';

import copyCmd from './copyCmd.js';
import exitCmd from './exitCmd.js';
import helpCmd from './helpCmd.js';
import modelsCmd from './modelsCmd.js';
import retryCmd from './retryCmd.js';
import settingsCmd from './settingsCmd.js';
import usageCmd from './usageCmd.js';

export const COMMAND_PREFIX = '.';

type CommandDefinition = [
  description: string,
  commandFunction: (args: string) => string | void | Promise<void>
];
interface CommandList {
  [key: string]: CommandDefinition;
}

export async function runCommand(cmd: string): Promise<string | void> {
  const [command, ...args] = cmd.slice(1).split(' ');

  if (!commandList[command])
    console.error(
      `Unknown command: ${COMMAND_PREFIX}${command}. List commands with ${COMMAND_PREFIX}help.`
    );
  else {
    const cmdFunc = commandList[command][1];

    if (cmdFunc) return await cmdFunc(args.join(' '));
    else console.error(`command: ${COMMAND_PREFIX}${command} is missing a function to execute.`);
  }

  return '';
}

function completeOptions(partial: string, options: string[]) {
  const matches = options.filter((c) => c.startsWith(partial));

  return [matches.length ? matches.map((m) => `${m} `) : options, partial];
}

export function completeCommand(line: string) {
  const input = line.trim();
  const cmd = input.split(' ')?.[0];
  const commands = Object.keys(commandList).map((c) => `${COMMAND_PREFIX}${c}`);

  if (!cmd || !input.startsWith(COMMAND_PREFIX) || commands.includes(cmd)) return [[], input];

  return completeOptions(cmd, commands);
}

export const commandList: CommandList = {
  help: ['Show help', helpCmd],
  version: ['Show version', () => console.log(packageJson.version)],

  settings: ['Show current settings', settingsCmd],
  usage: ['Show usage for current API key', usageCmd],
  model: ['Show/update model', (value: string) => updateSetting('model', value.trim())],
  models: ['Show/update supported ChatGPT models list', modelsCmd],
  temperature: [
    'Show/update temperature',
    (value: string) => updateSetting('temperature', value.trim()),
  ],
  maxtokens: [
    'Show/update max tokens per prompt',
    (value: string) => updateSetting('maxTokens', value.trim()),
  ],
  conversationlength: [
    'Show/update history length',
    (value: string) => updateSetting('conversationLength', value.trim()),
  ],

  system: [
    'Show/update system text',
    (value: string) => updateConversation({ role: 'system', content: value.trim() }),
  ],
  reset: ['Reset one or all settings', (setting: string) => resetSettings(setting.trim())],
  retry: ['Send previous prompt again', retryCmd],
  clear: ['Clear conversation history', () => clearConversation()],
  clipboard: [
    'Show/update automatic clipboard copying',
    (value: string) => updateSetting('clipboard', value.trim()),
  ],
  copy: ['Copy last result to clipboard', copyCmd],
  wordwrap: [
    'Show/update response word wrapping',
    (value: string) => updateSetting('wordWrap', value.trim()),
  ],
  stream: [
    'stream responses as they are received',
    (value: string) => updateSetting('stream', value.trim()),
  ],
  history: [
    'skip writing to history file',
    (value: string) => updateSetting('history', value.trim()),
  ],
  last: ['Show the last response again', showLastResponse],
  exit: ['Exit chatgpt-repl', exitCmd],
};
