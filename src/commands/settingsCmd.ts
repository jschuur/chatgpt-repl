import pc from 'picocolors';

import { indentPadding, settings } from '../settings.js';

export default function settingsCmd(str: string) {
  console.log(`\n${pc.green(str || 'Current settings:')}\n`);

  for (const [key, value] of Object.entries(settings))
    console.log(`  ${key.toLowerCase().padEnd(indentPadding + 1)} ${pc.dim(String(value))}`);

  console.log();
}
