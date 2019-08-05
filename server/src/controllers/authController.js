import httpStatus from 'http-status';
import config from '../config';
import jwtMiddleware from '../jwtMiddleware';
import { apiVersionedVisibility, publishByApiVersion } from '../publishedVisibility';
import * as principalSvc from '../services/principalService';
import { ApiError, UnauthorizedError } from '../errors';

export const login = (req, res, next) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  delete req.body.password;

  principalSvc.login(req, username, password)
    .then(({ user, sessionId, token, orgIds }) => {
      if (user.human) {
        res.cookie('session', sessionId, { httpOnly: true, secure: true, signed: true });
        res.status(httpStatus.OK)
          .json({
            token,
            user: publishByApiVersion(req, apiVersionedVisibility.privateUser, user),
            orgIds,
            websocketUrl: config.apiEndpoint,
            graphqlUrl: `${config.apiEndpoint}/graphql`
          });
      } else {
        res.status(httpStatus.OK)
          .json({
            token
          });
      }
    })
    .catch((err) => {
      if (err instanceof UnauthorizedError) {
        next(new ApiError(httpStatus.UNAUTHORIZED, httpStatus.UNAUTHORIZED, { message: 'Invalid credentials.', nestedError: err, warning: true }));
      } else {
        next(err);
      }
    });
};

export const logout = (req, res) => {
  jwtMiddleware(req, res, () => {
    if (req.user) {
      principalSvc.logout(req, req.user.jti)
        .then(() => res.status(httpStatus.NO_CONTENT).end());
    } else {
      res.status(httpStatus.NO_CONTENT).end();
    }
  });
};
