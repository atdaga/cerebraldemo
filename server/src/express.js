import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Helmet from 'helmet';
import express from 'express';
import expressValidation from 'express-validation';
import httpStatus from 'http-status';
import { UnauthorizedError as JwtUnauthorizedError } from 'express-jwt';
import jwtMiddleware from './jwtMiddleware';
import config from './config';
import { ApiError } from './errors';
import {
  setApp,
  errorMiddleware,
  preAuthMiddleware,
  postAuthMiddleware
} from './logger';
import routes from './routes';

const app = express();
setApp(app);

app.enable('trust proxy');
app.use(new Helmet()); // Add secure HTTP headers.

app.use(cookieParser(config.signedCookieSecret));

// Parse body params and attach them to req.body.
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({ origin: '*' }));

export const versionInfo = { // TODO: Get real info when CI is done.
  version: '1.0.0', // From package.json.
  buildNumber: 'buildNumber', // From Jenkins.
  buildId: 'buildId', // From Jenkins.
  buildTime: 'buildTime', // From Jenkins.
  commitId: 'commitId', // From GIT.
  commitTime: 'commitTime' // From GIT.
};

app.get('/actuator/health', (req, res) => {
  res.status(httpStatus.OK).end();
});

app.use(preAuthMiddleware);

app.use(express.static(path.join(__dirname, '../', 'webapp'), { fallthrough: true }));

// Extract API version in request and put in request as "apiVersion", defaulting to 0.
app.use((req, res, next) => {
  let apiVersion = 0;

  const vMatch = req.url.match(/\/v\d+\//);
  if (vMatch !== null) {
    const vMatchStr = vMatch[0].substring(2, vMatch[0].length - 1);
    try {
      apiVersion = Number(vMatchStr);
      if (apiVersion > config.apiVersion) {
        throw new Error();
      }
    } catch (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, httpStatus.BAD_REQUEST, `Invalid API Version: ${vMatchStr}`);
    }
  }

  req.apiVersion = apiVersion;
  next();
});

app.use(jwtMiddleware.unless({
  path: [
    // UI paths.
    /^\/$/,
    /^\/login/,
    /^\/app\/.*/,

    // API paths.
    /^\/api\/(v\d+\/)?version/,
    /^\/api\/(v\d+\/)?auth\/login/,
    /^\/api\/(v\d+\/)?auth\/logout/,
    /^\/api\/(v\d+\/)?users\/registerUser/,
    /^\/api\/(v\d+\/)?users\/validateEmail/,
    /^\/api\/(v\d+\/)?users\/createUser/,
    /^\/api\/(v\d+\/)?users\/forgotPassword/,
    /^\/api\/(v\d+\/)?users\/resetPassword/,
    /^\/api\/(v\d+\/)?questionaire/,
    /^\/api\/(v\d+\/)?users\/passwordreset/,
    /^\/api\/(v\d+\/)?passwordupdate/
  ]
}));

app.use(postAuthMiddleware);

// Mount all API routes.
app.get('/api/version', (req, res) => {
  // TODO:
  res.json(versionInfo);
});
app.use('/api', routes);
app.use('/api/v:apiVersion/', routes);

// Mount UI routes.
let cachedIndexPage;
const compileIndexPage = (requestUrl) => { // eslint-disable-line no-unused-vars
  if (!cachedIndexPage) {
    cachedIndexPage = fs.readFileSync(`${__dirname}/../webapp/index.html`);
  }
  return cachedIndexPage;
};

app.get(/^\/app.*$/, (req, res) => {
  res.set({ 'Content-Type': 'text/html' });
  res.send(compileIndexPage(req.originalUrl));
});

app.get(/^\/login.*$/, (req, res) => {
  res.set({ 'Content-Type': 'text/html' });
  res.send(compileIndexPage(req.originalUrl));
});

// Catch 404 and forward to error handler.
app.use((req, res, next) => {
  if (((req.method === 'GET') || (req.method === 'POST')) && ((req.url === '/graphql') || (req.url === '/graphqlgraphql'))) {
    // Ignore path, as it's handled by /graphql.
    return next();
  }

  const err = new ApiError(httpStatus.NOT_FOUND, httpStatus.NOT_FOUND, {
    message: 'API not found.',
    data: {
      method: req.method,
      url: req.url
    }
  });
  return next(err);
});

// If error is not an instanceOf ApiError, convert it.
app.use((err, req, res, next) => {
  let e = err;
  if (err instanceof expressValidation.ValidationError) {
    const unifiedErrorMessage = err.errors.map((error) => {
      return error.messages.join('. ');
    }).join(' and ');
    e = new ApiError(httpStatus.BAD_REQUEST, httpStatus.BAD_REQUEST, { message: `Body validation error(s): ${unifiedErrorMessage}`, warning: true });
  } else if (err instanceof JwtUnauthorizedError) {
    e = new ApiError(httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED, { message: 'Invalid credentials.', nestedError: err, warning: true, logMessage: err.message });
  } else if (!(err instanceof ApiError)) {
    e = new ApiError(httpStatus.INTERNAL_SERVER_ERROR, httpStatus.INTERNAL_SERVER_ERROR, { message: 'Internal server error.', nestedError: err, logMessage: err.message });
  }

  next(e);
});

app.use(errorMiddleware);

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  res.status(err.httpStatus).json({
    code: err.errorCode,
    message: err.messageOnly,
    data: err.data,
    cId: req.cId
  });
});

export default app;
