import { clearConversation, updateConversation } from '../conversation.js';
import { showLastResponse } from '../loop.js';
import { packageJson, resetSettings, updateSetting } from '../settings.js';

import copyCmd from './copyCmd.js';
import exitCmd from './exitCmd.js';
import helpCmd from './helpCmd.js';
import retryCmd from './retryCmd.js';
import settingsCmd from './settingsCmd.js';
import usageCmd from './usageCmd.js';

export const COMMAND_PREFIX = '.';

type CommandDefinition = [description: string, commandFunction: (args: string) => string | void];
interface CommandList {
  [key: string]: CommandDefinition;
}

export function runCommand(cmd: string): string | void {
  const [command, ...args] = cmd.slice(1).split(' ');

  if (!commandList[command])
    console.error(
      `Unknown command: ${COMMAND_PREFIX}${command}. List commands with ${COMMAND_PREFIX}help.`
    );
  else {
    const cmdFunc = commandList[command][1];

    if (cmdFunc) return cmdFunc(args.join(' '));
    else console.error(`command: ${COMMAND_PREFIX}${command} is missing a function to execute.`);
  }

  return '';
}

export const commandList: CommandList = {
  help: ['Show help', helpCmd],
  version: ['Show version', () => console.log(packageJson.version)],

  settings: ['Show current settings', settingsCmd],
  usage: ['Show usage for current API key', usageCmd],
  model: ['Show/update model', (value: string) => updateSetting('model', value.trim())],
  temperature: [
    'Show/update temperature',
    (value: string) => updateSetting('temperature', value.trim()),
  ],
  maxtokens: [
    'Show/update max tokens per prompt',
    (value: string) => updateSetting('maxTokens', value.trim()),
  ],
  historylength: [
    'Show/update history length',
    (value: string) => updateSetting('historyLength', value.trim()),
  ],
  system: [
    'Show/update system text',
    (value: string) => updateConversation({ role: 'system', content: value.trim() }),
  ],
  reset: ['Reset one or all settings', (setting: string) => resetSettings(setting.trim())],
  retry: ['Send previous prompt again', retryCmd],
  clear: ['Clear conversation history', () => clearConversation()],
  clipboard: [
    'Modify automatic clipboard copying',
    (value: string) => updateSetting('clipboard', value.trim()),
  ],
  copy: ['Copy last result to clipboard', copyCmd],
  wordwrap: [
    'Modify response word wrapping',
    (value: string) => updateSetting('wordWrap', value.trim()),
  ],
  last: ['Show the last response again', showLastResponse],
  exit: ['Exit chatgpt-repl', exitCmd],
};
