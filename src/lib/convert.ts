import { DataTypeOption } from './types';

const RE_ARRAY_DELIMITER = /\s*,\s*/;

const strTo = {
  array: (data: string, type: 'string' | 'number' | 'boolean' | 'Date') => {
    const arr = data.split(RE_ARRAY_DELIMITER);
    try {
      let output = [];
      for (const item of arr) {
        output.push(strTo[type](item));
      }
      return output;
    } catch (e) {
      throw new ConvertError(`Failed to convert the data into ${type}[]`);
    }
  },

  string: (data: string) => data,

  number: (data: string) => {
    const output = Number(data);
    if (!Number.isNaN(output)) {
      return output;
    }
    throw new ConvertError('Failed to convert the data into number');
  },

  boolean: (data: string) => {
    const strLowerCase = data.toLocaleLowerCase();
    if (['true', 'yes'].includes(strLowerCase)) {
      return true;
    }
    if (['false', 'no'].includes(strLowerCase)) {
      return false;
    }
    throw new ConvertError('Failed to convert the data into boolean');
  },

  Date: (data: string) => {
    const output = new Date(data);
    if (!Number.isNaN(output.getTime())) {
      return output;
    }
    throw new ConvertError('Failed to convert the data into Date');
  },

  json: (data: string) => {
    try {
      const output = JSON.parse(data);
      if (['{', '['].includes(data[0])) {
        return output;
      }
      throw new ConvertError('The JSON string is neither an object or array');
    } catch (e) {
      throw new ConvertError('Failed to convert the data into JSON');
    }
  },
};

export class ConvertError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConvertError';
  }
}

export const convert = (data: string, types: DataTypeOption[]): any => {
  for (const type of types) {
    try {
      let output;
      if (type.endsWith('[]')) {
        const primitiveType = type.slice(0, -2) as 'string' | 'number' | 'boolean' | 'Date';
        output = strTo.array(data, primitiveType);
      } else {
        output = strTo[type as 'string' | 'number' | 'boolean' | 'Date' | 'json'](data);
      }
      return output;
    } catch (e) {
      if (e instanceof ConvertError) {
        continue;
      }
      throw e;
    }
  }
  throw new ConvertError(`Failed to convert the data into any of the types [${types}]`);
};
