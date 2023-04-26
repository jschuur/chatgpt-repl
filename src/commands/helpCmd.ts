import pc from 'picocolors';

import { INDENT_PADDING_BUFFER } from '../settings.js';
import { COMMAND_PREFIX, commandList } from './commands.js';

export default function helpCmd() {
  const padding =
    Math.max(...Object.entries(commandList).map(([key, [, , syntax]]) => (syntax || key).length)) +
    INDENT_PADDING_BUFFER;
  console.log(`\n${pc.green('Available commands')}:\n`);

  for (const [command, [description, , syntax]] of Object.entries(commandList)) {
    console.log(`  ${COMMAND_PREFIX}${(syntax || command).padEnd(padding)} ${pc.dim(description)}`);
  }

  console.log();
}
