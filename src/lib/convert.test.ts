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

    it('convert string into Date', () => {
      const dateStr = '2020-01-01T00:00:00+08:00';
      const date = new Date(dateStr);
      const output = convert(dateStr, ['Date']);
      expect(output).toBeInstanceOf(Date);
      expect(output.getTime()).toStrictEqual(date.getTime());
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

    it('convert string into date[]', () => {
      const dates = [new Date('2019-01-01'), new Date('2020-01-01'), new Date('2021-01-01')];
      const output = convert('2019-01-01,2020-01-01,2021-01-01', ['Date[]']);
      expect(Array.isArray(output)).toBe(true);
      output.forEach((o: any, i: number) => {
        expect(o).toBeInstanceOf(Date);
        expect(o.getTime()).toStrictEqual(dates[i].getTime());
      });
    });
  });

  describe('Successful cases (convert into multiple target types)', () => {
    it('convert to the first convertable type (string)', () => {
      const output = convert('I am a string', ['json', 'number', 'Date', 'boolean', 'string']);
      expect(output).toStrictEqual('I am a string');
    });

    it('convert to the first convertable type (boolean)', () => {
      const output = convert('true', ['json', 'number', 'Date', 'boolean', 'string']);
      expect(output).toStrictEqual(true);
    });

    it('convert to the first convertable type (number)', () => {
      const output = convert('3.14', ['json', 'number', 'Date', 'boolean', 'string']);
      expect(output).toStrictEqual(3.14);
    });

    it('convert to the first convertable type (Date)', () => {
      const output = convert('2020-01-01', ['json', 'number', 'Date', 'boolean', 'string']);
      expect(output).toBeInstanceOf(Date);
      expect(output.getTime()).toStrictEqual(new Date('2020-01-01').getTime());
    });

    it('convert to the first convertable type (json)', () => {
      const output = convert('{"foo":"bar"}', ['json', 'number', 'Date', 'boolean', 'string']);
      expect(output).toStrictEqual({ foo: 'bar' });
    });

    it('convert to the first convertable type (string[])', () => {
      const output = convert('777,true,xxx', ['number[]', 'Date[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual(['777', 'true', 'xxx']);
    });

    it('convert to the first convertable type (boolean[])', () => {
      const output = convert('true,yes,false,no', ['number[]', 'Date[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual([true, true, false, false]);
    });

    it('convert to the first convertable type (number[])', () => {
      const output = convert('777,10e3,3.14', ['number[]', 'Date[]', 'boolean[]', 'string[]']);
      expect(output).toStrictEqual([777, 10000, 3.14]);
    });

    it('convert to the first convertable type (Date[])', () => {
      const dates = [new Date('2019-01-01'), new Date('2020-01-01'), new Date('2021-01-01')];
      const output = convert('2019-01-01,2020-01-01,2021-01-01', ['number[]', 'Date[]', 'boolean[]', 'string[]']);
      expect(Array.isArray(output)).toBe(true);
      output.forEach((o: any, i: number) => {
        expect(o).toBeInstanceOf(Date);
        expect(o.getTime()).toStrictEqual(dates[i].getTime());
      });
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

    it('fail to convert non-date to Date', () => {
      const convertWithError = () => convert('anything', ['Date']);
      expect(convertWithError).toThrow(ConvertError);
    });

    it('fail to convert non-json to json', () => {
      const convertWithError = () => convert('999', ['json']);
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

    it('fail to convert malformed date array into Date[]', () => {
      const convertWithError = () => convert('2019-01-01,x,2021-01-01', ['Date[]']);
      expect(convertWithError).toThrow(ConvertError);
    });
  });
});
