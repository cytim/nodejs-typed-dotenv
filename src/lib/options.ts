import { camelCase, set } from 'lodash';
import { convert } from './convert';
import { ConfigOptions, DataTypeOption } from './types';

const PREFIX = 'dotenv_config__';

const OPTION_KEYS: { [key: string]: DataTypeOption[] } = {
  debug: ['boolean'],
  encoding: ['string'],
  path: ['string'],
  remove_unknown_variables: ['boolean'],
  rename__enabled: ['boolean'],
  rename__case: ['string'],
  rename__nesting_delimiter: ['string'],
  template__debug: ['boolean'],
  template__encoding: ['string'],
  template__path: ['string'],
  template__throw_missing_annotation: ['boolean'],
};

const RE_CLI_KEY_VAL = new RegExp(`^${PREFIX}(${Object.keys(OPTION_KEYS).join('|')})=(.+)$`);

const setOptions = (opts: ConfigOptions, key: string, val: string) => {
  const keyPath = key.split('__').map((k) => camelCase(k));
  try {
    const converted = convert(val, OPTION_KEYS[key]);
    return set(opts, keyPath, converted);
  } catch (e) {
    throw new Error(`Failed to set option [${keyPath.join('.')}]: ${e.message}`);
  }
};

export const getCliOptions = (argv: string[]) => {
  const options: ConfigOptions = {};

  for (const argument of argv) {
    const matches = argument.match(RE_CLI_KEY_VAL);
    if (matches) {
      const [, key, val] = matches;
      setOptions(options, key, val);
    }
  }

  return options;
};

export const getEnvOptions = () => {
  const options: ConfigOptions = {};

  for (const key in OPTION_KEYS) {
    const val = process.env[(PREFIX + key).toUpperCase()];
    if (val != null) {
      setOptions(options, key, val);
    }
  }

  return options;
};
