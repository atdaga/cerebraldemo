/* eslint-disable max-len */
const config = {
  deploymentEnv: 'local',
  aesKey: 'frictionless treatment for depression and anxiety',

  aws: {
    region: 'us-west-2'
  },

  // Local.
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'cerebral',
  dbUser: '',
  dbPassword: '',

  dbTablePrefix: '',

  signedCookieSecret: '6fKx)W7^',
  jwtSecret: '1850984c-c73a-472e-811d-70e594c63110',

  nodePort: 3000,
  apiEndpoint: 'http://localhost:3000',

  webappBaseUri: 'http://localhost:9090',

  questionsUrl: 'https://gist.githubusercontent.com/pcperini/97fe41fc42ac1c610548cbfebb0a4b88/raw/cc07f09753ad8fefb308f5adae15bf82c7fffb72/cerebral_challenge.json',

  loggerLevel: 'silly',
  loggerJson: false
};
/* eslint-enable */
export default config;
