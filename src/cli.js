#!/usr/bin/env node

import path from 'path';

import 'dotenv/config';
import jsonfile from 'jsonfile';
import updateNotifier from 'update-notifier';

import { chatLoop } from './loop.js';
import { apiKeyCheck } from './openai.js';

const resolvePath = (p) => path.resolve(new URL('.', import.meta.url).pathname, p);

const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

(async () => {
  updateNotifier({ pkg: packageJson }).notify();
  apiKeyCheck();

  chatLoop();
})();
