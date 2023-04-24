import pc from 'picocolors';

import { chatCompletionModels, lastUpdated, updateModelList } from '../openai/models.js';
import { settings } from '../settings.js';

export default async function modelsCmd(subcommand: string) {
  if (subcommand === 'update') await updateModelList();

  console.log('\nSupported ChatGPT models:\n');

  chatCompletionModels.forEach((model) =>
    console.log(settings.model === model ? pc.magenta(`  ${model} (selected)`) : `  ${model}`)
  );

  console.log(
    `\nLocal models list last updated ${pc.magenta(
      new Date(lastUpdated).toLocaleString()
    )}. Run '.models update' to force an update.\n`
  );
}
