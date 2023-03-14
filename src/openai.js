import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import { Configuration, OpenAIApi } from 'openai';
import pc from 'picocolors';

import { conf, settings, updateSetting } from './settings.js';
import { addUsage } from './usage.js';

let openai;

export let apiKey;
export let conversation = [{ role: 'system', content: settings.system }];

function initOpenAI(key) {
  apiKey = key;
  const configuration = new Configuration({ apiKey });

  openai = new OpenAIApi(configuration);
}

async function inputApiKey() {
  intro('No OpenAI API key found. Create one at https://platform.openai.com/account/api-keys');

  const key = await text({
    message: 'Enter your API Key',
  });

  if (isCancel(key) || !key || key.trim().length === 0) throw new Error('No API key provided.');

  const saveApiKey = await confirm({
    message: 'Save API key for future use?',
  });
  if (saveApiKey) conf.set('apiKey', key);

  outro('API key saved.');

  return key;
}

async function validateApiKey(key) {
  try {
    initOpenAI(key);

    await openai.listModels();
  } catch ({ response }) {
    if (response?.status === 401) {
      console.error(`${pc.red('Error')}: Invalid API key. Please restart and use a different one.`);

      process.exit(1);
    }
  }
}

export async function apiKeyCheck() {
  let key = conf.get('apiKey');

  // validate keys not previously used/saved (options override saved key)
  if (!key || settings.apiKey) {
    key = settings.apiKey || (await inputApiKey());
    await validateApiKey(key);

    // don't overwrite a saved key when commander set settings.apiKey via.env()
    if (!process.env.OPENAI_API_KEY) conf.set('apiKey', key);
  }

  if (!openai) initOpenAI(key);
}

export function updateConversation({ role, content }) {
  const { historyLength } = settings;

  if (role === 'system') {
    conversation[0].content = content;
    updateSetting('system', content);
  } else {
    conversation.push({ role, content });

    if (role === 'assistant')
      conversation =
        historyLength <= 0
          ? [conversation[0]]
          : [conversation[0], ...conversation.slice(1).slice(-(2 * historyLength))];
  }
}

export function clearConversation() {
  conversation = [{ role: 'system', content: settings.system }];

  console.log('Current conversation history cleared.');
}

export async function askChatGPT(question) {
  const { model, temperature, maxTokens } = settings;

  updateConversation({ role: 'user', content: question });

  const params = {
    model,
    messages: conversation,
    temperature,
    max_tokens: maxTokens,
  };

  const response = await openai.createChatCompletion(params);

  addUsage(response?.data?.usage?.total_tokens);

  const answer = response?.data?.choices?.[0]?.message?.content;
  if (answer) updateConversation({ role: 'assistant', content: answer });

  return response;
}
