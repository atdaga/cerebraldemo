import AWS from 'aws-sdk';
import pgPromise from 'pg-promise';
import config, { applyPropertiesFromDbToConfig, applyEnvironmentToConfig } from './config';
import app from './express';
import logger, { createPseudoRequest } from './logger';
import cPropertyTable from './repositories/db/cPropertyTable';

const pgp = pgPromise({});

let server;

const startupInfo1 = () => {
  logger.info('Web Server Startup');
  logger.info('---------------------------------------------------------');
  logger.info(`Deployment Env       : ${config.deploymentEnv}`);
  logger.info(`Db Host              : ${config.dbHost}`);
  logger.info(`Db Port              : ${config.dbPort}`);
  logger.info(`Db Name              : ${config.dbName}`);
  logger.info(`Db User              : ${config.dbUser}`);
};

const startupInfo2 = () => {
  logger.info(`Db Table Prefix      : ${config.dbTablePrefix}`);
  logger.info(`AWS Region           : ${config.aws.region}`);
  logger.info(`Node Port            : ${config.nodePort}`);
  logger.info(`Api Endpoint         : ${config.apiEndpoint}`);
  logger.info(`Webapp Base Uri      : ${config.webappBaseUri}`);
  logger.info();
  logger.info(`Logger Level         : ${config.loggerLevel}`);
  logger.info(`Logger Json          : ${config.loggerJson}`);
  logger.info();
};

const startupInfo3 = () => {
  logger.info('All systems go! 🚀');
  logger.info('---------------------------------------------------------');
};


export const connectDb = () => {
  const connectOptions = {
    host: config.dbHost,
    port: config.dbPort,
    database: config.dbName,
    user: config.dbUser,
    password: config.dbPassword
  };

  app.locals.db = pgp(connectOptions);
  return Promise.resolve(app.locals.db);
};

export const disconnectDb = (db) => {
  return db.$pool.end()
    .then(() => {
      logger.info('Disconnected from PostgreSQL.');
    });
};


export const initAws = () => {
  if (config.aws.accessKeyId) {
    AWS.config.update({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region
    });
  } else {
    AWS.config.update({ region: config.aws.region });
  }
  return Promise.resolve();
};


export const startServer = () => {
  if (process.env.NODE_ENV === 'test') {
    // Supertest creates ephemeral port, which is needed for jest child processes.
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const httpServer = app.listen(config.nodePort, (err) => {
      if (err) {
        logger.error(`Error starting server on port ${config.nodePort}.`, err);
        reject(err);
      } else {
        logger.info(`Server started on port ${config.nodePort}`);
        resolve(httpServer);
      }
    });
  });
};

const stopServer = (httpServer) => {
  if (process.env.NODE_ENV === 'test') {
    return Promise.resolve();
  }

  return new Promise((resolveHttpServer) => {
    httpServer.close(() => {
      logger.info('Stopped server.');
      resolveHttpServer();
    });
  });
};

// This function is called when you want the server to die gracefully.
// i.e. wait for existing connections to close.
export const gracefulShutdown = () => {
  logger.info('Received kill signal, shutting down gracefully...');

  const kill = setTimeout(() => { // eslint-disable-line no-unused-vars
    logger.error('Could not shutdown in time, forcefully shutting down.');
    process.exit();
  }, 25 * 1000); // Force shutdown in 25 seconds.

  return stopServer(server)
    .then(() => Promise.all([disconnectDb(app.locals.db)]))
    .then(() => clearTimeout(kill))
    .catch(err => logger.error(err));
};

const registerGracefulShutdown = () => {
  return new Promise((resolve) => {
    // Listen for TERM signal .e.g. kill.
    process.on('SIGTERM', gracefulShutdown);

    // Listen for INT signal e.g. Ctrl-C.
    process.on('SIGINT', gracefulShutdown);

    resolve();
  });
};


const start = () => {
  const req = createPseudoRequest();
  return applyEnvironmentToConfig()
    .then(() => startupInfo1())
    .then(() => connectDb())
    .then(() => cPropertyTable.findByEnvironment(req))
    .then((propertiesFromDb) => {
      logger.info('Connected to PostgreSQL.');
      return applyPropertiesFromDbToConfig(propertiesFromDb);
    })
    .then(() => applyEnvironmentToConfig()) // Reapply, since environment takes precedence.
    .then(() => startupInfo2())
    .then(() => initAws())
    .then(redisClient => startServer(redisClient))
    .then((httpServer) => {
      server = httpServer;
      return registerGracefulShutdown();
    })
    .then(() => startupInfo3())
    .catch(err => logger.error(err));
};
export default start;
