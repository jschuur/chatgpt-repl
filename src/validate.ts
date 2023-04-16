import { boolean, isBooleanable } from 'boolean';
import pc from 'picocolors';
import { z } from 'zod';

export const KNOWN_MODELS = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-0301',
  'gpt-4',
  'gpt-4-0314',
  'gpt-4-32k',
  'gpt-4-32k-0314',
];
export const UNSUPPORTED_MODELS = [
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

// zod helpers to enforce integer, floats and flexible boolean string value
export const zodInt = () =>
  z.preprocess((v) => parseFloat(z.coerce.string().parse(v)), z.number().int());
export const zodFloat = () =>
  z.preprocess((v) => parseFloat(z.coerce.string().parse(v)), z.number());

export const zodBoolean = () =>
  z.preprocess(
    (value) =>
      isBooleanable(value)
        ? boolean(value)
        : new z.ZodError([
            {
              fatal: true,
              message: 'Not a boolean',
              path: [''],
              code: 'invalid_type',
              expected: 'boolean',
              received: 'string',
            },
          ]),
    z.boolean()
  );

export const zodModel = () =>
  z.string().refine((model) => {
    if (UNSUPPORTED_MODELS.includes(model))
      throw new Error(
        `'${model}' is not supported by the OpenAI Chat Completions API. See the list at https://platform.openai.com/docs/models/overview.`
      );

    if (!KNOWN_MODELS.includes(model))
      console.log(
        `${pc.yellow(
          'Warning'
        )}: '${model}' is not a know model for the OpenAI Chat Completions API. Use at your own risk. See the list at https://platform.openai.com/docs/models/overview.`
      );

    return true;
  });
