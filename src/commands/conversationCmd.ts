import { updateSetting } from '../settings.js';

export default function conversationCmd(str: string) {
  const [subCommand, ...args] = str.split(' ');

  if (!subCommand) return;

  if (subCommand === 'length') updateSetting('conversationLength', args[0]);
  else console.warn(`Unknown subcommand: ${subCommand}`);
}
