import { confirm, intro, isCancel, outro, text } from '@clack/prompts';
import clipboard from 'node-clipboardy';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import ora, { Ora } from 'ora';
import pc from 'picocolors';
import { fetchStreamedChatContent } from 'streamed-chatgpt-api';

import { rl } from '../loop.js';
import { conf, settings } from '../settings.js';
import { addUsage } from '../usage.js';
import { conversation, updateConversation } from './conversation.js';
import {
  chatGPTPrompt,
  handleError,
  resetResponseCol,
  responseHeader,
  showLastResponse,
  showResponseChunk,
  spinnerOptions,
} from './response.js';

export let openai: OpenAIApi;

type ChatGPTResult = {
  response?: any;
  finishReason?: string;
  answer?: string;
  error?: any;
  cancelled?: boolean;
};

export let apiKey = '';

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
  let key = conf.get('apiKey', settings.apiKey || '');

  // validate keys not previously used/saved (options override saved key)
  if (!key) {
    key = await inputApiKey();
    await validateApiKey(key);

    // don't overwrite a saved key when commander set settings.apiKey via.env()
    if (!process.env.CHATGPTREPL_APIKEY) conf.set('apiKey', key);
  }

  if (!openai) initOpenAI(key);
}

async function chatCompletionStreamed(params: any): Promise<ChatGPTResult> {
  return new Promise((resolve, reject) => {
    let answer = '';
    let cancelled = false;
    const spinner = ora(spinnerOptions).start();

    const markCancelled = () => (cancelled = true);

    rl.on('SIGINT', markCancelled);

    fetchStreamedChatContent(
      { apiKey, ...params },
      (content: string, reader: ReadableStreamDefaultReader) => {
        // onResponse
        if (spinner.isSpinning) {
          spinner.stop();
          process.stdout.write(chatGPTPrompt);
        }

        // TODO: handle cancellation sooner than next chunk
        if (cancelled) reader.cancel();
        else {
          showResponseChunk(content);
          answer += content;
        }
      },
      () => {
        // onFinish
        rl.off('SIGINT', markCancelled);

        if (cancelled)
          process.stdout.write(pc.yellow(`${answer ? ' ...\n' : ''}Response cancelled\n\n`));
        else process.stdout.write('\n\n');

        resolve({ answer, cancelled });
      },
      (error: any) => {
        // onError
        reject({ error });
      }
    );
  });
}

async function chatCompletionAsync(params: CreateChatCompletionRequest): Promise<ChatGPTResult> {
  let spinner: Ora | undefined;
  const controller = new AbortController();
  let cancelled = false;

  const stopRequest = () => controller.abort();

  try {
    spinner = ora(spinnerOptions).start();

    rl.on('SIGINT', stopRequest);

    const response = await openai.createChatCompletion(params, { signal: controller.signal });
    spinner.stop();

    addUsage(response?.data?.usage?.total_tokens);

    // TODO: bring finishReason back
    const { message: { content: answer = undefined } = {} } = response?.data?.choices?.[0] || {};

    rl.off('SIGINT', stopRequest);

    return { answer, response, cancelled };
  } catch (error: any) {
    if (spinner) spinner.stop();

    if (error.constructor.name === 'Cancel') {
      process.stdout.write(`${chatGPTPrompt}${pc.yellow('Response cancelled\n\n')}`);
      cancelled = true;
    } else handleError(error);

    rl.off('SIGINT', stopRequest);

    return { answer: undefined, response: undefined, cancelled };
  }
}

export async function askChatGPT(question: string) {
  const { model, temperature, maxTokens, stream } = settings;

  const startTime = Date.now();
  const params = {
    model,
    temperature,
  } as CreateChatCompletionRequest;

  console.log();
  updateConversation({ role: 'user', content: question });

  const { answer, response, cancelled } = stream
    ? await chatCompletionStreamed({
        ...params,
        messageInput: conversation,
        maxTokens,
        stream: true,
      })
    : await chatCompletionAsync({
        ...params,
        max_tokens: maxTokens,
        messages: conversation,
      });

  if (answer) {
    updateConversation({ role: 'assistant', content: answer });

    if (stream) resetResponseCol();
    else showLastResponse();

    if (settings.clipboard && !cancelled) clipboard.writeSync(answer);
  }

  // showFinishReason(finishReason);

  console.log(responseHeader({ response, startTime, cancelled }));
  console.log();
}
