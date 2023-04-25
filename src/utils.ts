import os from 'os';
import readline from 'readline';

import pc from 'picocolors';
import wrapText from 'wrap-text';
import { z } from 'zod';

const homeDir = os.homedir();

export function clearLine() {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
}

export function errorMsg(str: string) {
  clearLine();
  console.error(`${pc.red('Error')}: ${str}`);
}

export const wrap = (text: string, width: number) =>
  text
    .split('\n')
    .map((line) => wrapText(line, width))
    .join('\n');

export const getErrorMessage = (error: unknown, str?: string) =>
  error instanceof Error ? error.message : str ? `${str} (${String(error)})` : String(error);

export const validationError = (error: unknown, setting: string) => {
  if (error instanceof z.ZodError) {
    if (error.issues[0].code === 'invalid_type')
      console.error(
        `${pc.red('Error')}: Incorrect type for ${setting}. ${error.issues[0].message}`
      );
    else
      console.error(
        `${pc.red('Error')}: ${pc.cyan(error.issues[0].code)}: ${error.issues[0].message}`
      );
  } else
    console.error(
      `${pc.red('Error')}: ${getErrorMessage(error, `Unknown error updating  ${setting}`)}`
    );
};

export function lengthWithoutColor(str: string) {
  // eslint-disable-next-line no-control-regex
  const colorPattern = /\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g;

  return str.replace(colorPattern, '').length;
}

// via https://github.com/sindresorhus/untildify
export const untildify = (filePath: string) =>
  homeDir ? filePath.replace(/^~(?=$|\/|\\)/, homeDir) : filePath;
