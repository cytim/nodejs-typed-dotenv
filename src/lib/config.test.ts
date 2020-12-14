import fs from 'fs';
import dotenv from 'dotenv';
import * as template from './template';
import * as Compose from './compose';
import { config } from './config';
import { SinonStub, stub } from 'sinon';
import { Env, RawEnv, TemplateParseOutput } from './types';

describe('lib/config', () => {
  let processEnv: RawEnv,
    testConfigOutputTmpl: TemplateParseOutput,
    testConfigOutputEnv: Env,
    logStub: SinonStub,
    readFileSyncStub: SinonStub,
    dotenvParseStub: SinonStub,
    tmplConfigStub: SinonStub,
    composeStub: SinonStub;

  beforeAll(() => {
    processEnv = process.env;
    logStub = stub(console, 'log');
    readFileSyncStub = stub(fs, 'readFileSync');
    testConfigOutputTmpl = {
      A: { required: false, types: ['number'], defaultValue: 999, rawDefaultValue: '999' },
      B: { required: false, types: ['boolean'], defaultValue: false, rawDefaultValue: 'false' },
    };
    testConfigOutputEnv = { A: 777, B: true };
    dotenvParseStub = stub(dotenv, 'parse');
    tmplConfigStub = stub(template, 'config');
    composeStub = stub(Compose, 'compose');
  });

  afterAll(() => {
    process.env = processEnv;
    logStub.restore();
    readFileSyncStub.restore();
    dotenvParseStub.restore();
    tmplConfigStub.restore();
    composeStub.restore();
  });

  beforeEach(() => {
    process.env = {};
    logStub.reset();
    readFileSyncStub.reset();
    dotenvParseStub.reset();
    dotenvParseStub.returns({ A: '777', B: 'true' });
    tmplConfigStub.reset();
    tmplConfigStub.returns({ parsed: testConfigOutputTmpl });
    composeStub.reset();
    composeStub.returns({
      rawEnv: { A: '777', B: 'true' },
      convertedEnv: testConfigOutputEnv,
      env: testConfigOutputEnv,
    });
  });

  it('compose the env, and setup process.env', () => {
    process.env.A = '';
    const { error, template, env } = config();
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({
      A: '', // not overwritten
      B: 'true',
    });
    expect(logStub.called).toBe(false);
  });

  it('compose the env, but skip setting up process.env', () => {
    process.env.A = '';
    const { error, template, env } = config({ assignToProcessEnv: false });
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({ A: '' });
    expect(logStub.called).toBe(false);
  });

  it('include process.env to compose the env, and override process.env', () => {
    const _testComposeOutputRawEnv = { A: '999', B: 'true' };
    const _testComposeOutputEnv = { A: 999, B: true };
    process.env.A = '';
    composeStub.returns({
      rawEnv: _testComposeOutputRawEnv,
      convertedEnv: _testComposeOutputEnv,
      env: _testComposeOutputEnv,
    });
    const { error, template, env } = config({ includeProcessEnv: true });
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(_testComposeOutputEnv);
    expect(process.env).toStrictEqual(_testComposeOutputRawEnv); // process.env.A is overwritten
    expect(logStub.called).toBe(false);
  });

  it('include process.env to compose the env, but skip setting up process.env', () => {
    const _testComposeOutputRawEnv = { A: '999', B: 'true' };
    const _testComposeOutputEnv = { A: 999, B: true };
    process.env.A = '';
    composeStub.returns({
      rawEnv: _testComposeOutputRawEnv,
      convertedEnv: _testComposeOutputEnv,
      env: _testComposeOutputEnv,
    });
    const { error, template, env } = config({ includeProcessEnv: true, assignToProcessEnv: false });
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(_testComposeOutputEnv);
    expect(process.env).toStrictEqual({ A: '' });
    expect(logStub.called).toBe(false);
  });

  it('return error for template error', () => {
    tmplConfigStub.returns({ error: new Error('mock template.config error') });
    const { error } = config();
    expect(error?.message).toContain('mock template.config error');
    expect(logStub.called).toBe(false);
  });

  it('return error for dotenv error', () => {
    dotenvParseStub.throws(new Error('mock dotenv.parse error'));
    const { error } = config();
    expect(error?.message).toContain('mock dotenv.parse error');
    expect(logStub.called).toBe(false);
  });

  it('return error for compose error', () => {
    composeStub.throws(new Error('mock compose error'));
    const { error } = config();
    expect(error?.message).toContain('mock compose error');
    expect(logStub.called).toBe(false);
  });

  it('print the debug logs', () => {
    config({ debug: true });
    expect(logStub.called).toBe(true);
  });
});
