import { Configuration, OpenAIApi } from 'openai';

import { MAX_TOKENS } from './config.js';
import { addUsage } from './usage.js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export async function askChatGPT(question) {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [question],
      temperature: 0,
      max_tokens: MAX_TOKENS,
    });

    if (process.env.DEBUG) console.log(JSON.stringify(response.data, null, 2));

    addUsage(response?.data?.usage?.total_tokens);

    return response;
  } catch (error) {
    console.error(`Error querying OpenAI: ${error.message}`);

    process.exit(1);
  }
}
