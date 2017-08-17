## Technology stack

**📏 [Restify](http://restify.com/) 🦄 [MongoDB](https://www.mongodb.com/) 🚨 [AVA](https://github.com/avajs/ava/)**

## Prerequisites

- [Node.js v8.3.0+](https://nodejs.org/)
- Node package manager v5.3.0+
- Run `npm install`

## Debugging

To start debugging run `npm run debug`, this will start a debug development server at http://localhost.

## Production

To run the application in a production environment the `PORT` and `DB_URL` environmental variables must be set and then the server can be started with `npm start`.

In example

```
npx cross-env PORT=80
npx cross-env DB_URL=mongodb://localhost/ideation
npm start
```

## Testing

To lint the source code run `npm run lint`, this will report any linting issues, to unit test the source code run `npm run unit`, this will report any unit test failures and source coverage.

**To run all tests run `npm test`**
