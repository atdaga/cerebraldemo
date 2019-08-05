import uuid from 'uuid/v4';
import jwt from 'jsonwebtoken';
import randomize from 'randomatic';
import config from '../config';
import BCrypt from './BCrypt';
import { SystemRoles } from '../System';
import cPrincipalTbl from '../repositories/db/cPrincipalTable';
import cOrgPrincipalTbl, { orgPrincipalInfoDefaults } from '../repositories/db/cOrgPrincipalTable';
import * as principalSessionCache from '../repositories/cache/principalSessionCache';
import { UnauthorizedError, UserExistsError } from '../errors';
import { COrgRoles } from './roles';

const bcrypt = new BCrypt(12);

const clientExpirationSeconds = 60 * 60;

const jwtOptions = (subject, jwtid, human) => {
  const options = {
    issuer: config.apiEndpoint,
    subject,
    jwtid
  };
  if (!human) {
    // JWT expiration only for API client, not UI.
    options.expiresIn = clientExpirationSeconds;
  }
  return options;
};

const createUserJwt = (user, sessionId, systemRole) => {
  return jwt.sign({ email: user.primaryEmail, systemRole }, config.jwtSecret, jwtOptions(user.id, sessionId, user.human));
};

export const createClientJwt = (user, sessionId, systemRole, orgId) => {
  return jwt.sign({ email: user.primaryEmail, systemRole, orgId }, config.jwtSecret, jwtOptions(user.id, sessionId, user.human));
};

const getClientIpAddress = (req) => {
  let ipAddress = req.headers['x-forwarded-for'];
  if (ipAddress) {
    const ipAddresses = ipAddress.split(', ');
    ipAddress = (ipAddresses.length > 1) ? ipAddresses[0] : ipAddress;
  } else {
    ipAddress = req.headers.host.split(':')[0]; // eslint-disable-line prefer-destructuring
  }
  return ipAddress;
};

export const login = (req, username, password) => {
  let user;
  let orgIds;

  return cPrincipalTbl.findOne(req, { username })
    .then((retrievedUser) => {
      user = retrievedUser;
      if ((user) && (user.enabled) && (BCrypt.compare(password, user.password))) {
        return cOrgPrincipalTbl.findMany(req, { principalId: user.id });
      }

      throw new UnauthorizedError({ data: { username } });
    })
    .then((orgPrincipals) => {
      // Store principal in cache, with user-agent, ipAddress, orgIds, and expiration.
      const sessionId = uuid();
      const userAgent = req.headers['user-agent'];
      const ipAddress = getClientIpAddress(req);
      orgIds = orgPrincipals.map(orgPrincipal => orgPrincipal.orgId);
      const userOrClient = (user.human) ? 'user' : 'client';

      return principalSessionCache.addSession(req, sessionId, user.id, userAgent, ipAddress, orgIds, userOrClient);
    })
    .then(({ sessionId }) => {
      if (user.human) {
        return { user, sessionId, token: createUserJwt(user, sessionId, SystemRoles.systemUser), orgIds };
      }

      return { user, sessionId, token: createClientJwt(user, sessionId, SystemRoles.systemIntegration, orgIds[0]) };
    });
};

export const logout = (req, sessionId) => {
  return principalSessionCache.deleteSession(req, sessionId);
};

const principalInfoDefaults = {
  primaryEmailVerified: false,
  primaryPhone: null,
  primaryPhoneVerified: false,
  human: true,
  enabled: true,
  timeZone: null,
  namePrefix: null,
  middleName: null,
  nameSuffix: null,
  defaultLocale: 'en',
  iconId: null,
  preferences: {},
  systemRole: SystemRoles.systemUser
};

export const createUser = (req, userInfo) => {
  return cPrincipalTbl.findMany(req, { username: userInfo.username, primaryEmail: userInfo.primaryEmail }, 'or')
    .then((existingPrincipals) => {
      if (existingPrincipals.length > 0) {
        const errorData = existingPrincipals.reduce((data, existingPrincipal) => {
          if (userInfo.username === existingPrincipal.username) {
            data.username = userInfo.username; // eslint-disable-line no-param-reassign
          }
          if (userInfo.primaryEmail === existingPrincipal.primaryEmail) {
            data.primaryEmail = userInfo.primaryEmail; // eslint-disable-line no-param-reassign
          }
          return data;
        }, {});
        throw new UserExistsError({ message: 'User exists.', data: errorData });
      }

      return cPrincipalTbl.save(req, principalInfoDefaults, userInfo, { password: bcrypt.hash(userInfo.password) });
    });
};

export const createClient = (req, orgId) => {
  const clientId = randomize('A0', Math.floor((Math.random() * 10) + 32));
  const clientSecret = randomize('*', Math.floor((Math.random() * 10) + 40));
  const id = uuid();

  const clientInfo = {
    id,
    username: clientId,
    primaryEmail: `client-${id}@getcerebral.cloud`,
    password: bcrypt.hash(clientSecret),
    human: false,
    firstName: 'API',
    lastName: 'CLIENT',
    displayName: 'API CLIENT'
  };

  return req.app.locals.db.tx((t) => {
    req.dbTx = t;

    return t.batch([
      cPrincipalTbl.save(req, principalInfoDefaults, clientInfo),
      cOrgPrincipalTbl.save(req, orgPrincipalInfoDefaults, { orgId, principalId: id, roles: [COrgRoles.client] })
    ]);
  })
    .then(() => {
      delete req.dbTx;
      return { id, clientId, clientSecret };
    })
    .catch((err) => {
      delete req.dbTx;
      throw err;
    });
};

// export const updateUser = (req, userInfo) => {
//   // TODO:
// };
