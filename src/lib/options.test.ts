import { getCliOptions, getEnvOptions } from './options';

describe('lib/options', () => {
  describe('getCliOptions()', () => {
    it('parse the recognised arguments', () => {
      const options = getCliOptions([
        'dotenv_config__debug=true',
        'dotenv_config__path=/.env',
        'dotenv_config__unknown=foobar',
        'dotenv_config__template__debug=false',
        'dotenv_config__rename__enabled=true',
      ]);
      expect(options).toStrictEqual({
        debug: true,
        path: '/.env',
        template: {
          debug: false,
        },
        rename: {
          enabled: true,
        },
      });
    });
  });

  describe('getEnvOptions()', () => {
    const originalProcessEnv = process.env;

    beforeEach(() => {
      process.env = {};
    });

    afterAll(() => {
      process.env = originalProcessEnv;
    });

    it('parse the recognised environment variables', () => {
      Object.assign(process.env, {
        DOTENV_CONFIG__DEBUG: 'true',
        DOTENV_CONFIG__PATH: '/.env',
        DOTENV_CONFIG__UNKNOWN: 'foobar',
        DOTENV_CONFIG__TEMPLATE__DEBUG: 'false',
        DOTENV_CONFIG__RENAME__ENABLED: 'true',
      });
      const options = getEnvOptions();
      expect(options).toStrictEqual({
        debug: true,
        path: '/.env',
        template: {
          debug: false,
        },
        rename: {
          enabled: true,
        },
      });
    });
  });
});
