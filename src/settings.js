import Conf from 'conf';
import minimist from 'minimist';

export const options = minimist(process.argv.slice(2), {
  boolean: ['clipboard', 'disable-word-wrap', 'help', 'version'],
  string: ['api-key', 'model'],
  alias: {
    c: 'clipboard',
    h: 'help',
    k: 'api-key',
    l: 'history-length',
    m: 'model',
    t: 'temperature',
    v: 'version',
    w: 'disable-word-wrap',
    x: 'max-tokens',
  },
});
export const DEFAULT_MODEL = 'gpt-3.5-turbo';
export const DEFAULT_TEMPERATURE = 1;
export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_HISTORY_LENGTH = 3;
export const DEFAULT_TOKEN_PRICE = 0.000002;

const deriveNum = (option, env, def, parse) =>
  (isNaN(parse(options[option], 10)) ? undefined : parse(options[option])) ??
  (isNaN(parse(process.env[env], 10)) ? undefined : parse(process.env[env], 10)) ??
  def;
const deriveInt = (option, env, def) => deriveNum(option, env, def, parseInt);
const deriveFloat = (option, env, def) => deriveNum(option, env, def, parseFloat);

export const openAIPricePerToken = process.env.OPENAI_USD_PRICE_PER_TOKEN || DEFAULT_TOKEN_PRICE;
export const openAIMaxTokens = deriveInt('max-tokens', 'OPENAI_MAX_TOKENS', DEFAULT_MAX_TOKENS);
export const openAITemperature = deriveFloat(
  'temperature',
  'OPENAI_TEMPERATURE',
  DEFAULT_TEMPERATURE
);
export const openAIModel = options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL;
export const historyLength = deriveInt(
  'history-length',
  'OPENAI_HISTORY_LENGTH',
  DEFAULT_HISTORY_LENGTH
);

export const conf = new Conf({ projectName: 'chatgpt-repl' });
