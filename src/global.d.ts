declare module 'wordcount';
declare module 'node-clipboardy';
declare module 'picocolors';
declare module 'streamed-chatgpt-api';

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    CHATGPTREPL_USD_PRICE_PER_TOKEN: string;
    CHATGPTREPL_APIKEY: string;
    CHATGPTREPL_MAXTOKENS: string;
    CHATGPTREPL_CONVERSATIONLENGTH: string;
    CHATGPTREPL_HISTORY: string;
    CHATGPTREPL_HISTORYSIZE: string;
    CHATGPTREPL_HISTORYFILE: string;
    CHATGPTREPL_TEMPERATURE: string;
    CHATGPTREPL_MODEL: string;
    CHATGPTREPL_SYSTEM: string;
  }
}
