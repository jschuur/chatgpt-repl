import readline from 'readline';
import wrapText from 'wrap-text';

import pc from 'picocolors';

export function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}

export function errorMsg(str) {
  clearLine();
  console.error(`${pc.red('Error')}: ${str}`);
}

export const wrap = (str, width) =>
  str
    .split('\n')
    .map((line) => wrapText(line, width))
    .join('\n');
