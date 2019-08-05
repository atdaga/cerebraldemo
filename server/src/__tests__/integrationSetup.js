/*
"jest": {
  "globalSetup": "./src/__tests__/integrationSetup.js"
  }
 */
require('babel-register');
require('babel-polyfill');
const start = require('../bootstrap').default;

module.exports = async () => {
  await start();
  console.log('********** Global Test Setup **********'); // eslint-disable-line no-console
};
