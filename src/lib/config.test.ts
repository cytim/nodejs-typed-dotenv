import dotenv from 'dotenv';
import { mocked } from 'ts-jest/utils';
import * as Template from './template';
import * as Compose from './compose';
import { config } from './config';
import { Env, RawEnv, TemplateParseOutput } from './types';

jest.mock('fs');
jest.mock('dotenv');
jest.mock('./template');
jest.mock('./compose');

const dotenvMock = mocked(dotenv);
const TemplateMock = mocked(Template);
const ComposeMock = mocked(Compose);

describe('lib/config', () => {
  let processEnv: RawEnv, testConfigOutputTmpl: TemplateParseOutput, testConfigOutputEnv: Env;

  beforeAll(() => {
    processEnv = process.env;

    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    testConfigOutputTmpl = {
      A: { required: false, types: ['number'], defaultValue: 999, rawDefaultValue: '999' },
      B: { required: false, types: ['boolean'], defaultValue: false, rawDefaultValue: 'false' },
    };

    testConfigOutputEnv = { A: 777, B: true };

    dotenvMock.parse.mockReturnValue({ A: '777', B: 'true' });
    TemplateMock.config.mockReturnValue({ parsed: testConfigOutputTmpl });
    ComposeMock.compose.mockReturnValue({
      rawEnv: { A: '777', B: 'true' },
      convertedEnv: testConfigOutputEnv,
      env: testConfigOutputEnv,
    });
  });

  afterAll(() => {
    process.env = processEnv;
  });

  beforeEach(() => {
    process.env = {};
  });

  it('compose the env { assignToProcessEnv: true, includeProcessEnv: true }', () => {
    const _testComposeOutputRawEnv = { A: '999', B: 'true' };
    const _testComposeOutputEnv = { A: 999, B: true };

    process.env.A = '';

    ComposeMock.compose.mockReturnValueOnce({
      rawEnv: _testComposeOutputRawEnv,
      convertedEnv: _testComposeOutputEnv,
      env: _testComposeOutputEnv,
    });

    const { error, template, env } = config();

    // Expect that `process.env` is merged into `dotenv.parsed`
    expect(dotenvMock.parse).toBeCalledTimes(1);
    expect(ComposeMock.compose).toBeCalledTimes(1);
    expect(ComposeMock.compose).nthCalledWith(1, { A: '', B: 'true' }, expect.anything(), undefined);

    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(_testComposeOutputEnv);
    expect(process.env).toStrictEqual(_testComposeOutputRawEnv);

    expect(console.log).not.toBeCalled();
  });

  it('compose the env { assignToProcessEnv: false, includeProcessEnv: true }', () => {
    const _options = { assignToProcessEnv: false };
    const _testComposeOutputRawEnv = { A: '999', B: 'true' };
    const _testComposeOutputEnv = { A: 999, B: true };

    process.env.A = '';

    ComposeMock.compose.mockReturnValueOnce({
      rawEnv: _testComposeOutputRawEnv,
      convertedEnv: _testComposeOutputEnv,
      env: _testComposeOutputEnv,
    });

    const { error, template, env } = config(_options);

    // Expect that `process.env` is merged into `dotenv.parsed`
    expect(dotenvMock.parse).toBeCalledTimes(1);
    expect(ComposeMock.compose).toBeCalledTimes(1);
    expect(ComposeMock.compose).nthCalledWith(1, { A: '', B: 'true' }, expect.anything(), _options);

    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(_testComposeOutputEnv);
    expect(process.env).toStrictEqual({ A: '' }); // process.env is not overwritten

    expect(console.log).not.toBeCalled();
  });

  it('compose the env { assignToProcessEnv: true, includeProcessEnv: false }', () => {
    const _options = { includeProcessEnv: false };

    process.env.A = '';

    const { error, template, env } = config(_options);

    // Expect that `process.env` is NOT merged into `dotenv.parsed`
    expect(dotenvMock.parse).toBeCalledTimes(1);
    expect(ComposeMock.compose).toBeCalledTimes(1);
    expect(ComposeMock.compose).nthCalledWith(1, { A: '777', B: 'true' }, expect.anything(), _options);

    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({
      A: '', // not overwritten
      B: 'true',
    });

    expect(console.log).not.toBeCalled();
  });

  it('compose the env { assignToProcessEnv: false, includeProcessEnv: false }', () => {
    const _options = { assignToProcessEnv: false, includeProcessEnv: false };

    process.env.A = '';

    const { error, template, env } = config(_options);

    // Expect that `process.env` is NOT merged into `dotenv.parsed`
    expect(dotenvMock.parse).toBeCalledTimes(1);
    expect(ComposeMock.compose).toBeCalledTimes(1);
    expect(ComposeMock.compose).nthCalledWith(1, { A: '777', B: 'true' }, expect.anything(), _options);

    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({ A: '' }); // process.env is not overwritten

    expect(console.log).not.toBeCalled();
  });

  it('return error for template error', () => {
    TemplateMock.config.mockReturnValueOnce({ error: new Error('mock template.config error') });

    const { error } = config();

    expect(error?.message).toContain('mock template.config error');

    expect(console.log).not.toBeCalled();
  });

  it('return error for dotenv error', () => {
    dotenvMock.parse.mockImplementationOnce(() => {
      throw new Error('mock dotenv.parse error');
    });

    const { error } = config();

    expect(error?.message).toContain('mock dotenv.parse error');

    expect(console.log).not.toBeCalled();
  });

  it('return error for compose error', () => {
    ComposeMock.compose.mockImplementationOnce(() => {
      throw new Error('mock compose error');
    });

    const { error } = config();

    expect(error?.message).toContain('mock compose error');

    expect(console.log).not.toBeCalled();
  });

  it('print the debug logs', () => {
    config({ debug: true });

    expect(console.log).toBeCalled();
  });
});
