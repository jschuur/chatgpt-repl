import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import wrap from 'fast-word-wrap';
import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import pluralize from 'pluralize';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { MAX_TOKENS, options } from './settings.js';

import { askChatGPT } from './openai.js';
import { formatUsage, totalUsageCost, totalUsageTokens } from './usage.js';

function showAnswer(response) {
  const answer = response?.data?.choices[0]?.message?.content?.trim();
  const { columns } = terminalSize();

  if (!answer) return pc.red('\nNo answer received.\n');

  const answerFormatted = options['disable-word-wrap'] ? answer : wrap(answer, columns - 5);

  console.log(`\n${answerFormatted}`);

  return answer;
}

export async function chatLoop(apiKey) {
  const s = spinner();

  intro(`Interact with ChatGPT (MAX_TOKENS: ${MAX_TOKENS})`);

  while (true) {
    const question = await text({
      message: `Prompt? ${pc.dim('(Ctrl-C or enter to exit)')}`,
    });

    if (isCancel(question) || !question || question.trim().length === 0) break;

    const startTime = Date.now();

    s.start('Thinking...');
    const response = await askChatGPT({ role: 'user', content: question }, apiKey);

    const usage = formatUsage(response);

    s.stop(
      pc.dim(
        `Response${options?.clipboard ? ' (copied to clipboard)' : ''} in ${pc.green(
          prettyMilliseconds(Date.now() - startTime)
        )}. ${usage}`
      )
    );

    const answer = showAnswer(response);

    if (options?.clipboard) clipboard.writeSync(answer);
  }

  outro(
    `Session cost: ${pc.green(`$${totalUsageCost.toPrecision(1)}`)} (${pc.green(
      totalUsageTokens
    )} ${pluralize('token', totalUsageTokens, false)}). See you next time! 🤖`
  );
}
