import { set, camelCase, snakeCase } from 'lodash';
import { DotenvParseOutput } from 'dotenv/types';
import { convert } from './convert';
import { ComposeOptions, ComposeOutput, TemplateParseOutput } from './types';

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

const checkVariables = (
  dotenvParsed: DotenvParseOutput,
  tmplParsed: TemplateParseOutput,
  opts: { unknownVariables: string }
) => {
  // Check for unknown variables
  if (opts.unknownVariables === 'error') {
    const unknowns = Object.keys(dotenvParsed).filter((k) => tmplParsed[k] == null);
    if (unknowns.length) {
      throw new Error(`Unknown variables are not allowed: ${unknowns}`);
    }
  }

  // Check for missing required variables
  const missings = Object.keys(tmplParsed).filter((k) => {
    const val = dotenvParsed[k];
    return tmplParsed[k].required === true && (val == null || val === '');
  });
  if (missings.length) {
    throw new Error(`Some required variables are missing: ${missings}`);
  }
};

export const compose = (
  dotenvParsed: DotenvParseOutput,
  tmplParsed: TemplateParseOutput,
  options?: ComposeOptions
): ComposeOutput => {
  const opts = {
    unknownVariables: options?.unknownVariables ?? 'keep',
    rename: {
      enabled: options?.rename?.enabled ?? options?.rename != null,
      caseStyle: options?.rename?.caseStyle ?? 'camelCase',
      nestingDelimiter: options?.rename?.nestingDelimiter ?? '__',
    },
  };

  checkVariables(dotenvParsed, tmplParsed, opts);

  const rawEnv = opts.unknownVariables === 'remove' ? {} : Object.assign({}, dotenvParsed);

  for (const key in tmplParsed) {
    const annotation = tmplParsed[key];
    let val: any = dotenvParsed[key];

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
        keyPath = opts.rename.nestingDelimiter ? key.split(opts.rename.nestingDelimiter).filter((k) => k) : [key];
        keyPath = keyPath.map((k) => toCase(k, opts.rename.caseStyle));
      }
      set(env, keyPath, rawEnv[key]);
    }
  } else {
    env = rawEnv;
  }

  return { rawEnv, env };
};

export default compose;
