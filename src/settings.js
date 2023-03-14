import path from 'path';
import url from 'url';

import { Command, Option } from 'commander';
import Conf from 'conf';
import jsonfile from 'jsonfile';
import pc from 'picocolors';

import {
  KNOWN_MODELS,
  validateBooleanOption,
  validateFloatOption,
  validateIntOption,
  validateModel,
} from './validate.js';

const resolvePath = (p) => path.resolve(url.fileURLToPath(new URL('.', import.meta.url)), p);

export const INDENT_PADDING_BUFFER = 2;

export const DEFAULT_MODEL = KNOWN_MODELS[0];
export const DEFAULT_TEMPERATURE = 1.0;
export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_HISTORY_LENGTH = 3;
export const DEFAULT_TOKEN_PRICE = 0.000002;
export const DEFAULT_SYSTEM = 'You are a helpful assistant.';

export const openAIPricePerToken = process.env.OPENAI_USD_PRICE_PER_TOKEN || DEFAULT_TOKEN_PRICE;

export const conf = new Conf({ projectName: 'chatgpt-repl' });

export const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

export function updateSetting(setting, str, type) {
  if (!str || str.length === 0) {
    console.log(`${setting.padEnd(indentPadding + 3)} ${pc.dim(settings[setting])}`);
  } else {
    let value;

    try {
      if (type === 'integer')
        value = validateIntOption(str, `${pc.cyan(setting)} must be an integer`);
      else if (type === 'float')
        value = validateFloatOption(str, `${pc.cyan(setting)} must be a float`);
      else if (type === 'boolean') {
        value = validateBooleanOption(str, `${pc.cyan(setting)} must be a float`);
      } else if (type === 'model') value = validateModel(str);
      else value = str;
    } catch (e) {
      console.error(`${pc.red('Error')}: ${e.message}`);

      return;
    }

    settings[setting] = value;

    console.log(`${pc.cyan(setting)} set to ${pc.magenta(value)}`);
  }
}

export function resetSettings() {
  settings = { ...initialSettings };

  settingsSummary('Settings reset');
}

const program = new Command();

program
  .name('chatgpt-repl')
  .version(packageJson.version, '-v, --version', 'Show the current version number')
  .helpOption('-h, --help', 'Show help');

program
  .description('ChatGPT REPL interactive command line tool')
  .addOption(
    new Option('-c, --clipboard <boolean>', 'Enable/disable copying responses to clipboard')
      .default(false)
      .argParser((value) =>
        validateBooleanOption(value, 'Clipboard copy options must be a boolean')
      )
  )
  .addOption(
    new Option('-k, --apiKey <string>', 'Set (and save) OpenAI API key').env('OPENAI_API_KEY')
  )
  .addOption(
    new Option('-l, --history-length <integer>', 'Set conversation history length')
      .default(DEFAULT_HISTORY_LENGTH)
      .env('OPENAI_HISTORY_LENGTH')
      .argParser((value) => validateIntOption(value, 'History length must be an integer'))
  )
  .addOption(
    new Option('-m, --model <string>', 'Set OpenAI model')
      .default(DEFAULT_MODEL)
      .env('OPENAI_MODEL')
      .argParser(validateModel)
  )
  .addOption(
    new Option('-t, --temperature <float>', 'Set temperature')
      .default(DEFAULT_TEMPERATURE)
      .env('OPENAI_TEMPERATURE')
      .argParser((value) => validateFloatOption(value, 'Temperature must be a float'))
  )
  .addOption(
    new Option('-s, --system <string>', 'Set system prompt')
      .default(DEFAULT_SYSTEM)
      .env('OPENAI_SYSTEM')
  )
  .addOption(
    new Option('-w, --word-wrap <boolean>', 'Enable/disable word wrap')
      .default(true)
      .argParser((value) => validateBooleanOption(value, 'Word wrap option must be a boolean'))
  )
  .addOption(
    new Option('-x, --max-tokens <integer>', 'Max tokens per request')
      .default(DEFAULT_MAX_TOKENS)
      .env('OPENAI_MAX_TOKENS')
      .argParser((value) => validateIntOption(value, 'Max tokens must be an integer'))
  );

export let settings = program.parse().opts();
export const indentPadding =
  Math.max(...Object.keys(settings).map((k) => k.length)) + INDENT_PADDING_BUFFER;
const initialSettings = { ...settings };

export function settingsSummary(str) {
  console.log(`\n${pc.green(str || 'Current settings:')}\n`);

  for (const [key, value] of Object.entries(settings))
    console.log(`  ${key.toLowerCase().padEnd(indentPadding + 1)} ${pc.dim(value)}`);

  console.log();
}
