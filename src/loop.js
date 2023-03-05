import { intro, isCancel, outro, spinner, text } from '@clack/prompts';
import wrap from 'fast-word-wrap';
import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { openAIMaxTokens, options } from './settings.js';

import { askChatGPT } from './openai.js';
import { formatTotalUsage, formatUsage } from './usage.js';

function showAnswer(response) {
  const answer = response?.data?.choices[0]?.message?.content?.trim();
  const { columns } = terminalSize();

  if (!answer) return pc.red('\nNo answer received.\n');

  const answerFormatted = options['disable-word-wrap'] ? answer : wrap(answer, columns - 5);

  console.log(`\n${answerFormatted}`);

  return answer;
}

export async function chatLoop() {
  const s = spinner();

  intro(`Interact with ChatGPT (Max tokens: ${openAIMaxTokens})`);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const question = await text({
      message: `Prompt? ${pc.dim('(Ctrl-C or enter to exit)')}`,
    });

    if (isCancel(question) || !question || question.trim().length === 0) break;

    const startTime = Date.now();

    s.start('Thinking...');
    const response = await askChatGPT(question);

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

  outro('See you next time! 🤖');

  const totalUsage = formatTotalUsage();
  console.log(totalUsage);
}
