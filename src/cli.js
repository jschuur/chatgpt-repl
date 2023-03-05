#!/usr/bin/env node

import path from 'path';

import 'dotenv/config';
import jsonfile from 'jsonfile';
import pc from 'picocolors';
import updateNotifier from 'update-notifier';

import { chatLoop } from './loop.js';
import { apiKeyCheck } from './openai.js';
import { DEFAULT_MAX_TOKENS, DEFAULT_MODEL, DEFAULT_TEMPERATURE, options } from './settings.js';

const resolvePath = (p) => path.resolve(new URL('.', import.meta.url).pathname, p);

const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

function showHelp() {
  console.log(`ChatGPT REPL interactive command line tool, v${packageJson.version}\n
${pc.green('Usage:')}
  $ chatgpt [options]

${pc.green('Options:')}
  ${pc.dim('-v, --version')}              Show version number
  ${pc.dim('-h, --help')}                 Show help
  ${pc.dim('-k, --api-key')}              Set (and save) OpenAI API key
  ${pc.dim('-c, --clipboard')}            Copy responses to clipboard
  ${pc.dim('-w, --disable-word-wrap')}    Disable word wrap
  ${pc.dim('-x, --max-tokens <num>')}     Max tokens (default: ${DEFAULT_MAX_TOKENS})
  ${pc.dim('-m, --model <model>')}        Set Model (default: ${DEFAULT_MODEL})
  ${pc.dim('-t, --temperature <num>')}    Temperature (default: ${DEFAULT_TEMPERATURE})
  `);

  process.exit(0);
}

function showVersion() {
  console.log(`ChatGPT REPL v${packageJson.version}`);

  process.exit(0);
}

(async () => {
  try {
    updateNotifier({ pkg: packageJson }).notify();

    if (options.help) showHelp();
    if (options.version) showVersion();

    await apiKeyCheck();

    chatLoop();
  } catch (error) {
    console.error(`${pc.red('Error')}: ${error.message}`);

    process.exit(1);
  }
})();
