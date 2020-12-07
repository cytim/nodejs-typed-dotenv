import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse as dotenvParse, DotenvConfigOptions, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { log } from './logger';
import { config as tmplConfig } from './template';
import { frame } from './frame';
import { ConfigOptions, ConfigOutput, Encoding, FrameOptions, TemplateParseOutput } from './types';

/**
 * Override `dotenv.config` to by-pass the `process.env` assignment.
 */
const configDotenv = (options: DotenvConfigOptions): DotenvConfigOutput => {
  const path = options?.path ?? resolve(process.cwd(), '.env');
  const encoding = (options?.encoding ?? 'utf8') as Encoding;
  const debug = options?.debug ?? false;

  try {
    const parsed = dotenvParse(readFileSync(path, { encoding }), { debug });
    return { parsed };
  } catch (error) {
    return { error };
  }
};

export const config = (options?: ConfigOptions): ConfigOutput => {
  const debug = options?.debug ?? false;
  if (debug) {
    log('options: %j', options);
  }

  const tmplConfigOutput = tmplConfig(
    Object.assign(
      {
        encoding: options?.encoding,
        debug: options?.debug,
      },
      options?.template
    )
  );
  if (tmplConfigOutput.error) {
    return { error: tmplConfigOutput.error };
  }

  const dotenvConfigOutput = configDotenv({
    path: options?.path,
    encoding: options?.encoding,
    debug: options?.debug,
  });
  if (dotenvConfigOutput.error) {
    return { error: dotenvConfigOutput.error };
  }

  const framed = frame(
    dotenvConfigOutput.parsed as DotenvParseOutput,
    tmplConfigOutput.parsed as TemplateParseOutput,
    options as FrameOptions
  );
  if (framed.error) {
    return { error: framed.error };
  }

  // TODO: setup process.env

  return { env: framed.env, template: tmplConfigOutput.parsed };
};

export default config;