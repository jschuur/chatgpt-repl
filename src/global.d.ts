declare module 'wordcount';
declare module 'node-clipboardy';
declare module 'picocolors';

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    OPENAI_API_KEY: string;
    OPENAI_USD_PRICE_PER_TOKEN: number;
    OPENAI_MAX_TOKENS: number;
    OPENAI_HISTORY_LENGTH: number;
    OPENAI_TEMPERATURE: number;
    OPENAI_MODEL: string;
    OPENAI_SYSTEM: string;
  }
}
