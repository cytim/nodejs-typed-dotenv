# typed-dotenv

> ✨ Inspired by [dotenv](https://www.npmjs.com/package/dotenv) and
> [dotenv-extended](https://www.npmjs.com/package/dotenv-extended).

[The Twelve-factor App](https://12factor.net/config) suggests to store the config in the environment. This is an
excellent idea, **BUT** there is ONE big shortcoming.

**🤷‍♂️ Environment variables must be string. Not every config is string however.**

To read a typed environment variable (e.g. number or boolean), you need to convert the value to the corresponding type
in your code manually. This greatly impacts the code readability and is error-prone.

🚫 **UNDESIRED**

```js
const { parsed: env } = require('dotenv').config();

const timeout = parseInt(env.TIMEOUT) || 10;
if (timeout > 0) {
  // do something...
}
```

✅ **DESIRED: The variables are in the correct data types, and possibly assigned with the default value at the first place**

```js
const { env } = require('typed-dotenv').config();

if (env.timeout > 0) {
  // do something...
}
```

## Table of Contents

- [What does _typed-dotenv_ do?](#what-does-typed-dotenv-do)
- [Installation](#installation)
- [Usage](#usage)
- [The .env.template File](#the-envtemplate-file)
- [API Reference](#api-reference)
- [FAQ](#faq)

## What does _typed-dotenv_ do?

typed-dotenv reads **a template file**, then manipulate the environment variables according to the template.

In the template, you can...

1. specify the **data type(s)** for each variable. typed-dotenv will convert the environment variables into the
   target type(s) accordingly.

2. specify whether a variable is **required** or **optional**. typed-dotenv will throw an error if a required
   variable is missing.
3. specify the **default values** for the optional variables. typed-dotenv will apply the default values if the
   optional variables are missing.

Check out [the .env.template file](#the-envtemplate-file) for more details.

👉🏼 Moreover, you can configure typed-dotenv to rename and nest the environment variables.

```js
// Default output
{
  "MYSQL__DATABASE": "my_db",
  "MYSQL__POOL_SIZE": 5,
  // ...
}

// Renamed and nested output
{
  "mysql": {
    "database": "my_db",
    "poolSize": 5,
    // ...
  }
}
```

## Installation

```bash
npm i --save typed-dotenv

# OR
yarn add typed-dotenv
```

## Usage

1. Prepare the `.env.template` at the project root.

   ```bash
   # EXAMPLE

   ##
   # @required {string}
   SECRET=

   ##
   # @optional {number} = 30
   TIMEOUT=

   ##
   # @optional {boolean} = false
   DEBUG=

   ##
   # @optional {json} = {"status":404}
   NOT_FOUND=

   ##
   # @optional {string[]} = foo,bar
   LIST=
   ```

2. Copy the `.env.template` as `.env`, and fill in **at least** the required variables.

   ```bash
   SECRET=ThisIsTopSecret
   ```

3. Import and configure `typed-dotenv` as early as possible in your application.

   ```js
   const { error, env } = require('typed-dotenv').config();

   if (error) {
     // Handle the error
   }

   // Now you can refer to the `env` object for the environment variables.
   ```

   ⚠️ If you want to use the `import` syntax (i.e. ES Module), see the FAQ below.

**IMPORTANT NOTES**

1. `process.env` will be modified to include the loaded variables, **BUT** the assigned values are the RAW _STRING_
   values, because `process.env` accepts string only.

2. If a variable has already been set in `process.env`, it WILL be overwritten UNLESS `includeProcessEnv` is set to
   `false`.

## The .env.template File

The `.env.template` file shares the same syntax as the `.env`. The only difference is that each variable has a special
comment block - the annotation block.

An **annotation block** starts with the `##` line, and follows by the lines that start with `#`.

```sh
##
# This is an annotation block.
# You can have some description for your variable.
# @optional {boolean} isDebug = false
DEBUG=
```

Every **annotation** starts with the `@` symbol, follows by a keyword. The remaining part is specific for each
annotation.

Currently, only 2 annotations are supported by this library - `@required` and `@optional`.

### @required

The parser will throw an error if the required variable is missing in `.env`.

Format: @required {_TYPES_} _CUSTOM_NAME_

```sh
# EXAMPLES
# @required {string}
# @required {number|string}
# @required {number|string} customName
```

#### `TYPES`

The list of types separated by `|`. If multiple types are specified, the parser will follow the same sequence to
convert the variable value. If the value fails to convert into any of the defined types, an error will be thrown.

The following types are supported:

`string`, `string[]`, `number`, `number[]`, `boolean`, `boolean[]`, `json`

#### `CUSTOM_NAME` (optional)

If renaming is enabled, the parser will respect the custom name to rename the variable.

For example, `MYSQL__POOL_SIZE` will rename to `mysql.poolSize` by default. You can force it to rename as `dbPoolSize`
by providing the custom name.

### @optional

The parser will assign the default value (if given) or `null` to the variable if the variable is missing in `.env`.

Format: @optional {_TYPES_} _CUSTOM_NAME_ _= DEFAULT_VALUE_

```sh
# EXAMPLES
# @optional {string}
# @optional {number|string}
# @optional {number|string} = 10
# @optional {number|string} customName
# @optional {number|string} customName = 10
```

#### `TYPES`

Please refer to the TYPES under the [`@required`](#required) annotation.

#### `CUSTOM_NAME` (optional)

Please refer to the CUSTOM_NAME under the [`@required`](#required) annotation.

#### `= DEFAULT_VALUE` (optional)

The default value to be assigned if the variable is missing in `.env`. The value must match one of specified types.

## API Reference

### 💡 config(options)

`config` will read your `.env` and `.env.template` to compose the environment variables.

```js
const { error, env } = require('typed-dotenv').config({
  debug: false,
  path: '.env',
  encoding: 'utf8',
  errorOnFileNotFound: false,
  unknownVariables: 'keep',
  assignToProcessEnv: true,
  includeProcessEnv: true,
  template: {
    debug: false,
    path: '.env.template',
    encoding: 'utf8',
    errorOnFileNotFound: false,
    errorOnMissingAnnotation: false,
  },
  rename: {
    enabled: false,
    caseStyle: 'camelCase',
    nestingDelimiter: '__';
  },
});
```

#### options.debug _(default: `false`)_

Set to `true` to print the debug logs.

#### options.path _(default: `path.resolve(process.cwd(), '.env')`)_

The path to your `.env` file.

#### options.encoding _(default: `'utf8'`)_

The encoding of your `.env` file.

#### options.errorOnFileNotFound _(default: `false`)_

Set to `true` to throw an error when the `.env` file does not exist.

#### options.unknownVariables _(default: `'keep'`)_

The behaviour to handle a variable if it does not exist in `.env.template` but is found in `.env`.

- `'keep'`: Simply keep the variable in the loaded variables.
- `'remove'`: Remove the variable from the loaded variables.
- `'error'`: Return an error with the list of unknown variables.

#### options.assignToProcessEnv _(default: `true`)_

Set to `true` to assign the loaded variables to `process.env`.

1. The RAW _STRING_ values, instead of the converted values, are assigned to `process.env`, because `process.env`
   accepts string only.

2. If a variable has already been set in `process.env`, it WILL be overwritten UNLESS `includeProcessEnv` is set to
   `false`.

#### options.includeProcessEnv _(default: `true`)_

Set to `true` to include `process.env` to load the variables. The variables in `process.env` overrides the variables in
`.env`.

If `assignToProcessEnv` is also set to `true`, `process.env` will be overwritten by the resulted variables.

#### options.template.path _(default: `path.resolve(process.cwd(), '.env.template')`)_

The path to your `.env.template` file.

#### options.template.encoding _(default: `'utf8'`)_

The encoding of your `.env.template` file.

#### options.template.errorOnFileNotFound _(default: `false`)_

Set to `true` to throw an error when the `.env.template` file does not exist.

#### options.template.errorOnMissingAnnotation _(default: `false`)_

Set to `true` to throw an error when any of the variables is not annotated properly.

#### options.rename.enabled _(default: (see description))_

When `rename` option is defined, `rename.enabled` defaults to be `true`, unless specified explicitly.

```js
// Will NOT rename the variables by default.
const { env } = config();

// Will rename the variables using the default rename options.
const { env } = config({ rename: {} });

// Will NOT rename the varibles because the option is disabled explicitly.
const { env } = config({
  rename: {
    enabled: false,
    // ...
  },
});
```

#### options.rename.caseStyle _(default: `'camelCase'`)_

The case style for renaming the variables.

- `'camelCase'`: Use [lodash](https://lodash.com/)'s `camelCase` function to rename the variables.
- `'snake_case'`: Use [lodash](https://lodash.com/)'s `snakeCase` function to rename the variables.
- `null`: Do not change the case style.

#### options.rename.nestingDelimiter _(default: `'__'`)_

The delimiter for splitting the variable name into the nested structure.

For example, the default `__` delimiter will convert `MYSQL__USER__NAME=my_user` into

```json
{ "mysql": { "user": { "name": "my_user" } } }
```

### 💡 compose(dotenvObj, templateObj, options)

You can construct your own dotenv object and template object to compose the variables.

```js
const dotenvObj = {
  DEBUG: 'true',
};

const templateObj = {
  DEBUG: {
    required: false,
    types: ['boolean'],
    name: 'isDebug',
    rawDefaultValue: 'false',
    defaultValue: false,
  },
};

const options = {
  unknownVariables: 'keep',
  rename: {
    enabled: false,
    caseStyle: 'camelCase',
    nestingDelimiter: '__',
  },
};

const { rawEnv, convertedEnv, env } = require('typed-dotenv').compose(dotenvObj, templateObj, options);
// rawEnv = { DEBUG: 'true' }
// convertedEnv = { DEBUG: true }
// env = (options.rename.enabled) ? { isDebug: true } : { DEBUG: true }
```

#### options

Please refer to the corresponding options under the [`config`](#-configoptions) function.

### 💡 template.config(options)

Load the dotenv template.

```js
const { error, parsed } = require('typed-dotenv').template.config({
  debug: false,
  path: '.env.template',
  encoding: 'utf8',
  errorOnFileNotFound: false,
  errorOnMissingAnnotation: false,
});
```

#### options

Please refer to `options.template` of the [`config`](#-configoptions) function.

### 💡 template.parse(src, options)

Parse the dotenv template.

```js
const src = `
##
# @optional {boolean} = false
DEBUG=
`;

const options = {
  debug: false,
  errorOnMissingAnnotation: false,
};

const templateObj = require('typed-dotenv').template.parse(src, options);
```

#### src: string | Buffer

The template source in string or buffer.

#### options

Please refer to the corresponding options under `options.template` of the [`config`](#-configoptions) function.

## FAQ

### Should I commit my `.env` and `.env.template` files?

**.env**

No, you should **NOT** commit `.env` to the version control system. The file is meant to be environment-dependent, and
usually contains sensitive information like the passwords or API keys.

**.env.template**

Yes, the `.env.template` file is meant to be shared, so other people can follow the template to setup their own
environments easily.

### How do I use typed-dotenv with import?

> When you run a module containing an import declaration, the modules it imports are loaded first, then each module
> body is executed in a depth-first traversal of the dependency graph, avoiding cycles by skipping anything already
> executed.
>
> – [ES6 In Depth: Modules](https://hacks.mozilla.org/2015/08/es6-in-depth-modules/)

The following code WON'T load the environment variables for the `foo` module because `config()` runs AFTER importing
the `foo` module.

```js
import * as typedDotenv from 'typed-dotenv';
import foo from './foo';

typedDotenv.config();
```

You could solve the problem by either preloading typed-dotenv (`ts-node --require dotenv/dist/config index.ts`) or
importing `typed-dotenv/dist/config` instead of `typed-dotenv`.

⚠️ There are 2 disadvantages with the above solutions however.

1. `process.env` contains only the raw string values, instead of the converted values, of the variables. This goes
   against the purpose of using this library - type conversion.

2. You cannot customise the configuration.

✅ Therefore, the following solution is the most encouraged (for CommonJS as well).

```js
/* * * * * * * * * *
 * 1. Setup `config.ts`
 * * * * * * * * * */

import * as typedDotenv from 'typed-dotenv';

const { error, env } = typedDotenv.config({
  // ...options
});

if (error) {
  // ...
}

export const config = env;

/* * * * * * * * * *
 * 2. In your module (e.g. `foo.ts`), import `config.ts`
 * * * * * * * * * */

import { config } from './config';

// Logic of your module.

/* * * * * * * * * *
 * 3. In your app's entry point (e.g. `index.ts`), import `config.ts` as soon as possible.
 * * * * * * * * * */

import './config';
import foo from './foo';
```

### Other questions?

Feel free to [raise an issue](https://github.com/cytim/nodejs-typed-dotenv/issues) :)
