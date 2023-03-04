#!/usr/bin/env node

import path from 'path';

import jsonfile from 'jsonfile';
import updateNotifier from 'update-notifier';
import 'dotenv/config';

import { chatLoop } from './loop.js';

const resolvePath = (p) => path.resolve(new URL('.', import.meta.url).pathname, p);

const packageJson = jsonfile.readFileSync(resolvePath('../package.json'));

(async () => {
  updateNotifier({ pkg: packageJson }).notify();

  chatLoop();
})();
