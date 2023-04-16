import { conversation } from '../conversation.js';

export default function retryCmd() {
  if (conversation.length < 3) console.warn('No previous response to retry.');
  else return conversation[conversation.length - 2]?.content;
}
