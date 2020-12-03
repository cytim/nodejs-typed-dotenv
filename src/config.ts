import { getCliOptions, getEnvOptions } from './lib/options';
import { config } from './lib/config';

const cliOptions = getCliOptions(process.argv);
const envOptions = getEnvOptions();

export const { env, template, error } = config(Object.assign({}, envOptions, cliOptions));
