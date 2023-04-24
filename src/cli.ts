#!/usr/bin/env node

import 'dotenv/config';
import pc from 'picocolors';
import updateNotifier from 'update-notifier';

import { COMMAND_PREFIX } from './commands/commands.js';
import { chatLoop } from './loop.js';
import { modelListCheck } from './openai/models.js';
import { apiKeyCheck } from './openai/openai.js';
import { packageJson, settings } from './settings.js';
import { getErrorMessage } from './utils.js';

function showHeader() {
  console.log(
    `ChatGPT REPL v${packageJson.version} (model: ${pc.magenta(
      settings.model
    )}, max tokens: ${pc.magenta(settings.maxTokens)})`
  );
  console.log(
    pc.dim(`Ctrl-C or ${COMMAND_PREFIX}exit to exit, ${COMMAND_PREFIX}help for more commands\n`)
  );
}

(async () => {
  try {
    updateNotifier({ pkg: packageJson }).notify();

    await apiKeyCheck();
    await modelListCheck();

    showHeader();
    chatLoop();
  } catch (error) {
    console.error(`${pc.red('Error')}: ${getErrorMessage(error)}`);

    process.exit(1);
  }
})();
