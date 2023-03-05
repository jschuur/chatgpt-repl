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

Get an [OpenAI API key](https://platform.openai.com/account/api-keys). Run `chatgpt-repl`. Provided API key when asked. Enter a ChatGPT prompt ('Should Pluto be a planet?'). Hit Ctrl-C or enter to exit when sufficiently filled with knowledge.

## Open AI API costs

OpenAI API usage is paid after a free trial, but [extremely cheap](https://openai.com/pricing). 1,000 tokens (currently) cost $0.002 for the `gpt-3.5-turbo` model used by this tool by default. Each word in a question and response uses at least 1 token.

Command line options:

- `-v, --version` Show version number
- `-h, --help` Show help
- `-k, --api-key <key>` Set (and save) OpenAI API key
- `-c, --clipboard` Copy responses to clipboard
- `-w, --disable-word-wrap` Disable word wrap
- `-x, --max-tokens <num>` Max tokens (default: 1024)
- `-m, --model` <model> Set Model (default: gpt-3.5-turbo)
- `-t, --temperature` <num> Temperature (default: 1)

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

Some of the tech used: [clack](https://github.com/natemoo-re/clack/) for prompt UI, [OpenAI Node.js library](https://github.com/openai/openai-node) to interact with the ChatGPT API, [node-clipboardy](https://www.npmjs.com/package/node-clipboardy) to copy responses to the system clipboard.

\- [Joost Schuur](https://joostschuur.com) ([@joostschuur](https://twitter.com/joostschuur))
