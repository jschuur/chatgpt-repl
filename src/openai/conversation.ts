import { settings, updateSetting } from '../settings.js';

type ConversationRole = 'system' | 'user' | 'assistant';

type Conversation = {
  role: ConversationRole;
  content: string;
}[];

export let conversation: Conversation = [{ role: 'system', content: settings.system }];

export function updateConversation({ role, content }: { role: ConversationRole; content: string }) {
  const { historyLength } = settings;

  if (role === 'system') {
    updateSetting('system', content);
    clearConversation(false);
  } else {
    conversation.push({ role, content });

    if (role === 'assistant')
      conversation =
        historyLength <= 0
          ? [conversation[0]]
          : [conversation[0], ...conversation.slice(1).slice(-(2 * historyLength))];
  }
}

export function clearConversation(announce = true) {
  conversation = [{ role: 'system', content: settings.system }];

  if (announce) console.log('Current conversation history cleared.');
}
