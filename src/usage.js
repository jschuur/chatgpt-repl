import md5 from 'md5';
import pc from 'picocolors';
import pluralize from 'pluralize';

import { apiKey } from './openai.js';
import { conf, openAIPricePerToken } from './settings.js';

export let sessionUsageTokens = 0;
export let sessionUsageCost = 0.0;

function costByTokens(tokens) {
  return tokens * openAIPricePerToken;
}

export function addUsage(tokens) {
  if (!tokens) return;

  sessionUsageTokens += tokens;
  sessionUsageCost += costByTokens(tokens);

  const totalUsages = conf.get('totalUsage') || {};
  const keyHash = md5(apiKey);
  const keyUsage = totalUsages?.[keyHash] || 0;

  const newTotal = keyUsage + tokens;
  totalUsages[keyHash] = newTotal;

  conf.set('totalUsage', totalUsages);

  return sessionUsageTokens;
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
  )} total tokens: ${pc.green(total_tokens)}, prompt: ${pc.green(
    prompt_tokens
  )}, completion: ${pc.green(completion_tokens)}.`;
}

export function formatTotalUsage() {
  const totalUsages = conf.get('totalUsage') || {};
  const keyHash = md5(apiKey);
  const totalKeyUsage = totalUsages?.[keyHash] || 0;

  return (
    `Session cost: ${pc.green(`$${sessionUsageCost.toPrecision(1)}`)} (${pc.green(
      sessionUsageTokens
    )} ${pluralize('token', sessionUsageTokens, false)})\n` +
    `Total cost:   ${pc.green(`$${costByTokens(totalKeyUsage).toPrecision(1)}`)} (${pc.green(
      totalKeyUsage
    )} ${pluralize('token', sessionUsageTokens, false)})`
  );
}
