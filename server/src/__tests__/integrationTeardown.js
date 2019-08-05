/*
"jest": {
  "globalSetup": "./src/__tests__/integrationTeardown.js"
  }
 */
require('babel-register');
require('babel-polyfill');
const { gracefulShutdown } = require('../bootstrap');

module.exports = async () => {
  console.log('********** Global Test Teardown **********'); // eslint-disable-line no-console
  await gracefulShutdown();
};
