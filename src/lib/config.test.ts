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
    testConfigOutputTmpl = { A: { required: true, types: ['number'] }, B: { required: true, types: ['boolean'] } };
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

  it('return the env and template, and setup process.env', () => {
    process.env.A = 'SomethingElse';
    const { error, template, env } = config();
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({
      A: 'SomethingElse', // not overwritten
      B: 'true',
    });
    expect(logStub.called).toBe(false);
  });

  it('return the env and template, but skip setting up process.env', () => {
    process.env.B = 'SomethingElse';
    const { error, template, env } = config({ assignToProcessEnv: false });
    expect(error).toBeUndefined();
    expect(template).toStrictEqual(testConfigOutputTmpl);
    expect(env).toStrictEqual(testConfigOutputEnv);
    expect(process.env).toStrictEqual({ B: 'SomethingElse' });
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
