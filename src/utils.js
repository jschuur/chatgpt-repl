import readline from 'readline';

import pc from 'picocolors';

export function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}

export function errorMsg(str) {
  clearLine();
  console.error(`${pc.red('Error')}: ${str}`);
}
