# typed-dotenv

Load .env which is annotated with type information.

## Installation

```bash
# with npm
npm i --save typed-dotenv

# or, with yarn
yarn add typed-dotenv
```

## Getting Started

1. Prepare the `.env.template` at the project root.

   ```bash
   # EXAMPLE

   ##
   # Login credential for something.
   # @required {string}
   LOGIN_CREDENTIAL=

   ##
   # Port of the server.
   # @optional {number} = 3000
   PORT=

   ##
   # Allowed CORS origins.
   # @optional {string[]} = http://localhost:3000,https://example.com
   CORS_WHITELIST=
   ```

2. Copy the `.env.template` as `.env`, and fill in **at least** the required variables.

   > You should **NOT** commit `.env` to the version control system because it is meant to be environment-dependent
   > and the file usually contains sensitive information like passwords or API keys.

   ```bash
   LOGIN_CREDENTIAL=example_user:example_pass
   ```

3. Import and configure `type-dotenv` as early as possible in your application.

   ```js
   // CommonJS
   require('typed-dotenv').config();

   // ES Module
   // Please see the FAQ below.
   ```

4. `process.env` now has the variables you defined in `.env`. If an optional variable is undefined in `.env`, the
   variable will be read from `.env.template`, and the specified default value (or `null`) will be assigned. The values
   are also converted into the target types which you have annotated in `.env.template`.

## FAQ

### Should I commit my `.env` and `.env.template` files?

**.env**

No, you should **NOT** commit `.env` to the version control system. The file is meant to be environment-dependent, and
usually contains sensitive information like the passwords or API keys.

**.env.template**

Yes, the `.env.template` file is meant to be shared, so other people can follow the template to setup their own
environments easily.

### Should I have multiple .env files?

### What happens to environment variables that were already set?

### How do I use dotenv with import?

## TODO

- Parse into nested object, with camelCase.
- Support Regex check?
- Include process.env from higher priority (e.g. inline)
