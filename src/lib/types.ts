import { DotenvConfigOptions } from 'dotenv';

export type Encoding =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'latin1'
  | 'binary'
  | 'hex'
  | null;

export type DataType = string | string[] | number | number[] | boolean | boolean[];

export type DataTypeOption = 'string' | 'string[]' | 'number' | 'number[]' | 'boolean' | 'boolean[]' | 'json';

export type Env = {
  [key: string]: DataType | Env | null;
};

export type TemplateEnvAnnotation = {
  required?: boolean;
  types?: DataTypeOption[];
  name?: string;
  defaultValue?: any;
};

export type TemplateParseOptions = {
  debug?: boolean;
  throwMissingAnnotation?: boolean;
};

export type TemplateParseOutput = {
  [key: string]: TemplateEnvAnnotation;
};

export type TemplateConfigOptions = {
  path?: string;
  throwMissingAnnotation?: boolean;
  encoding?: Encoding;
  debug?: boolean;
};

export type TemplateConfigOutput = {
  parsed?: TemplateParseOutput;
  error?: Error;
};

export type FrameOptions = {
  removeUnknownVariables?: boolean;
  rename?: {
    enabled?: boolean;
    caseStyle?: 'camelCase' | 'snake_case';
    nestingDelimiter?: string | null;
  };
};

export type ConfigOptions = {
  template?: TemplateConfigOptions;
} & FrameOptions &
  DotenvConfigOptions;

export type ConfigOutput = {
  env?: Env;
  template?: TemplateParseOutput;
  error?: Error;
};
