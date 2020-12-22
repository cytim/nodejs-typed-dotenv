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

export type DataType = string | string[] | number | number[] | boolean | boolean[] | Date | Date[];

export type DataTypeOption =
  | 'string'
  | 'string[]'
  | 'number'
  | 'number[]'
  | 'boolean'
  | 'boolean[]'
  | 'Date'
  | 'Date[]'
  | 'json';

export type RawEnv = {
  [key: string]: string | undefined;
};

export type Env = {
  [key: string]: DataType | Env | null;
};

export type TemplateEnvAnnotation = {
  required?: boolean;
  types?: DataTypeOption[];
  name?: string;
  rawDefaultValue?: string;
  defaultValue?: any;
};

export type TemplateParseOptions = {
  debug?: boolean;
  errorOnMissingAnnotation?: boolean;
};

export type TemplateParseOutput = {
  [key: string]: TemplateEnvAnnotation;
};

export type TemplateConfigOptions = {
  path?: string;
  encoding?: Encoding;
  debug?: boolean;
} & TemplateParseOptions;

export type TemplateConfigOutput = {
  parsed?: TemplateParseOutput;
  error?: Error;
};

export type ComposeOptions = {
  unknownVariables?: 'keep' | 'remove' | 'error';
  rename?: {
    enabled?: boolean;
    caseStyle?: 'camelCase' | 'snake_case' | null;
    nestingDelimiter?: string | null;
  };
};

export type ComposeOutput = {
  rawEnv?: RawEnv;
  convertedEnv?: Env;
  env?: Env;
};

export type ConfigOptions = {
  includeProcessEnv?: boolean;
  assignToProcessEnv?: boolean;
  template?: TemplateConfigOptions;
} & ComposeOptions &
  DotenvConfigOptions;

export type ConfigOutput = {
  env?: Env;
  template?: TemplateParseOutput;
  error?: Error;
};
