import { boolean, isBooleanable } from 'boolean';
import pc from 'picocolors';

import { InvalidOptionArgumentError } from 'commander';

export const KNOWN_MODELS = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0301',
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-32k',
  'gpt-4-32k-0314',
];
const UNSUPPORTED_MODELS = [
  'text-davinci-003',
  'text-davinci-002',
  'text-davinci-edit-001',
  'code-davinci-edit-001',
  'whisper-1',
  'text-curie-001',
  'text-babbage-001',
  'text-ada-001',
  'davinci',
  'curie',
  'babbage',
  'ada',
  'text-embedding-ada-002',
  'text-search-ada-doc-001',
  'text-moderation-stable',
  'text-moderation-latest',
];

export function validateIntOption(value, message) {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) throw new InvalidOptionArgumentError(message);

  return num;
}

export function validateFloatOption(value, message) {
  const num = parseFloat(value);
  if (Number.isNaN(num)) throw new InvalidOptionArgumentError(message);

  return num;
}

export function validateModel(model) {
  if (!model) throw new InvalidOptionArgumentError('Model must not be empty');

  if (UNSUPPORTED_MODELS.includes(model))
    throw new InvalidOptionArgumentError(
      `Model ${model} is not supported, only chat completion models (${KNOWN_MODELS.join(
        ', '
      )}) can be used at this time.`
    );

  if (!KNOWN_MODELS.includes(model))
    console.warn(
      `${pc.yellow(
        'Warning'
      )}: '${model}' is not a known OpenAI model for chat completions. Use at your own risk.\n`
    );

  return model;
}

export function validateBooleanOption(value, message) {
  if (!isBooleanable(value)) throw new InvalidOptionArgumentError(message);

  return boolean(value);
}
