import path from 'path';
import url from 'url';

import { Command, InvalidOptionArgumentError, Option } from 'commander';
import Conf from 'conf';
import jsonfile from 'jsonfile';
import pc from 'picocolors';

const resolvePath = (p) => path.resolve(url.fileURLToPath(new URL('.', import.meta.url)), p);

const KNOWN_MODELS = ['gpt-3.5-turbo', 'gpt-3.5-turbo-0301'];
const UNSUPPORTED_MODELS = [
  'text-davinci-003',
  'text-davinci-002',
  'text-davinci-edit-001',
  'code-davinci-edit-001',
  'whisper-1',
  'text-curie-001',
  'text-babbage-001',
  'text-ada-001',
  'davinci',
  'curie',
  'babbage',
  'ada',
  'text-embedding-ada-002',
  'text-search-ada-doc-001',
  'text-moderation-stable',
  'text-moderation-latest',
];

export const DEFAULT_MODEL = KNOWN_MODELS[0];
export const DEFAULT_TEMPERATURE = 1;
export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_HISTORY_LENGTH = 3;
export const DEFAULT_TOKEN_PRICE = 0.000002;
export const DEFAULT_SYSTEM = 'You are a helpful assistant.';

export const openAIPricePerToken = process.env.OPENAI_USD_PRICE_PER_TOKEN || DEFAULT_TOKEN_PRICE;

export const conf = new Conf({ projectName: 'chatgpt-repl' });

export const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

function validateIntOption(value, message) {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) throw new InvalidOptionArgumentError(message);

  return num;
}

function validateFloatOption(value, message) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) throw new InvalidOptionArgumentError(message);

  return num;
}

function validateModel(model) {
  if (!model) throw new InvalidOptionArgumentError('Model must not be empty');

  if (UNSUPPORTED_MODELS.includes(model))
    throw new InvalidOptionArgumentError(
      `Model ${model} is not supported, only chat completion models (${KNOWN_MODELS.join(
        ', '
      )}) can be used at this time.`
    );

  if (!KNOWN_MODELS.includes(model))
    console.warn(
      `${pc.yellow(
        'Warning'
      )}: '${model}' is not a known OpenAI model for chat completions. Use at your own risk.\n`
    );

  return model;
}

export function updateSetting(setting, value, type) {
  if (typeof value !== 'string' && isNaN(value))
    console.error(`\n${pc.red('Error')}: Value for ${setting} must be a ${type}\n`);
  else if (value === undefined && value.length === 0)
    console.log(`\n${pc.red('Error')}: No value provided for ${setting}\n`);
  else {
    settings[setting] = value;

    console.log(`\n${pc.green('Update')}: ${setting} set to ${pc.magenta(value)}\n`);
  }
}

export function resetSettings() {
  settings = { ...initialSettings };

  console.log(`\nSettings reset: ${settingsSummary()}\n`);
}

const program = new Command();

program
  .name('chatgpt-repl')
  .version(packageJson.version, '-v, --version', 'output the current version');

program
  .description('ChatGPT REPL interactive command line tool')
  .option('-c, --clipboard', 'Copy responses to clipboard')
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
  .option('-w, --disable-word-wrap', 'Disable word wrap')
  .addOption(
    new Option('-x, --max-tokens <integer>', 'Max tokens per request')
      .default(DEFAULT_MAX_TOKENS)
      .argParser((value) => validateIntOption(value, 'Max tokens must be an integer'))
  );

export let settings = program.parse().opts();
const initialSettings = { ...settings };

export const settingsSummary = () =>
  `max tokens: ${settings.maxTokens}, history: ${settings.historyLength}, temp: ${settings.temperature}, model: ${settings.model}, system: ${settings.system}`;

export function settingsList() {
  console.log();

  for (const [key, value] of Object.entries(settings))
    console.log(`${key.toLowerCase().padEnd(19)} ${pc.dim(value)}`);

  console.log();
}
