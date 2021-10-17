import { readFileSync } from 'fs';
import { resolve } from 'path';
import { mocked } from 'ts-jest/utils';
import * as Convert from './convert';
import { compose } from './compose';
import { Env, RawEnv, TemplateParseOutput } from './types';
import { omit } from 'lodash';

jest.mock('./convert');

const ConvertMock = mocked(Convert);

describe('lib/compose', () => {
  let testTmplParsed: TemplateParseOutput,
    expectedRawEnvWithAllDefaults: RawEnv,
    expectedConvertedEnvWithAllDefaults: Env;

  beforeAll(() => {
    ConvertMock.convert.mockReturnValue('[converted]');

    testTmplParsed = JSON.parse(readFileSync(resolve(__dirname, '../__test__/data/template.parsed.json')).toString());

    expectedRawEnvWithAllDefaults = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      OPTIONAL__WITHOUT_NAME: '',
      OPTIONAL__WITHOUT_NAME_BUT_DEFAULT: 'foo',
      OPTIONAL__WITH_NAME: '',
      OPTIONAL__WITH_NAME_AND_DEFAULT: 'foobar',
      OPTIONAL__MULTI_TYPE: '',
      OPTIONAL__STRING_ARRAY: 'xxx,yyy,zzz',
      OPTIONAL__INTEGER: '777',
      OPTIONAL__FLOAT: '3.14',
      OPTIONAL__NUMBER_ARRAY: '777,3.14',
      OPTIONAL__TRUE: 'true',
      OPTIONAL__FALSE: 'false',
      OPTIONAL__BOOLEAN_ARRAY: 'true,yes,false,no',
      OPTIONAL__JSON_ARRAY: '["xxx","yyy","zzz"]',
      OPTIONAL__JSON_OBJECT: '{"foo":"bar"}',
      MISSING_ANNOTATION: '',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };

    expectedConvertedEnvWithAllDefaults = {
      REQUIRED__WITHOUT_NAME: '[converted]',
      REQUIRED__WITH_NAME: '[converted]',
      REQUIRED__MULTI_TYPE: '[converted]',
      OPTIONAL__WITHOUT_NAME: null,
      OPTIONAL__WITHOUT_NAME_BUT_DEFAULT: 'foo',
      OPTIONAL__WITH_NAME: null,
      OPTIONAL__WITH_NAME_AND_DEFAULT: 'foobar',
      OPTIONAL__MULTI_TYPE: null,
      OPTIONAL__STRING_ARRAY: ['xxx', 'yyy', 'zzz'],
      OPTIONAL__INTEGER: 777,
      OPTIONAL__FLOAT: 3.14,
      OPTIONAL__NUMBER_ARRAY: [777, 3.14],
      OPTIONAL__TRUE: true,
      OPTIONAL__FALSE: false,
      OPTIONAL__BOOLEAN_ARRAY: [true, true, false, false],
      OPTIONAL__JSON_ARRAY: ['xxx', 'yyy', 'zzz'],
      OPTIONAL__JSON_OBJECT: { foo: 'bar' },
      MISSING_ANNOTATION: null,
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
  });

  it('parse all the variables correctly', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      OPTIONAL__WITHOUT_NAME: '--- unchanged ---',
      OPTIONAL__WITHOUT_NAME_BUT_DEFAULT: '--- unchanged ---',
      OPTIONAL__WITH_NAME: '--- unchanged ---',
      OPTIONAL__WITH_NAME_AND_DEFAULT: '--- unchanged ---',
      OPTIONAL__MULTI_TYPE: '--- unchanged ---',
      OPTIONAL__STRING_ARRAY: '--- unchanged ---',
      OPTIONAL__INTEGER: '--- unchanged ---',
      OPTIONAL__FLOAT: '--- unchanged ---',
      OPTIONAL__NUMBER_ARRAY: '--- unchanged ---',
      OPTIONAL__TRUE: '--- unchanged ---',
      OPTIONAL__FALSE: '--- unchanged ---',
      OPTIONAL__BOOLEAN_ARRAY: '--- unchanged ---',
      OPTIONAL__JSON_ARRAY: '--- unchanged ---',
      OPTIONAL__JSON_OBJECT: '--- unchanged ---',
      MISSING_ANNOTATION: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
    const expectedRawEnv = {
      REQUIRED__WITHOUT_NAME: '[converted]',
      REQUIRED__WITH_NAME: '[converted]',
      REQUIRED__MULTI_TYPE: '[converted]',
      OPTIONAL__WITHOUT_NAME: '[converted]',
      OPTIONAL__WITHOUT_NAME_BUT_DEFAULT: '[converted]',
      OPTIONAL__WITH_NAME: '[converted]',
      OPTIONAL__WITH_NAME_AND_DEFAULT: '[converted]',
      OPTIONAL__MULTI_TYPE: '[converted]',
      OPTIONAL__STRING_ARRAY: '[converted]',
      OPTIONAL__INTEGER: '[converted]',
      OPTIONAL__FLOAT: '[converted]',
      OPTIONAL__NUMBER_ARRAY: '[converted]',
      OPTIONAL__TRUE: '[converted]',
      OPTIONAL__FALSE: '[converted]',
      OPTIONAL__BOOLEAN_ARRAY: '[converted]',
      OPTIONAL__JSON_ARRAY: '[converted]',
      OPTIONAL__JSON_OBJECT: '[converted]',
      MISSING_ANNOTATION: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed);
    expect(rawEnv).toStrictEqual(testDotenvParsed);
    expect(convertedEnv).toStrictEqual(expectedRawEnv);
    expect(env).toStrictEqual(expectedRawEnv);
  });

  it('fill up all optional variables with default values', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed);
    expect(rawEnv).toStrictEqual(expectedRawEnvWithAllDefaults);
    expect(convertedEnv).toStrictEqual(expectedConvertedEnvWithAllDefaults);
    expect(env).toStrictEqual(expectedConvertedEnvWithAllDefaults);
  });

  it('remove the unknown variable', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
    const expectedRawEnv = omit(expectedRawEnvWithAllDefaults, 'UNKNOWN_VARIABLE');
    const expectedConvertedEnv = omit(expectedConvertedEnvWithAllDefaults, 'UNKNOWN_VARIABLE');

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed, { unknownVariables: 'remove' });
    expect(rawEnv).toStrictEqual(expectedRawEnv);
    expect(convertedEnv).toStrictEqual(expectedConvertedEnv);
    expect(env).toStrictEqual(expectedConvertedEnv);
  });

  it('throw error for the unknown variable', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };

    const throwError = () => compose(testDotenvParsed, testTmplParsed, { unknownVariables: 'error' });
    expect(throwError).toThrow('Unknown variables are not allowed');
  });

  it('rename the variables, using default rename options', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
    const expectedEnv = {
      required: {
        withoutName: '[converted]',
        multiType: '[converted]',
      },
      requiredWithName: '[converted]',
      optional: {
        withoutName: null,
        withoutNameButDefault: 'foo',
        multiType: null,
        stringArray: ['xxx', 'yyy', 'zzz'],
        integer: 777,
        float: 3.14,
        numberArray: [777, 3.14],
        true: true,
        false: false,
        booleanArray: [true, true, false, false],
        jsonArray: ['xxx', 'yyy', 'zzz'],
        jsonObject: { foo: 'bar' },
      },
      optionalWithName: null,
      optionalWithNameAndDefault: 'foobar',
      missingAnnotation: null,
      unknownVariable: '--- unchanged ---',
    };

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed, { rename: { enabled: true } });
    expect(rawEnv).toStrictEqual(expectedRawEnvWithAllDefaults);
    expect(convertedEnv).toStrictEqual(expectedConvertedEnvWithAllDefaults);
    expect(env).toStrictEqual(expectedEnv);
  });

  it('rename the variables, with caseStyle = "snake_case"', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
    const expectedEnv = {
      required: {
        without_name: '[converted]',
        multi_type: '[converted]',
      },
      requiredWithName: '[converted]',
      optional: {
        without_name: null,
        without_name_but_default: 'foo',
        multi_type: null,
        string_array: ['xxx', 'yyy', 'zzz'],
        integer: 777,
        float: 3.14,
        number_array: [777, 3.14],
        true: true,
        false: false,
        boolean_array: [true, true, false, false],
        json_array: ['xxx', 'yyy', 'zzz'],
        json_object: { foo: 'bar' },
      },
      optionalWithName: null,
      optionalWithNameAndDefault: 'foobar',
      missing_annotation: null,
      unknown_variable: '--- unchanged ---',
    };

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed, {
      rename: { caseStyle: 'snake_case' },
    });
    expect(rawEnv).toStrictEqual(expectedRawEnvWithAllDefaults);
    expect(convertedEnv).toStrictEqual(expectedConvertedEnvWithAllDefaults);
    expect(env).toStrictEqual(expectedEnv);
  });

  it('rename the variables, with nestingDelimiter = "_"', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '--- unchanged ---',
      REQUIRED__WITH_NAME: '--- unchanged ---',
      REQUIRED__MULTI_TYPE: '--- unchanged ---',
      UNKNOWN_VARIABLE: '--- unchanged ---',
    };
    const expectedEnv = {
      required: {
        without: {
          name: '[converted]',
        },
        multi: {
          type: '[converted]',
        },
      },
      requiredWithName: '[converted]',
      optional: {
        without: {
          name: {
            but: {
              default: 'foo',
            },
          },
        },
        multi: {
          type: null,
        },
        string: {
          array: ['xxx', 'yyy', 'zzz'],
        },
        integer: 777,
        float: 3.14,
        number: {
          array: [777, 3.14],
        },
        true: true,
        false: false,
        boolean: {
          array: [true, true, false, false],
        },
        json: {
          array: ['xxx', 'yyy', 'zzz'],
          object: {
            foo: 'bar',
          },
        },
      },
      optionalWithName: null,
      optionalWithNameAndDefault: 'foobar',
      missing: {
        annotation: null,
      },
      unknown: {
        variable: '--- unchanged ---',
      },
    };

    const { rawEnv, convertedEnv, env } = compose(testDotenvParsed, testTmplParsed, {
      rename: { nestingDelimiter: '_' },
    });
    expect(rawEnv).toStrictEqual(expectedRawEnvWithAllDefaults);
    expect(convertedEnv).toStrictEqual(expectedConvertedEnvWithAllDefaults);
    expect(env).toStrictEqual(expectedEnv);
  });

  it('throw error because some required variables are missing', () => {
    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '-- unchanged --',
    };

    const throwError = () => compose(testDotenvParsed, testTmplParsed);
    expect(throwError).toThrow('Some required variables are missing');
  });

  it('bubble up the ConvertError when a variable value cannot be converted to the specified data type(s)', () => {
    ConvertMock.convert.mockImplementationOnce(() => {
      throw new Convert.ConvertError('Mock conversion error');
    });

    const testDotenvParsed = {
      REQUIRED__WITHOUT_NAME: '-- unchanged --',
      REQUIRED__WITH_NAME: '-- unchanged --',
      REQUIRED__MULTI_TYPE: '-- unchanged --',
      OPTIONAL__INTEGER: '-- unchanged --',
    };

    const throwError = () => compose(testDotenvParsed, testTmplParsed);
    expect(throwError).toThrow(Convert.ConvertError);
  });
});
