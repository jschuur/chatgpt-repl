# ChatGPT REPL

Bringing ChatGPT to your shell by using [their API](https://platform.openai.com/docs/guides/chat) for per usage billing.

An experiment inspired by [two](https://twitter.com/sandbags/status/1631933273487048704) [tweets](https://twitter.com/joostschuur/status/1631948339599093763).

## Install

```bash
npm install -g chatgpt-repl
```

## Usage

Set an `OPENAI_API_KEY` environment variable. Run `chatgpt-repl`.

Command line options:

- `-c` Copy each answer to the clipboard
- `-w` Disable automatic word wrapping

\- [Joost Schuur](https://joostschuur.com) ([@joostschuur](https://twitter.com/joostschuur))
