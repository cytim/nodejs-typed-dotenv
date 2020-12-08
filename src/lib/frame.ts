import { set, camelCase, snakeCase } from 'lodash';
import { DotenvParseOutput } from 'dotenv/types';
import { convert } from './convert';
import { Env, FrameOptions, TemplateParseOutput } from './types';

const toCase = (str: string, caseStyle: 'camelCase' | 'snake_case') => {
  switch (caseStyle) {
    case 'camelCase':
      return camelCase(str);
    case 'snake_case':
      return snakeCase(str);
    default:
      return str;
  }
};

export const frame = (
  dotenvParsed: DotenvParseOutput,
  tmplParsed: TemplateParseOutput,
  options: FrameOptions
): { rawEnv?: Env; env?: Env; error?: Error } => {
  const opts = {
    removeUnknownVariables: options.removeUnknownVariables ?? false,
    rename: {
      enabled: options.rename?.enabled ?? options.rename != null,
      caseStyle: options.rename?.caseStyle ?? 'camelCase',
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
          keyPath = keyPath.map((k) => toCase(k, opts.rename.caseStyle));
        }
        set(env, keyPath, rawEnv[key]);
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
