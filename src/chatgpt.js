#!/usr/bin/env node

import path from 'path';

import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import jsonfile from 'jsonfile';
import updateNotifier from 'update-notifier';

const packageJson = jsonfile.readFileSync(
  path.resolve(new URL('.', import.meta.url).pathname, '../package.json')
);

// mock function to simulate a call to ChatGPT
const askChatGPT = (question) =>
  new Promise((resolve) => {
    setTimeout(() => resolve('<answer>'), 500);
  });

async function chatLoop() {
  const s = spinner();

  intro(`Let's talk to ChatGPT (Ctrl-C or enter to end the conversation)...`);

  while (true) {
    const question = await text({
      message: 'How can I help?',
    });

    if (isCancel(question) || !question || question.trim().length === 0) break;

    s.start('Thinking...');
    const answer = await askChatGPT(question);

    s.stop(`Response: ${answer}`);
  }

  outro('Tokens used: X ($0.0Y cost). See you next time!');
}

(async () => {
  updateNotifier({ pkg: packageJson }).notify();

  chatLoop();
})();
