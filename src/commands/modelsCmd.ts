import pc from 'picocolors';

import { settings } from '../settings.js';
import { KNOWN_MODELS } from '../validate.js';

export default function modelsCmd() {
  console.log('\nSupported ChatGPT models:\n');

  KNOWN_MODELS.forEach((model) =>
    console.log(settings.model === model ? pc.magenta(`  ${model} (selected)`) : `  ${model}`)
  );

  console.log();
}
