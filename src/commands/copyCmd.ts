import clipboard from 'node-clipboardy';
import pc from 'picocolors';
import pluralize from 'pluralize';
import wordcount from 'wordcount';

import { conversation } from '../conversation.js';

export default function copyLastResultCmd() {
  const lastMessage = conversation[conversation.length - 1];
  const wordCount = wordcount(lastMessage?.content || '');
  const characterCount = (lastMessage?.content || '').length;

  if (conversation.length < 3) console.warn('No previous response to copy.');
  else if (lastMessage?.role === 'assistant') {
    clipboard.writeSync(lastMessage.content);

    console.log(
      `Last response (${pluralize('word', wordCount, true)}, ${pluralize(
        'character',
        characterCount,
        true
      )}) copied to clipboard.`
    );
  } else {
    console.error(`${pc.red('Error')}: Unable to copy last response copied to clipboard.`);
  }
}
