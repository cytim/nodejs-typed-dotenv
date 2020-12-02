import {
  parse as dotenvParse,
  config as dotenvConfig,
  DotenvParseOptions,
  DotenvParseOutput,
  DotenvConfigOptions,
  DotenvConfigOutput,
} from 'dotenv';

export const parse = (src: string | Buffer, options?: DotenvParseOptions): DotenvParseOutput => {
  return dotenvParse(src, options);
};

export const config = (options?: DotenvConfigOptions): DotenvConfigOutput => {
  return dotenvConfig(options);
};
