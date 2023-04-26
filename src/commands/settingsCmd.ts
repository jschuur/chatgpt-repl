import pc from 'picocolors';

import { INDENT_PADDING_BUFFER, settings } from '../settings.js';

export default function settingsCmd(str: string) {
  const padding = Math.max(...Object.keys(settings).map((c) => c.length)) + INDENT_PADDING_BUFFER;

  console.log(`\n${pc.green(str || 'Current settings:')}\n`);

  for (const [key, value] of Object.entries(settings))
    console.log(`  ${key.toLowerCase().padEnd(padding + 1)} ${pc.dim(String(value))}`);

  console.log();
}
