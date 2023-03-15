import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import pluralize from 'pluralize';
import wordcount from 'wordcount';

import { apiKey, clearConversation, conversation, updateConversation } from './openai.js';
import {
  indentPadding,
  packageJson,
  resetSettings,
  settingsSummary,
  updateSetting,
} from './settings.js';
import { formatTotalUsage } from './usage.js';
import { clearLine } from './utils.js';

export const COMMAND_PREFIX = '.';

function retryCmd() {
  if (conversation.length < 3) console.warn('No previous response to retry.');
  else return conversation[conversation.length - 2]?.content;
}

function copyLastResultCmd() {
  const lastMessage = conversation[conversation.length - 1];
  const wordCount = wordcount(lastMessage?.content || '');
  const characterCount = (lastMessage?.content || '').length;

  if (conversation.length < 3) console.warn('No previous response to copy.');
  else if (lastMessage?.role === 'assistant') {
    clipboard.writeSync(lastMessage.content);

    console.log(
      `Last response (${pluralize('word', wordCount, true)}, ${pluralize(
        'character',
        characterCount,
        true
      )}) copied to clipboard.`
    );
  } else {
    console.error(`${pc.red('Error')}: Unable to copy last response copied to clipboard.`);
  }
}

function showHelp() {
  console.log(`\n${pc.green('Available commands')}:\n`);
  for (const [command, [description]] of Object.entries(commandList)) {
    console.log(`  ${COMMAND_PREFIX}${command.padEnd(indentPadding)} ${pc.dim(description)}`);
  }

  console.log();
}

function usageCmd() {
  console.log(`\n${pc.green(`Usage for current API Key (...${pc.dim(apiKey.slice(-6))}):`)}\n`);
  console.log(formatTotalUsage());
  console.log();
}

export function exitCmd() {
  const totalUsage = formatTotalUsage();

  clearLine();
  console.log('See you next time! 🤖\n');
  console.log(totalUsage);

  process.exit(0);
}

export function runCommand(cmd) {
  const [command, ...args] = cmd.slice(1).split(' ');

  if (!commandList[command])
    console.error(
      `Unknown command: ${COMMAND_PREFIX}${command}. List commands with ${COMMAND_PREFIX}help.`
    );
  else return commandList[command][1](args.join(' '));
}

export const commandList = {
  help: ['Show help', showHelp],
  version: ['Show version', () => console.log(packageJson.version)],
  settings: ['Show current settings', settingsSummary],
  usage: ['Show usage for current API key', usageCmd],
  model: ['Show/update model', (str) => updateSetting('model', str, 'model')],
  temperature: ['Show/update temperature', (str) => updateSetting('temperature', str, 'float')],
  maxtokens: [
    'Show/update max tokens per prompt',
    (str) => updateSetting('maxTokens', str, 'integer'),
    'integer',
  ],
  historylength: [
    'Show/update history length',
    (str) => updateSetting('historyLength', str, 'integer'),
  ],
  system: [
    'Show/update system text',
    (str) => updateConversation({ role: 'system', content: str }),
  ],
  reset: ['Reset settings', resetSettings],
  retry: ['Send previous prompt again', retryCmd],
  clear: ['Clear conversation history', clearConversation],
  clipboard: [
    'Modify automatic clipboard copying',
    (str) => updateSetting('clipboard', str, 'boolean'),
  ],
  copy: ['Copy last result to clipboard', copyLastResultCmd],
  wordwrap: ['Modify response word wrapping', (str) => updateSetting('wordWrap', str, 'boolean')],
  exit: ['Exit chatgpt-repl', exitCmd],
};
