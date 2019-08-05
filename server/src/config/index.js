import _ from 'lodash';
import localConfig from './local';
import testConfig from './test';
import Aes from './Aes';

const config = (process.env.NODE_ENV === 'test') ? _.merge(localConfig, testConfig) : localConfig;
export default config;

let aes;
const decryptNode = (node) => {
  if (_.isString(node)) {
    return aes.decryptCiphers(node);
  }
  if (_.isArray(node)) {
    return node.map(val => decryptNode(val));
  }
  if (_.isPlainObject(node)) {
    Object.keys(node).forEach((key) => {
      node[key] = decryptNode(node[key]); // eslint-disable-line no-param-reassign
    });
  }
  return node;
};

export const applyEnvironmentToConfig = () => {
  /* Necessary properties from the environment, unless using the default values. */

  config.deploymentEnv = process.env.DEPLOYMENT_ENV || config.deploymentEnv;
  config.aesKey = process.env.AES_KEY || config.aesKey;

  config.aws.accessKeyId = process.env.AWS_ACCESS_KEY_ID || config.aws.accessKeyId;
  config.aws.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || config.aws.secretAccessKey;
  config.aws.region = process.env.AWS_REGION || config.aws.region;

  config.dbHost = process.env.DB_HOST || config.dbHost;
  config.dbPort = process.env.DB_PORT || config.dbPort;
  config.dbUser = process.env.DB_USER || config.dbUser;
  config.dbPassword = process.env.DB_PASSWORD || config.dbPassword;
  config.dbName = process.env.DB_NAME || config.dbName;


  /* Properties below are typically configured from the Db system properties table. */

  config.dbTablePrefix = process.env.DB_TABLE_PREFIX || config.dbTablePrefix;

  config.signedCookieSecret = process.env.SIGNED_COOKIE_SECRET || config.signedCookieSecret;
  config.jwtSecret = process.env.JWT_SECRET || config.jwtSecret;
  config.oidcKeystore = process.env.OIDC_KEYSTORE || config.oidcKeystore;

  config.nodePort = process.env.NODE_PORT || config.nodePort;
  config.apiEndpoint = process.env.API_ENDPOINT || config.apiEndpoint;

  config.webappBaseUri = process.env.WEBAPP_BASE_URI || config.webappBaseUri;

  /**
   * 'error', 'warn', 'info', 'verbose', 'debug', 'silly'.
   */
  config.loggerLevel = process.env.LOGGER_LEVEL || config.loggerLevel;

  /**
   * Output logs in JSON (true) or not (false).
   */
  config.loggerJson = process.env.LOGGER_JSON || config.loggerJson;

  aes = new Aes(config.aesKey);
  decryptNode(config);

  return Promise.resolve(config);
};

export const applyPropertiesFromDbToConfig = (propertiesFromDb) => {
  propertiesFromDb.forEach((property) => {
    if (property.propertyName.indexOf('.') > 0) {
      let parent = config;
      const nameComponents = property.propertyName.split('.');
      nameComponents.forEach((nameComponent, idx) => {
        if (idx < nameComponents.length - 1) {
          if (parent[nameComponent] === undefined) {
            parent[nameComponent] = {};
          }
          parent = parent[nameComponent];
        }
      });
      parent[nameComponents[nameComponents.length - 1]] = property.propertyValue;
      config[property.propertyName] = parent;
    } else {
      config[property.propertyName] = property.propertyValue;
    }
  });
  decryptNode(config);
  return Promise.resolve(config);
};
