import clipboard from 'node-clipboardy';
import pc from 'picocolors';

import { clearConversation, conversation, updateConversation } from './openai.js';
import { packageJson, resetSettings, settingsSummary, updateSetting } from './settings.js';

const commandList = {
  help: ['Show help', showHelp],
  version: ['Show version', () => console.log(packageJson.version)],
  settings: [
    'Show current settings',
    () => console.log(`\nCurrent settings: ${settingsSummary()}\n`),
  ],
  model: ['Update model', (str) => updateSetting('model', str)],
  temperature: [
    'Update temperature',
    (str) => updateSetting('temperature', parseFloat(str), 'float'),
  ],
  maxtokens: [
    'Updater max tokens per prompt',
    (str) => updateSetting('maxTokens', parseInt(str, 10)),
    'integer',
  ],
  historylength: [
    'Update history length',
    (str) => updateSetting('historyLength', parseInt(str, 10), 'integer'),
  ],
  system: ['Update system text', (str) => updateConversation({ role: 'system', content: str })],
  reset: ['Reset settings', resetSettings],
  retry: ['Send previous prompt again', retryCmd],
  edit: ['Edit last prompt', editCmd],
  clear: ['Clear conversation history', clearConversation],
  clipboard: ['Enable automatic clipboard copying', () => updateSetting('clipboard', true)],
  copy: ['Copy last result to clipboard', copyLastResultCmd],
  wordwrap: ['Enable response word wrap', () => updateSetting('disableWordWrap', false)],
  nowordwrap: ['Disable response word wrap', () => updateSetting('disableWordWrap', true)],
};

function copyLastResultCmd() {
  const lastMessage = conversation[conversation.length - 1];

  if (lastMessage?.role === 'assistant') {
    clipboard.writeSync(lastMessage.content);

    console.log('\nLast response copied to clipboard.\n');
  } else {
    console.error('\nUnable to copy last response copied to clipboard.\n');
  }
}

function editCmd() {
  return { updatedInitialValue: conversation[conversation.length - 2]?.content || '' };
}

function retryCmd() {
  return { updatedInput: conversation[conversation.length - 2]?.content || '' };
}

function showHelp() {
  console.log(`\n${pc.green('Available commands')}:\n`);
  for (const [command, [description]] of Object.entries(commandList)) {
    console.log(`  !${command.padEnd(16)} ${pc.dim(description)}`);
  }

  console.log();
}

export function runCommand(cmd) {
  const [command, ...args] = cmd.slice(1).split(' ');

  if (!commandList[command]) console.error(`Unknown command: !${command}`);
  else return commandList[command][1](args.join(' '));
}
