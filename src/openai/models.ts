import ora from 'ora';
import pc from 'picocolors';

import { MODEL_CACHE_TIME_MINUTES, conf, settings } from '../settings.js';
import { openai } from './openai.js';

export let chatCompletionModels: string[] = [];
export let otherOpenAIModels: string[] = [];
export let lastUpdated: number;

export async function updateModelList() {
  const cachedModelData = conf.get('models');

  const spinner = ora({
    discardStdin: false,
    spinner: 'point',
  }).start('Updating model list from OpenAI API...');

  const models = (await openai.listModels())?.data?.data;

  if (!models?.length) {
    spinner.fail('Model list update failed');
    throw new Error('Unable to retrieve model list from OpenAI API.');
  }

  spinner.succeed('Model list updated');

  // the model list doesn't really tell us which models are supported by the Chat Completions API, so assume by 'gpt' prefix
  chatCompletionModels = models
    .filter((model) => model.id.startsWith('gpt'))
    .map((model) => model.id);
  otherOpenAIModels = models
    .filter((model) => !model.id.startsWith('gpt'))
    .map((model) => model.id);
  lastUpdated = Date.now();

  const addedModels = chatCompletionModels.filter(
    (model) => !cachedModelData?.chatCompletionModels.includes(model)
  );
  if (addedModels?.length)
    console.info(
      `${pc.green('New')}: ChatGPT models added by OpenAI: ${addedModels
        .map((m) => pc.magenta(m))
        .join(', ')}`
    );

  const removedModels = cachedModelData?.chatCompletionModels.filter(
    (model) => !chatCompletionModels.includes(model)
  );
  if (removedModels?.length)
    console.warn(
      `${pc.yellow('Update')}: ChatGPT models removed by OpenAI: ${removedModels
        .map((m) => pc.magenta(m))
        .join(', ')}`
    );

  if (!chatCompletionModels.length)
    throw new Error('No OpenAI Chat Completion compatible models found).');

  conf.set('models', { chatCompletionModels, otherOpenAIModels, lastUpdated });
}

export async function modelListCheck() {
  const cachedModelData = conf.get('models');

  if (!cachedModelData || Date.now() - cachedModelData?.lastUpdated > MODEL_CACHE_TIME_MINUTES)
    await updateModelList();
  else ({ chatCompletionModels, otherOpenAIModels, lastUpdated } = cachedModelData);

  if (!chatCompletionModels.includes(settings.model))
    console.warn(
      `${pc.yellow('Warning')}: The selected model ${pc.magenta(
        settings.model
      )} is not supported by the OpenAI Chat Completions API.\n`
    );
}
