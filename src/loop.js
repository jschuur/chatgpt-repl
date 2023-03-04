import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import wrap from 'fast-word-wrap';
import pc from 'picocolors';
import pluralize from 'pluralize';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { MAX_TOKENS } from './config.js';

import { askChatGPT } from './openai.js';
import { formatUsage, totalUsageCost, totalUsageTokens } from './usage.js';

function showAnswer(response) {
  const answer = response?.data?.choices[0]?.message?.content;
  const { columns } = terminalSize();

  const answerText = answer
    ? wrap(answer.trim(), columns - 5).trim()
    : pc.red('No answer received.');

  console.log(`\n${answerText}\n`);
}

export async function chatLoop() {
  const s = spinner();

  intro(
    `Interact with ChatGPT (MAX_TOKENS: ${MAX_TOKENS} Ctrl-C or enter to end the conversation)...`
  );

  while (true) {
    const question = await text({
      message: 'Prompt?',
    });

    if (isCancel(question) || !question || question.trim().length === 0) break;

    const startTime = Date.now();

    s.start('Thinking...');
    const response = await askChatGPT({ role: 'user', content: question });

    const usage = formatUsage(response);

    s.stop(pc.dim(`Response in ${pc.green(prettyMilliseconds(Date.now() - startTime))}. ${usage}`));

    showAnswer(response);
  }

  outro(
    `Session cost: ${pc.green(`$${totalUsageCost.toPrecision(1)}`)} (${pc.green(
      totalUsageTokens
    )} ${pluralize('token', totalUsageTokens, false)}). See you next time! 🤖`
  );
}
