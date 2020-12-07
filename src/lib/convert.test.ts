import { convert, ConvertError } from './convert';

describe('lib/convert', () => {
  describe('Successful cases (convert into a single target type)', () => {
    it('convert string into string', () => {
      const output = convert('I am a string', ['string']);
      expect(output).toStrictEqual('I am a string');
    });

    it('convert string into number (integer)', () => {
      let output;

      output = convert('777', ['number']);
      expect(output).toStrictEqual(777);

      output = convert('10e3', ['number']);
      expect(output).toStrictEqual(10000);
    });

    it('convert string into number (float)', () => {
      const output = convert('3.14', ['number']);
      expect(output).toStrictEqual(3.14);
    });

    it('convert string "true" into boolean', () => {
      const output = convert('true', ['boolean']);
      expect(output).toStrictEqual(true);
    });

    it('convert string "yes" into boolean', () => {
      const output = convert('yes', ['boolean']);
      expect(output).toStrictEqual(true);
    });

    it('convert string "false" into boolean', () => {
      const output = convert('false', ['boolean']);
      expect(output).toStrictEqual(false);
    });

    it('convert string "no" into boolean', () => {
      const output = convert('no', ['boolean']);
      expect(output).toStrictEqual(false);
    });

    it('convert stringified array into JSON array', () => {
      const output = convert('["xxx","yyy","zzz"]', ['json']);
      expect(output).toStrictEqual(['xxx', 'yyy', 'zzz']);
    });

    it('convert stringified object into JSON object', () => {
      const output = convert('{"foo":"bar"}', ['json']);
      expect(output).toStrictEqual({ foo: 'bar' });
    });

    it('convert string into string[]', () => {
      const output = convert('xxx,yyy,zzz', ['string[]']);
      expect(output).toStrictEqual(['xxx', 'yyy', 'zzz']);
    });

    it('convert string into number[]', () => {
      const output = convert('777,10e3,3.14', ['number[]']);
      expect(output).toStrictEqual([777, 10000, 3.14]);
    });

    it('convert string into boolean[]', () => {
      const output = convert('true,yes,false,no', ['boolean[]']);
      expect(output).toStrictEqual([true, true, false, false]);
    });
  });

  describe('Successful cases (convert into multiple target types)', () => {
    it('convert to the first convertable type (string)', () => {
      const output = convert('I am a string', ['number', 'boolean', 'string']);
      expect(output).toStrictEqual('I am a string');
    });

    it('convert to the first convertable type (boolean)', () => {
      const output = convert('true', ['number', 'boolean', 'string']);
      expect(output).toStrictEqual(true);
    });

    it('convert to the first convertable type (number)', () => {
      const output = convert('3.14', ['number', 'boolean', 'string']);
      expect(output).toStrictEqual(3.14);
    });

    it('convert to the first convertable type (string[])', () => {
      const output = convert('777,true,xxx', ['number[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual(['777', 'true', 'xxx']);
    });

    it('convert to the first convertable type (boolean[])', () => {
      const output = convert('true,yes,false,no', ['number[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual([true, true, false, false]);
    });

    it('convert to the first convertable type (number[])', () => {
      const output = convert('777,10e3,3.14', ['number[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual([777, 10000, 3.14]);
    });
  });

  describe('Fail cases', () => {
    it('fail to convert non-number to number', () => {
      const convertWithError = () => convert('777text', ['number']);
      expect(convertWithError).toThrow(ConvertError);
    });

    it('fail to convert non-boolean to boolean', () => {
      const convertWithError = () => convert('anything', ['boolean']);
      expect(convertWithError).toThrow(ConvertError);
    });

    it('fail to convert malformed number array into number[]', () => {
      const convertWithError = () => convert('1,2,x,4', ['number[]']);
      expect(convertWithError).toThrow(ConvertError);
    });

    it('fail to convert malformed boolean array into boolean[]', () => {
      const convertWithError = () => convert('true,yes,x,no', ['boolean[]']);
      expect(convertWithError).toThrow(ConvertError);
    });
  });
});
