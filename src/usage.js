import pc from 'picocolors';

import { USD_PRICE_PER_TOKEN } from './config.js';

export let totalUsageTokens = 0;
export let totalUsageCost = 0.0;

function costByTokens(tokens) {
  return tokens * USD_PRICE_PER_TOKEN;
}

export function addUsage(tokens) {
  if (!tokens) return;

  totalUsageTokens += tokens;
  totalUsageCost += costByTokens(tokens);

  return totalUsageTokens;
}

export function formatUsage(response) {
  if (!response?.data?.usage) return 'unknown';

  const {
    data: {
      usage: { prompt_tokens, completion_tokens, total_tokens },
    },
  } = response;

  return `Cost: ${pc.green(
    `$${costByTokens(total_tokens).toPrecision(1)}`
  )} total tokens: ${pc.green(total_tokens)} prompt ${pc.green(
    prompt_tokens
  )}, completion ${pc.green(completion_tokens)}.`;
}
