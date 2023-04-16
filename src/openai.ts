import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import { isAxiosError } from 'axios';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import pc from 'picocolors';

import { conversation, updateConversation } from './conversation.js';
import { conf, settings } from './settings.js';
import { addUsage } from './usage.js';
import { errorMsg, getErrorMessage } from './utils.js';

let openai: OpenAIApi;

export let apiKey = '';

export function handleError(error: unknown) {
  if (error) {
    if (isAxiosError(error)) {
      const { response } = error;

      if (response) {
        if (response?.status === 401) {
          conf.delete('apiKey');
          errorMsg('Invalid API key. Please restart and enter a new one.');

          process.exit(1);
        } else
          errorMsg(
            `${response?.status}: ${response?.statusText} ${pc.dim(
              `(${getErrorMessage(error)})`
            )}\n`
          );
      }
    }
  } else errorMsg(`${getErrorMessage(error)}\n`);
}

function initOpenAI(key: string) {
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

async function validateApiKey(key: string) {
  try {
    initOpenAI(key);

    await openai.listModels();
  } catch (error) {
    handleError(error);
  }
}

export async function apiKeyCheck() {
  let key = String(conf.get('apiKey', settings.apiKey));

  // validate keys not previously used/saved (options override saved key)
  if (!key) {
    key = await inputApiKey();
    await validateApiKey(key);

    // don't overwrite a saved key when commander set settings.apiKey via.env()
    if (!process.env.OPENAI_API_KEY) conf.set('apiKey', key);
  }

  if (!openai) initOpenAI(key);
}

export async function askChatGPT(question: string) {
  const { model, temperature, maxTokens } = settings;

  updateConversation({ role: 'user', content: question });

  const params = {
    model,
    messages: conversation,
    temperature,
    max_tokens: maxTokens,
  } as CreateChatCompletionRequest;

  const response = await openai.createChatCompletion(params);

  addUsage(response?.data?.usage?.total_tokens);

  const { message: { content: answer = undefined } = {}, finish_reason: finishReason } =
    response?.data?.choices?.[0] || {};
  if (answer) updateConversation({ role: 'assistant', content: answer });

  return { answer, finishReason, response };
}
