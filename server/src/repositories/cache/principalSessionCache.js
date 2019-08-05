import config from '../../config';

const defaultUserSessionExpirationSeconds = 60 * 60 * 24 * 7; // Currently 7 days.
const defaultClientSessionExpirationSeconds = 60 * 60; // Currently 1 hour.

const sessionHashKey = (sessionId) => {
  return `${config.redisPrefix}${sessionId}#session`;
};

const userSessionsHashKey = (userId) => {
  return `${config.redisPrefix}${userId}#userSessions`;
};


export const getSession = (req, sessionId) => {
  return req.app.locals.redis.hmgetAsync(sessionHashKey(sessionId), 'userAgent', 'ipAddress', 'userId', 'orgIds')
    .then(([userAgent, ipAddress, userId, orgIds]) => {
      if (userAgent === null) {
        return undefined;
      }
      return { sessionId, userId, userAgent, ipAddress, orgIds };
    });
};

/**
 * For users only, not clients.
 *
 * @param req
 * @param sessionId
 * @returns {Promise<any>}
 */
export const getSessionAndResetExpiration = (req, sessionId) => {
  return new Promise((resolve, reject) => {
    const multi = req.app.locals.redis.multi();
    multi.hmget(sessionHashKey(sessionId), 'userAgent', 'ipAddress', 'userId', 'orgIds');
    multi.expire(sessionHashKey(sessionId), defaultUserSessionExpirationSeconds);
    multi.execAsync()
      .then(([session, exists]) => {
        if (exists === 1) {
          const userAgent = session[0];
          const ipAddress = session[1];
          const userId = session[2];
          const orgIds = session[3];
          resolve({ sessionId, userId, userAgent, ipAddress, orgIds });
        }
      })
      .catch(err => reject(err));
  });
};

const getInvalidSessionsByUserId = (req, userId) => {
  return new Promise((resolve, reject) => {
    let sessionIds;
    req.app.locals.redis.smembersAsync(userSessionsHashKey(userId))
      .then((retrievedSessionIds) => {
        sessionIds = retrievedSessionIds;
        if (sessionIds.length > 0) {
          const multi = req.app.locals.redis.multi();
          sessionIds.forEach(sessionId => multi.exists(sessionId));
          return multi.execAsync();
        }
        return undefined;
      })
      .then((exists) => {
        const invalidSessionIds = [];
        if (exists) {
          for (let i = 0; i < exists.length; i += 1) {
            if (exists[i] === 0) {
              invalidSessionIds.push(sessionIds[i]);
            }
          }
        }
        resolve(invalidSessionIds);
      })
      .catch(err => reject(err));
  });
};

export const addSession = (req, sessionId, userId, userAgent, ipAddress, orgIds, userOrClient = 'user') => {
  return new Promise((resolve, reject) => {
    getInvalidSessionsByUserId(req, userId)
      .then((invalidSessionIds) => {
        const sessionKey = sessionHashKey(sessionId);
        const userKey = userSessionsHashKey(userId);
        const multi = req.app.locals.redis.multi();
        multi.hmset(sessionKey,
          'userAgent', userAgent,
          'ipAddress', ipAddress,
          'userId', userId,
          'orgIds', JSON.stringify(orgIds));
        const expiration = (userOrClient === 'user') ? defaultUserSessionExpirationSeconds : defaultClientSessionExpirationSeconds;
        multi.expire(sessionKey, expiration);
        multi.sadd(userKey, sessionId);
        invalidSessionIds.forEach(invalidSessionId => multi.srem(userKey, invalidSessionId));
        return multi.execAsync();
      })
      .then(() => {
        resolve({ sessionId, userId, userAgent, ipAddress, orgIds });
      })
      .catch(err => reject(err));
  });
};

export const deleteSession = (req, sessionId) => {
  return new Promise((resolve, reject) => {
    let sessionInfo;
    getSession(req, sessionId)
      .then(({ userAgent, ipAddress, userId }) => {
        if (userId) {
          sessionInfo = { sessionId, userId, userAgent, ipAddress };
          const multi = req.app.locals.redis.multi();
          multi.del(sessionHashKey(sessionId));
          multi.srem(userSessionsHashKey(userId), sessionId);
          return multi.execAsync();
        }
        return undefined;
      })
      .then(() => resolve(sessionInfo))
      .catch(err => reject(err));
  });
};
