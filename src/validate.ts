import { boolean, isBooleanable } from 'boolean';
import pc from 'picocolors';
import { z } from 'zod';
import { chatCompletionModels, otherOpenAIModels } from './openai/models.js';

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
    if (otherOpenAIModels.length && otherOpenAIModels.includes(model))
      throw new Error(
        `'${model}' is not supported by the OpenAI Chat Completions API. Run '.models' command for the supported list.`
      );

    if (chatCompletionModels.length && !chatCompletionModels.includes(model))
      console.log(
        `${pc.yellow(
          'Warning'
        )}: '${model}' is not a know model for the OpenAI Chat Completions API. Use at your own risk or run '.models update' to force an update of the supported list.`
      );

    return true;
  });
