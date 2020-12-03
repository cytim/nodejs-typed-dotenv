import _ from 'lodash';
import { DotenvParseOutput } from 'dotenv/types';
import { convert } from './convert';
import { Env, FrameOptions, TemplateParseOutput } from './types';

export const frame = (
  dotenvParsed: DotenvParseOutput,
  tmplParsed: TemplateParseOutput,
  options: FrameOptions
): { rawEnv?: Env; env?: Env; error?: Error } => {
  const opts = {
    removeUnknownVariables: options.removeUnknownVariables ?? false,
    rename: {
      enabled: options.rename?.enabled ?? options.rename != null,
      case: options.rename?.case ?? 'camelCase',
      nestingDelimiter: options.rename?.nestingDelimiter ?? '__',
    },
  };

  const rawEnv = opts.removeUnknownVariables ? {} : Object.assign({}, dotenvParsed);

  try {
    for (const key in tmplParsed) {
      const annotation = tmplParsed[key];
      let val: any = dotenvParsed[key];

      if (annotation.required && (val == null || val === '')) {
        throw new Error(`Required variable [${key}] is missing`);
      }

      if (!annotation.required && (val == null || val === '')) {
        val = annotation.defaultValue ?? null;
      } else {
        if (annotation.types) {
          val = convert(val, annotation.types);
        }
      }

      rawEnv[key] = val;
    }

    let env = {};
    if (opts.rename.enabled) {
      for (const key in rawEnv) {
        let keyPath: string | string[] | undefined = tmplParsed[key]?.name;
        if (!keyPath) {
          keyPath = opts.rename.nestingDelimiter ? key.split(opts.rename.nestingDelimiter) : [key];
          keyPath = keyPath.map((k) => _[opts.rename.case](k));
        }
        _.set(env, keyPath, rawEnv[key]);
      }
    } else {
      env = rawEnv;
    }

    return { rawEnv, env };
  } catch (error) {
    return { error };
  }
};

export default frame;
