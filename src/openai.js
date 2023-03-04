import { intro, isCancel, outro, text, confirm } from '@clack/prompts';
import { Configuration, OpenAIApi } from 'openai';
import pc from 'picocolors';

import { conf, MAX_TOKENS, options } from './settings.js';
import { addUsage } from './usage.js';

let openai;

function initOpenAI(apiKey) {
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
  const apiKey =
    process.env.OPENAI_API_KEY ||
    options?.['api-key'] ||
    conf.get('apiKey') ||
    (await inputApiKey());

  if (options?.['api-key']) conf.set('apiKey', apiKey);

  initOpenAI(apiKey);
}

export async function askChatGPT(question) {
  let response;

  try {
    response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [question],
      temperature: 0,
      max_tokens: MAX_TOKENS,
    });

    if (process.env.DEBUG) console.log(JSON.stringify(response.data, null, 2));

    addUsage(response?.data?.usage?.total_tokens);

    return response;
  } catch (error) {
    if (error?.response?.status === 401) {
      conf.delete('apiKey');
      console.log('\nInvalid API key. Please restart and enter a new one.');

      process.exit(1);
    }

    console.error(`${pc.red('Error')}: ${error.message}`);
  }
}
