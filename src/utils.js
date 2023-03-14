import readline from 'readline';

import pc from 'picocolors';

export const errorMsg = (str) => `${pc.red('Error')}: ${str}`;

const deriveNum = (str, def, parse) => (isNaN(parse(str, 10)) ? undefined : parse(str, 10)) ?? def;

export const deriveInt = (str, def) => deriveNum(str, def, parseInt);
export const deriveFloat = (str, def) => deriveNum(str, def, parseFloat);

export function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}
