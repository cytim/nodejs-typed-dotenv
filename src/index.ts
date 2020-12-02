import { resolve } from 'path';
import dotenv, { DotenvConfigOptions } from 'dotenv';
import template, { TemplateConfigOptions, TemplateParseOutput } from './lib/template';

type Env = {
  [key: string]: string | string[] | number | number[] | boolean | boolean[] | Env | null;
};

type TypedDotenvConfigOptions = DotenvConfigOptions & TemplateConfigOptions;

type TypedDotenvConfigOutput = {
  env?: Env;
  template?: TemplateParseOutput;
  error?: Error;
};

export const config = (options?: TypedDotenvConfigOptions): TypedDotenvConfigOutput => {
  const tmplConfigOutput = template.config({
    templatePath: options?.templatePath,
    encoding: options?.encoding,
    debug: options?.debug,
  });
  if (tmplConfigOutput.error) {
    return { error: tmplConfigOutput.error };
  }

  const dotenvConfigOutput = dotenv.config({
    path: options?.path,
    encoding: options?.encoding,
    debug: options?.debug,
  });
  if (dotenvConfigOutput.error) {
    return { error: dotenvConfigOutput.error };
  }

  return {};
};

export { dotenv, template };
