import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import { Configuration, OpenAIApi } from 'openai';
import pc from 'picocolors';

import { conf, openAIMaxTokens, openAIModel, openAITemperature, options } from './settings.js';
import { addUsage } from './usage.js';

let openai;

export let apiKey;

const conversation = [{ role: 'system', content: 'You are a helpful assistant.' }];

function initOpenAI() {
  const configuration = new Configuration({ apiKey });

  openai = new OpenAIApi(configuration);
}

async function inputApiKey() {
  intro('No OpenAI API key found. Create one at https://platform.openai.com/account/api-keys');

  const apiKey = await text({
    message: 'Enter your API Key',
  });

  if (isCancel(apiKey) || !apiKey || apiKey.trim().length === 0)
    throw new Error('No API key provided.');

  const saveApiKey = await confirm({
    message: 'Save API key for future use?',
  });
  if (saveApiKey) conf.set('apiKey', apiKey);

  outro('API key saved.');

  return apiKey;
}

export async function apiKeyCheck() {
  apiKey =
    process.env.OPENAI_API_KEY ||
    options?.['api-key'] ||
    conf.get('apiKey') ||
    (await inputApiKey());

  if (options?.['api-key']) conf.set('apiKey', apiKey);

  initOpenAI(apiKey);
}

function updateConversation({ role, content }) {
  conversation.push({ role, content });

  if (process.env.DEBUG) console.log({ conversation });
}

export async function askChatGPT(question) {
  let response;

  updateConversation({ role: 'user', content: question });

  try {
    response = await openai.createChatCompletion({
      model: openAIModel,
      messages: conversation,
      temperature: openAITemperature,
      max_tokens: openAIMaxTokens,
    });

    if (process.env.DEBUG) console.log(JSON.stringify(response.data, null, 2));

    addUsage(response?.data?.usage?.total_tokens);

    const answer = response?.data?.choices[0]?.message?.content;
    if (answer) updateConversation({ role: 'assistant', content: answer });

    return response;
  } catch (error) {
    if (error?.response?.status === 401) {
      conf.delete('apiKey');
      console.log('\nInvalid API key. Please restart and enter a new one.');

      process.exit(1);
    } else console.error(`${pc.red('Error')}: ${error.message}`);
  }
}
