import pc from 'picocolors';

import { indentPadding } from '../settings.js';
import { COMMAND_PREFIX, commandList } from './commands.js';

export default function helpCmd() {
  console.log(`\n${pc.green('Available commands')}:\n`);
  for (const [command, [description]] of Object.entries(commandList)) {
    console.log(`  ${COMMAND_PREFIX}${command.padEnd(indentPadding)} ${pc.dim(description)}`);
  }

  console.log();
}
