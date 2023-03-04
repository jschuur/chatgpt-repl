# ChatGPT REPL

ChatGPT interactive command line REPL, using [their API](https://platform.openai.com/docs/guides/chat) for per usage billing.

<p align="center">
  <img src="https://github.com/jschuur/chatgpt-repl/blob/main/screenshot.png?raw=true" alt="Screenshot of the chatgpt-repl shell command in action, replying with a reassuring haiku to the prompt 'write a haiku about benevolent AI overlords'">
</p>

An experiment inspired by [two](https://twitter.com/sandbags/status/1631933273487048704) [tweets](https://twitter.com/joostschuur/status/1631948339599093763).

## Install

```bash
npm install -g chatgpt-repl
```

## Usage

Get an [OpenAI API key](https://platform.openai.com/account/api-keys). Run `chatgpt-repl`. Provided API key when asked. Ask ChatGPT questions. Hit Ctrl-C or enter to exit.

Note: OpenAI API usage is paid after a free trial, but [extremely cheap](https://openai.com/pricing). 1,000 tokens (currently) cost $0.002 for the `gpt-3.5-turbo` model used by this tool. Each word in a question and response uses at least 1 token.

Command line options:

- `-c` Copy each answer to the clipboard
- `-w` Disable automatic word wrapping
- `-k APIKEY` Set (and save for future use) the OpenAI API key

\- [Joost Schuur](https://joostschuur.com) ([@joostschuur](https://twitter.com/joostschuur))
