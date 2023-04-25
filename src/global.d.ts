declare module 'wordcount';
declare module 'node-clipboardy';
declare module 'picocolors';
declare module 'streamed-chatgpt-api';

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    OPENAI_USD_PRICE_PER_TOKEN: string;
    OPENAI_APIKEY: string;
    OPENAI_MAXTOKENS: string;
    OPENAI_CONVERSATIONLENGTH: string;
    OPENAI_HISTORY: string;
    OPENAI_HISTORYSIZE: string;
    OPENAI_HISTORYFILE: string;
    OPENAI_TEMPERATURE: string;
    OPENAI_MODEL: string;
    OPENAI_SYSTEM: string;
  }
}
