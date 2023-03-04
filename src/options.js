import minimist from 'minimist';

const options = minimist(process.argv.slice(2), {
  boolean: ['clipboard', 'disable-word-wrap'],
  alias: {
    c: 'clipboard',
    w: 'disable-word-wrap',
  },
});

export default options;
