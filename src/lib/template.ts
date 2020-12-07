import { readFileSync } from 'fs';
import { resolve } from 'path';
import { log } from './logger';
import { convert } from './convert';
import {
  DataTypeOption,
  TemplateConfigOptions,
  TemplateConfigOutput,
  TemplateEnvAnnotation,
  TemplateParseOptions,
  TemplateParseOutput,
} from './types';

const NEWLINES_MATCH = /\n|\r|\r\n/;
const RE_COMMENT_BLOCK_START = /^##$/;
const RE_COMMENT_LINE = /^#\s*(.*)$/;
const RE_ANNOTATION_REQUIRED = /^@required\s*\{(.+?)\}\s*([\w.]+)?$/;
const RE_ANNOTATION_OPTIONAL = /^@optional\s*\{(.+?)\}\s*([\w.]+)?(\s*=\s*(.+))?$/;
const RE_TYPE_DELIMITER = /\s*\|\s*/;
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;

const ALLOWED_TYPES = ['string', 'string[]', 'number', 'number[]', 'boolean', 'boolean[]', 'json'];

const assign = (obj: { [key: string]: any }, src: { [key: string]: any }) => {
  const newSrc: { [key: string]: any } = {};
  for (const key in src) {
    if (src[key] !== undefined) {
      newSrc[key] = src[key];
    }
  }
  return Object.assign(obj, newSrc);
};

const getTypes = (rawTypes: string) => {
  const types = rawTypes.trim().split(RE_TYPE_DELIMITER);

  for (const t of types) {
    if (!ALLOWED_TYPES.includes(t)) {
      throw new Error('Unknown allowed type(s)');
    }
  }

  return types as DataTypeOption[];
};

const setAnnotation = (annotation: TemplateEnvAnnotation, content: string, { debug }: { debug: boolean }) => {
  if (content.startsWith('@required')) {
    debug && log(`tmpl.setAnnotation: Found @required`);

    const matches = content.match(RE_ANNOTATION_REQUIRED);
    if (!matches) {
      throw new Error('The @required annotation is malformed');
    }
    if (annotation.required === false) {
      throw new Error('The variable cannot be both required and optional');
    }

    const [, rawTypes, name] = matches;
    const types = getTypes(rawTypes);
    return assign(annotation, {
      required: true,
      types,
      name,
    });
  }

  if (content.startsWith('@optional')) {
    debug && log(`tmpl.setAnnotation: Found @optional`);

    const matches = content.match(RE_ANNOTATION_OPTIONAL);
    if (!matches) {
      throw new Error('The @optional annotation is malformed');
    }
    if (annotation.required === true) {
      throw new Error('The variable cannot be both required and optional');
    }

    const [, rawTypes, name, , rawDefaultValue] = matches;
    const types = getTypes(rawTypes);
    const defaultValue = rawDefaultValue != null ? convert(rawDefaultValue, types) : undefined;
    return assign(annotation, {
      required: false,
      types,
      name,
      defaultValue,
    });
  }

  debug && log(`tmpl.setAnnotation: Does not match any annotation`);
  return annotation;
};

const parseCommentBlock = (lines: string[], start: number, { debug }: { debug: boolean }) => {
  const annotation: TemplateEnvAnnotation = {};
  let i = start + 1;
  while (i < lines.length) {
    debug && log(`tmpl.parseCommentBlock: Reading Ln ${i + 1}`);
    const matchCommentLine = lines[i].match(RE_COMMENT_LINE);
    if (!matchCommentLine) {
      break;
    }

    try {
      setAnnotation(annotation, matchCommentLine[1], { debug });
    } catch (e) {
      throw new Error(`Failed to parse template: Ln ${i + 1}: ${e.message}`);
    }
    i++;
  }
  return { annotation: Object.keys(annotation).length ? annotation : null, i };
};

export const parse = (src: string | Buffer, options?: TemplateParseOptions): TemplateParseOutput => {
  const debug = options?.debug ?? false;
  const throwMissingAnnotation = options?.throwMissingAnnotation ?? false;
  const output: TemplateParseOutput = {};

  const lines = src.toString().split(NEWLINES_MATCH);

  let annotation = null;
  let i = 0;
  while (i < lines.length) {
    debug && log(`tmpl.parse: Reading Ln ${i + 1}`);
    const line = lines[i];
    if (RE_COMMENT_BLOCK_START.test(line)) {
      const result = parseCommentBlock(lines, i, { debug });
      annotation = result.annotation;
      i = result.i;
    } else if (RE_INI_KEY_VAL.test(line)) {
      const matchKeyVal = line.match(RE_INI_KEY_VAL);
      if (matchKeyVal) {
        debug && log(`tmpl.parse: Found KEY=VAL`);
        output[matchKeyVal[1]] = annotation || {};
        if (!annotation) {
          const msg = `No annotation is found for variable [${matchKeyVal[1]}] (Ln ${i + 1})`;
          if (throwMissingAnnotation) {
            throw new Error(msg);
          } else {
            debug && log(`tmpl.parse: ${msg}`);
          }
        }
        annotation = null;
      }
      i++;
    } else if (RE_COMMENT_LINE.test(line) || !line.trim().length) {
      // skip the normal comment or empty line
      i++;
    } else {
      throw new Error(`Failed to parse template: Ln ${i + 1}: Neither a comment or a key-value pair`);
    }
  }

  return output;
};

export const config = (options?: TemplateConfigOptions): TemplateConfigOutput => {
  const path = options?.path ?? resolve(process.cwd(), '.env.template');
  const encoding = options?.encoding ?? 'utf8';
  const debug = options?.debug ?? false;
  const throwMissingAnnotation = options?.throwMissingAnnotation ?? false;

  try {
    const parsed = parse(readFileSync(path, { encoding }), { debug, throwMissingAnnotation });
    return { parsed };
  } catch (error) {
    return { error };
  }
};

export default { parse, config };
