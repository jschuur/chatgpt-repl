import pc from 'picocolors';

import { apiKey } from '../openai.js';
import { formatTotalUsage } from '../usage.js';

export default function usageCmd() {
  console.log(
    `\n${pc.green(`Usage for current API Key (...${pc.dim((apiKey || '').slice(-6))}):`)}\n`
  );
  console.log(formatTotalUsage());
  console.log();
}
