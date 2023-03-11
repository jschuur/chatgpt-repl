#!/usr/bin/env node

import 'dotenv/config';
import pc from 'picocolors';
import updateNotifier from 'update-notifier';

import { chatLoop } from './loop.js';
import { apiKeyCheck } from './openai.js';
import { packageJson } from './settings.js';

(async () => {
  try {
    updateNotifier({ pkg: packageJson }).notify();

    await apiKeyCheck();

    chatLoop();
  } catch (error) {
    console.error(`${pc.red('Error')}: ${error.message}`);

    process.exit(1);
  }
})();
