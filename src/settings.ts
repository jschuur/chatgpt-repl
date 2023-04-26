import path from 'path';
import url from 'url';

import { Command } from 'commander';
import Conf from 'conf';
import jsonfile from 'jsonfile';
import pc from 'picocolors';

import { z } from 'zod';

import settingsCmd from './commands/settingsCmd.js';
import { untildify, validationError } from './utils.js';
import { zodBoolean, zodFloat, zodInt, zodModel } from './validate.js';

export const defaultSettings = {
  temperature: 1.0,
  maxTokens: 1024,
  model: 'gpt-3.5-turbo',
  system: 'You are a helpful assistant',
  conversationLength: 5,
  historySize: 100,
  wordWrap: true,
  clipboard: false,
  stream: true,
  history: true,
  apiKey: process.env['CHATGPTREPL_APIKEY'] || '',
  historyFile: '~/.chatgpt-repl.history',
};

const settingsSchema = z.object({
  maxTokens: zodInt(),
  temperature: zodFloat(),
  model: zodModel(),
  apiKey: z.string().optional(),
  system: z.string(),
  conversationLength: zodInt(),
  historySize: zodInt(),
  wordWrap: zodBoolean(),
  clipboard: zodBoolean(),
  stream: zodBoolean(),
  history: zodBoolean(),
  historyFile: z.string(),
});

export const settingSchema = settingsSchema.keyof();

export type Settings = z.infer<typeof settingsSchema>;
export type SettingsTypes = Settings[keyof Settings];

export type Setting = keyof Settings;

export const INDENT_PADDING_BUFFER = 2;
export const DEFAULT_TOKEN_PRICE = 0.000002;
export const MODEL_CACHE_TIME_MINUTES = 1000 * 60 * 60 * 24 * 3; // 3 days

export const openAIPricePerToken: number =
  parseFloat(process.env.CHATGPTREPL_USD_PRICE_PER_TOKEN) || DEFAULT_TOKEN_PRICE;

const resolvePath = (filePath: string) =>
  path.resolve(url.fileURLToPath(new URL('.', import.meta.url)), filePath);

export type ConfData = {
  apiKey: string;
  totalUsage: { [key: string]: number };
  models: {
    chatCompletionModels: string[];
    otherOpenAIModels: string[];
    lastUpdated: number;
  };
};

export const conf = new Conf<ConfData>({ projectName: 'chatgpt-repl' });

export const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

export const parseSetting = (setting: Setting, value: string): SettingsTypes =>
  settingsSchema.shape[setting].parse(value);

const defaultSetting = (setting: Setting): string | undefined =>
  process.env[`CHATGPTREPL_${setting.toUpperCase()}`] || defaultSettings[setting]?.toString();

const isSetting = (field: string): field is Setting => settingSchema.safeParse(field)?.success;

function setSetting(setting: Setting, value: SettingsTypes) {
  // all this to keep typescript happy. there has to be a better way?
  // https://stackoverflow.com/questions/75809343/type-string-number-is-not-assignable-to-type-never-when-dynamically-settin/75809489#75809489
  if (
    (setting === 'maxTokens' || setting === 'conversationLength' || setting === 'historySize') &&
    typeof value === 'number'
  )
    settings[setting] = value;
  if (
    (setting === 'model' || setting === 'system' || setting === 'apiKey') &&
    typeof value === 'string'
  )
    settings[setting] = value;
  if (
    (setting === 'wordWrap' ||
      setting === 'clipboard' ||
      setting === 'stream' ||
      setting === 'history') &&
    typeof value === 'boolean'
  )
    settings[setting] = value;

  console.log(`${pc.cyan(setting.toLowerCase())} set to ${pc.magenta(String(value))}`);
}

export function updateSetting(setting: Setting, value: string) {
  if (!value || value.length === 0) {
    // display the current value
    console.log(`${setting.toLowerCase()} is ${pc.dim(String(settings[setting]))}`);
  } else {
    try {
      const parsedValue = parseSetting(setting, value);
      setSetting(setting, parsedValue);
    } catch (error) {
      validationError(error, value);
    }
  }
}

export function resetSettings(setting: string) {
  if (setting) {
    if (isSetting(setting)) setSetting(setting, initialSettings[setting]);
    else console.log(pc.red(`Unknown setting: ${setting}`));
  } else {
    // reset all settings
    settings = { ...initialSettings };

    settingsCmd('Settings reset');
  }
}

const program = new Command();

program
  .name('chatgpt-repl')
  .version(packageJson.version, '-v, --version', 'Show the current version number')
  .helpOption('-h, --help', 'Show help');

program
  .description('ChatGPT REPL interactive command line tool')

  .option(
    '-c, --clipboard <boolean>',
    'Enable/disable copying responses to clipboard',
    defaultSetting('clipboard')
  )
  .option('-k, --apiKey <string>', 'Set (and save) OpenAI API key')
  .option(
    '-l, --conversation-length <integer>',
    'Set conversation history length',
    defaultSetting('conversationLength')
  )
  .option('--history-size <integer>', 'Set history size', defaultSetting('historySize'))
  .option('-m, --model <string>', 'Set OpenAI model', defaultSetting('model'))
  .option('-t, --temperature <float>', 'Set temperature', defaultSetting('temperature'))
  .option('-s, --system <string>', 'Set system prompt', defaultSetting('system'))
  .option('-w, --word-wrap <boolean>', 'Enable/disable word wrap', defaultSetting('wordWrap'))
  .option('-x, --max-tokens <integer>', 'Max tokens per request', defaultSetting('maxTokens'))
  .option('-r, --stream <boolean>', 'Enable/disabled streamed response', defaultSetting('stream'))
  .option(
    '-h, --history <boolean>',
    'Enable/disabled logging to history file',
    defaultSetting('history')
  )
  .option(
    '--history-file <path>',
    'History file location',
    untildify(defaultSetting('historyFile') || '')
  );

export let settings: Settings = settingsSchema.parse(program.parse().opts());
const initialSettings = { ...settings };
