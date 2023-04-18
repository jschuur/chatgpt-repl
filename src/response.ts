import { isAxiosError } from 'axios';
import pc from 'picocolors';
import prettyMilliseconds from 'pretty-ms';
import terminalSize from 'term-size';

import { conversation } from './conversation.js';
import { conf, settings } from './settings.js';
import { formatUsage } from './usage.js';
import { errorMsg, getErrorMessage, lengthWithoutColor, wrap } from './utils.js';

type ResponseData = {
  // TODO: refactor to remove any
  // response: AxiosResponse<CreateChatCompletionResponse, any>;
  response: any;
  startTime: number;
};

export const chatGPTPrompt = `${pc.cyan('ChatGPT')}: `;
let responseCol = lengthWithoutColor(chatGPTPrompt);

export const spinnerOptions = {
  discardStdin: false,
  prefixText: chatGPTPrompt,
  spinner: 'point',
} as const;

export function handleError(error: unknown) {
  if (error) {
    if (isAxiosError(error)) {
      const { response } = error;

      if (response) {
        if (response?.status === 401) {
          conf.delete('apiKey');
          errorMsg('Invalid API key. Please restart and enter a new one.');

          process.exit(1);
        } else
          errorMsg(
            `${response?.status}: ${response?.statusText} ${pc.dim(
              `(${getErrorMessage(error)})`
            )}\n`
          );
      }
    }
  } else errorMsg(`${getErrorMessage(error)}\n`);
}

export function showFinishReason(finishReason: string | undefined) {
  if (!finishReason || finishReason === 'stop') return;

  if (finishReason === 'length')
    console.log(pc.dim('Incomplete response due to hitting max_tokens or token limit.\n'));
  else if (finishReason === 'content_filter')
    console.log(pc.dim('Incomplete response due to content filter\n'));
  else console.log(pc.dim(`Unknown finish reason: ${pc.magenta(finishReason)}\n`));
}

export function responseHeader({ response, startTime }: ResponseData) {
  let responseText = `Response${settings.clipboard ? ' (copied to clipboard)' : ''} in ${pc.green(
    prettyMilliseconds(Date.now() - startTime)
  )}. `;

  // TODO: estimate by counting response chunks
  if (response) responseText += formatUsage(response);

  return pc.dim(responseText);
}

export function showLastResponse() {
  const { role, content: answer } = conversation[conversation.length - 1] || {};

  if (role !== 'assistant' || !answer) return errorMsg('No previous response to show.');

  const { columns } = terminalSize();

  const answerFormatted = settings.wordWrap
    ? wrap(`${pc.cyan('ChatGPT')}: ${answer}`, columns - 5)
    : answer;

  console.log(`${answerFormatted}\n`);
}

// display streamed in response chunks
export function showResponseChunk(chunk: string) {
  const { columns } = terminalSize();

  // skip newlines already present in the response
  chunk.split('\n').forEach((piece, index) => {
    if (index > 0 || (settings.wordWrap && responseCol + piece.length > columns - 5)) {
      console.log();
      responseCol = piece.length;

      // remove the leading space of a word if we've decided to wrap
      if (piece.startsWith(' ')) piece = piece.slice(1);
    }

    process.stdout.write(piece);
    responseCol += piece.length;
  });
}

export const resetResponseCol = () => (responseCol = 9);
