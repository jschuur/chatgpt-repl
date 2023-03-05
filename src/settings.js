import Conf from 'conf';
import minimist from 'minimist';

export const options = minimist(process.argv.slice(2), {
  boolean: ['clipboard', 'disable-word-wrap', 'help', 'version'],
  string: ['api-key', 'model'],
  alias: {
    c: 'clipboard',
    h: 'help',
    k: 'api-key',
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

export const openAIPricePerToken = process.env.OPENAI_USD_PRICE_PER_TOKEN || 0.000002;
export const openAIMaxTokens =
  options['max-tokens'] || parseInt(process.env.OPENAI_MAX_TOKENS, 10) || DEFAULT_MAX_TOKENS;
export const openAITemperature =
  options.temperature || process.env.OPENAI_TEMPERATURE || DEFAULT_TEMPERATURE;
export const openAIModel = options.model || process.env.OPENAI_MODEL || DEFAULT_MODEL;

export const conf = new Conf({ projectName: 'chatgpt-repl' });
