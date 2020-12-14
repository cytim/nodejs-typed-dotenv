import { resolve } from 'path';
import { readFileSync } from 'fs';
import { parse as dotenvParse, DotenvConfigOptions, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { log } from './logger';
import { config as tmplConfig } from './template';
import { compose } from './compose';
import { ConfigOptions, ConfigOutput, Encoding, ComposeOptions, TemplateParseOutput } from './types';

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
  const includeProcessEnv = options?.includeProcessEnv ?? false;
  const assignToProcessEnv = options?.assignToProcessEnv ?? true;

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

  try {
    const dotenvParsed = includeProcessEnv
      ? Object.assign({}, dotenvConfigOutput.parsed, process.env)
      : dotenvConfigOutput.parsed;
    const { rawEnv, env } = compose(dotenvParsed!, tmplConfigOutput.parsed!, options);

    // Setup process.env
    if (assignToProcessEnv) {
      for (const key in rawEnv) {
        if (includeProcessEnv || !(key in process.env)) {
          process.env[key] = rawEnv[key];
        } else {
          debug && log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
        }
      }
    }

    return { env, template: tmplConfigOutput.parsed };
  } catch (error) {
    return { error };
  }
};

export default config;
