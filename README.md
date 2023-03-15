# ChatGPT REPL

Simple ChatGPT interactive command line REPL, using [their API](https://platform.openai.com/docs/guides/chat) for per usage billing.

<p align="center">
  <img src="https://github.com/jschuur/chatgpt-repl/blob/main/screenshot.png?raw=true" alt="Screenshot of the chatgpt-repl shell command in action, replying with a reassuring haiku to the prompt 'write a haiku about benevolent AI overlords'">
</p>

An experiment inspired by [two](https://twitter.com/sandbags/status/1631933273487048704) [tweets](https://twitter.com/joostschuur/status/1631948339599093763).

## Install

```bash
npm install -g chatgpt-repl
```

## Usage

Get an [OpenAI API key](https://platform.openai.com/account/api-keys). Run `chatgpt-repl`. Provided API key when asked. Enter a ChatGPT prompt ('Should Pluto be a planet?'). Hit Ctrl-C or enter `.exit` to end the session when sufficiently filled with knowledge.

Use the up/down arrows to access previously entered prompts or [commands](#commands).

### What about GPT-4?

GPT-4 was [announced](https://openai.com/product/gpt-4) on March 14th, 2023 and API support for it started out with a waitlist. If it's available to you, it should work if you provide an [alternate model name](https://platform.openai.com/docs/models/gpt-4) via `--model gpt-4` (or `.model gpt-4`), since the chat completion API hasn't changed.

Note however that GPT-4's pricing appears to be [significantly higher](https://chatgpt4.ai/gpt-4-api-pricing/) than GPT-3's. The current API usage costs shown by this tool is based on GPT-3's pricing ([for now](https://github.com/jschuur/chatgpt-repl/issues/19)).

### Command line options:

- `-v, --version` Show version number
- `-h, --help` Show help

- `-c, --clipboard <boolean>` Enable/disable copying the latest response to the clipboard as it is shown
- `-k, --api-key <key>` Set (and save) OpenAI API key
- `-l, --history-length` Set [conversation history length](#controlling-conversation-context) (default: 3 or `OPENAI_HISTORY_LENGTH` env)
- `-m, --model` <model> Set the OpenAI [model](https://platform.openai.com/docs/api-reference/chat/create#chat/create-model) (default: gpt-3.5-turbo or `OPENAI_MODEL` env)
- `-t, --temperature` <num> Set the [temperature](https://platform.openai.com/docs/quickstart/adjust-your-settings) for more 'random' responses (default: 1 or `OPENAI_TEMPERATURE` env)
- `-s, --system` <text> Set the [system](https://platform.openai.com/docs/guides/chat/introduction) to set the tone of the response (default: 'You are a helpful assistant' or `OPENAI_SYSTEM` env)
- `-w, --word-wrap <boolean>` Enable/disable automatic word wrapping in response output
- `-x, --max-tokens <num>` Set the [max tokens](https://platform.openai.com/docs/guides/chat/managing-tokens) to use and control costs (default: 1024 or `OPENAI_MAX_TOKENS` env)

Defaults can be overridden with environment variables where indicated ('env').

### Open AI API costs

OpenAI API usage is paid after a free trial, but [extremely cheap](https://openai.com/pricing). 1,000 tokens (currently) cost $0.002 for the `gpt-3.5-turbo` model used by this tool by default. Each word in a question and response uses at least 1 token.

### Controlling conversation context

By default, the last 3 prompts/responses in a session are used in addition to a new prompt, to provide ChatGPT with additional context. This allows for follow-up prompts that reference a previous response, but also increases costs by using more API tokens.

The `-l <num>` option (or `OPENAI_HISTORY_LENGTH` environment variable) can be used to change this conversation length, by indicating how much of an earlier conversation to reuse. So `-l 0` would not send any previous conversation context back and `-l 1` would only use the most recent prompt/response for context.

Thus with a history length or zero, you couldn't ask 'What is the Sun?' and later 'How far away from the Earth is it?', since it would have no frame of reference for 'it'.

### Commands

Instead of entering a prompt, you can also use a number of commands to modify settings or perform other actions. Use `.help` for the full list:

- `.model`, `.temperature`, `.maxtokens`, `.historylength` or `.system` followed by a value will change a setting, or show it without a value
- `.settings` shows all the current settings
- `.reset` resets settings to when you launched the current session
- `.retry` reruns the last prompt with the latest settings
- `.last` shows the last response again without running it through ChatGPT again (applies new word wrap/clipboard settings)
- `.clear` clears the [conversation history](#controlling-conversation-context)
- `.copy` copies the last response to a prompt to your system clipboard
- `.clipboard` enabled/disabled clipboard copying for every response (off by default)
- `.wordwrap` enables/disables word wrapping for the response output (on by default)
- `.usage` shows current and total API usage
- `.exit` ends the current session

Values to set boolean fields can include `true`, `false`, `1`, `0`, `on`, `off` [etc](https://www.npmjs.com/package/boolean).

Hitting tab will attempt to complete a command.

## Even ChatGPT loves this!

When asked 'What are the benefits of a ChatGPT command line interface?', it wholeheartedly endorsed this tool:

> There are several benefits of ChatGPT command line interface, including:
>
> 1.  Faster and More Efficient Communication: With command line interface, users can communicate with the ChatGPT model much faster and efficiently than with a graphical interface.
>
> 2.  Improved Productivity: With command line interface, users can execute multiple commands in quick succession, which can help increase productivity.
>
> 3.  Ease of Use: Command line interface is generally easier to use for users who are familiar with the command line interface. The syntax, while it may look complicated for beginners, is generally quicker than using a graphical interface.
>
> 4.  Customizability: By using a command line interface, users can customize their experience with ChatGPT based on their needs and preferences.
>
> 5.  Script Automation: ChatGPT command line interface can be used to create scripts that can be used to automate certain tasks, which can help save time and increase productivity.

## Stack

Some of the libraries used: [clack](https://github.com/natemoo-re/clack/) for some of the prompt UI, [OpenAI Node.js library](https://github.com/openai/openai-node) to interact with the ChatGPT API, [node-clipboardy](https://www.npmjs.com/package/node-clipboardy) to copy responses to the system clipboard.

\- [Joost Schuur](https://joostschuur.com) ([@joostschuur](https://twitter.com/joostschuur))
