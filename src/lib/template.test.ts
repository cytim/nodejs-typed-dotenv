import fs, { readFileSync } from 'fs';
import { resolve } from 'path';
import { SinonStub, stub } from 'sinon';
import { parse, config } from './template';
import { TemplateParseOutput } from './types';

describe('lib/template', () => {
  let logStub: SinonStub, testTmplBuffer: Buffer, testTmplParsed: TemplateParseOutput;

  beforeAll(() => {
    testTmplBuffer = readFileSync(resolve(__dirname, '../__test__/data/template.env'));
    testTmplParsed = JSON.parse(readFileSync(resolve(__dirname, '../__test__/data/template.parsed.json')).toString());
  });

  beforeEach(() => {
    logStub = stub(console, 'log');
  });

  afterEach(() => {
    logStub.restore();
  });

  describe('parse()', () => {
    it('parse the template', () => {
      const annotations = parse(testTmplBuffer);
      expect(logStub.called).toBe(false);
      expect(annotations).toStrictEqual(testTmplParsed);
    });

    it('print logs when debug is set to true', () => {
      const annotations = parse(testTmplBuffer, { debug: true });
      expect(logStub.called).toBe(true);
      expect(annotations).toStrictEqual(testTmplParsed);
    });

    it('throw error because one of the variables is not surrounded by any valid annotation', () => {
      const missingAnnotation = () => parse(testTmplBuffer, { errorOnMissingAnnotation: true });
      expect(missingAnnotation).toThrow('No annotation is found for variable');
    });

    it('throw error because the template contains lines in unknown format', () => {
      const inlineTmpl = `
##
# @required {string}
REQUIRED_STRING=

// this is an unknown line
`;
      expect(() => parse(inlineTmpl)).toThrow('Neither a comment or a key-value pair');
    });

    it('throw error because the @required annotation is malformed', () => {
      const inlineTmpl = `
##
# @required
REQUIRED_STRING=
`;
      expect(() => parse(inlineTmpl)).toThrow('@required annotation is malformed');
    });

    it('throw error because the @required annotation is malformed', () => {
      const inlineTmpl = `
##
# @optional {string} malformed-name
REQUIRED_STRING=
`;
      expect(() => parse(inlineTmpl)).toThrow('@optional annotation is malformed');
    });

    it('throw error because the annotation contains unknown type', () => {
      const inlineTmpl = `
##
# @optional {foo}
REQUIRED_FOO=
`;
      expect(() => parse(inlineTmpl)).toThrow('Unknown allowed type(s)');
    });

    it('throw error because the variable cannot be both required and optional', () => {
      const inlineTmpl = `
##
# @required {string}
# @optional {string}
FOO=
`;
      expect(() => parse(inlineTmpl)).toThrow('cannot be both required and optional');
    });

    it('throw error because the variable cannot be both required and optional', () => {
      const inlineTmpl = `
##
# @optional {string}
# @required {string}
FOO=
`;
      expect(() => parse(inlineTmpl)).toThrow('cannot be both required and optional');
    });
  });

  describe('config()', () => {
    let readFileSyncStub: SinonStub;

    beforeEach(() => {
      readFileSyncStub = stub(fs, 'readFileSync').returns(testTmplBuffer);
    });

    afterEach(() => {
      readFileSyncStub.restore();
    });

    it('config the template, with only path', () => {
      const path = '/custom/path/to/.env.template';
      const { parsed } = config({ path });
      expect(readFileSyncStub.getCall(0).args[0]).toStrictEqual(path);
      expect(readFileSyncStub.getCall(0).args[1]).toStrictEqual({ encoding: 'utf8' });
      expect(logStub.called).toBe(false);
      expect(parsed).toStrictEqual(testTmplParsed);
    });

    it('config the template, with only encoding', () => {
      // defaults to `.env.template` under the current working directory.
      const path = resolve(process.cwd(), './.env.template');
      const { parsed } = config({ encoding: 'latin1' });
      expect(readFileSyncStub.getCall(0).args[0]).toStrictEqual(path);
      expect(readFileSyncStub.getCall(0).args[1]).toStrictEqual({ encoding: 'latin1' });
      expect(logStub.called).toBe(false);
      expect(parsed).toStrictEqual(testTmplParsed);
    });

    it('config the template, with debug set to true', () => {
      const { parsed } = config({ debug: true });
      expect(logStub.called).toBe(true);
      expect(parsed).toStrictEqual(testTmplParsed);
    });

    it('config the template, with errorOnMissingAnnotation set to true', () => {
      const { error } = config({ errorOnMissingAnnotation: true });
      expect(error?.message).toContain('No annotation is found for variable');
    });

    it('throw error because the template path does not exist', () => {
      readFileSyncStub.restore();
      const { error } = config({ path: '/random/unknown/path/.env.template' });
      expect(error?.message).toContain('no such file or directory');
    });
  });
});
