import Conf from 'conf';
import minimist from 'minimist';

export const USD_PRICE_PER_TOKEN = 0.000002;
export const MAX_TOKENS = 100;

export const options = minimist(process.argv.slice(2), {
  boolean: ['clipboard', 'disable-word-wrap'],
  string: ['api-key'],
  alias: {
    c: 'clipboard',
    w: 'disable-word-wrap',
    k: 'api-key',
  },
});

export const conf = new Conf({ projectName: 'chatgpt-repl' });
