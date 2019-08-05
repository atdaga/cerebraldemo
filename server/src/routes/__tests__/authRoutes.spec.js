import request from 'supertest';
import _ from 'lodash';
import jwtDecode from 'jwt-decode';
import start, { gracefulShutdown } from '../../bootstrap';
import app from '../../express';
import { createPseudoRequest } from '../../logger';
import * as principalSvc from '../../services/principalService';
import * as orgSvc from '../../services/orgService';
import kPrincipalTbl from '../../repositories/db/kPrincipalTable';
import kOrgTbl from '../../repositories/db/kOrgTable';
import kOrgPrincipalTbl from '../../repositories/db/kOrgPrincipalTable';
import * as principalSessionCache from '../../repositories/cache/principalSessionCache';
import config from '../../config';

beforeAll(async () => {
  await start();
});

afterAll(async () => {
  // jest.setTimeout(1000 * 22); // Takes a while to shutdown cleanly b/c of the stupid SQS listener.
  await gracefulShutdown();
});


test('user login with bad username', async () => {
  return request(app)
    .post('/api/auth/login')
    .send({ username: 'heidi', password: 'klum' })
    .then(response => response.body)
    .then((body) => {
      expect(body).toHaveProperty('code', 401);
      expect(body).toHaveProperty('message', 'Invalid credentials.');
      expect(body).toHaveProperty('cId');
    });
});

test('user login with bad password', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'marisa',
    primaryEmail: 'marisa@miller.com',
    password: 'P@ssword1',
    firstName: 'Marisa',
    lastName: 'Miller',
    displayName: 'Marisa Miller'
  };
  const user = await principalSvc.createUser(req, userInfo);

  try {
    await request(app)
      .post('/api/auth/login')
      .send({ username: userInfo.username, password: 'miller' })
      .expect(401);
  } finally {
    await kPrincipalTbl.deleteById(req, user.id);
  }
});

test('user login disabled', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'marisa',
    primaryEmail: 'marisa@miller.com',
    password: 'P@ssword1',
    firstName: 'Marisa',
    lastName: 'Miller',
    displayName: 'Marisa Miller',
    enabled: false
  };
  const user = await principalSvc.createUser(req, userInfo);

  try {
    await request(app)
      .post('/api/auth/login')
      .send({ username: userInfo.username, password: userInfo.password })
      .expect(401);
  } finally {
    await kPrincipalTbl.deleteById(req, user.id);
  }
});

test('user login successfully', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'stephanie',
    primaryEmail: 'stephanie@seymour.com',
    password: 'P@ssword1',
    firstName: 'Stephanie',
    lastName: 'Seymour',
    displayName: 'Stephanie Seymour'
  };
  const user = await principalSvc.createUser(req, userInfo);

  // username, primaryEmail, password not in return
  const expectedUser = _.cloneDeep(user);
  delete expectedUser.password;
  delete expectedUser.human;
  expectedUser.created = expectedUser.created.toISOString();
  expectedUser.lastModified = expectedUser.lastModified.toISOString();
  const expectedBody = {
    user: expectedUser,
    websocketUrl: config.apiEndpoint
  };

  let sessionId;
  try {
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ username: userInfo.username, password: userInfo.password })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => response.body)
      .then((body) => {
        expect(body).toHaveProperty('token');
        expect(body).toMatchObject(expectedBody);
        expect(body).toHaveProperty('orgIds');

        const { token } = body;
        sessionId = jwtDecode(token).jti;
      });

    const existingSession = await principalSessionCache.getSessionAndResetExpiration(req, sessionId);
    expect(existingSession).toHaveProperty('sessionId', sessionId);
  } finally {
    await kPrincipalTbl.deleteById(req, user.id);
    if (sessionId) {
      await principalSessionCache.deleteSession(req, sessionId);
    }
  }
});

test('user login and logout', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'stephanie',
    primaryEmail: 'stephanie@seymour.com',
    password: 'P@ssword1',
    firstName: 'Stephanie',
    lastName: 'Seymour',
    displayName: 'Stephanie Seymour'
  };
  const user = await principalSvc.createUser(req, userInfo);

  // username, primaryEmail, password not in return
  const expectedUser = _.cloneDeep(user);
  delete expectedUser.password;
  delete expectedUser.human;
  expectedUser.created = expectedUser.created.toISOString();
  expectedUser.lastModified = expectedUser.lastModified.toISOString();
  const expectedBody = {
    // token: expect.stringMatching(/^.+/),
    user: expectedUser,
    websocketUrl: config.apiEndpoint
  };

  let sessionId;
  let token;
  try {
    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ username: userInfo.username, password: userInfo.password })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => response.body)
      .then((body) => {
        expect(body).toHaveProperty('token');
        expect(body).toMatchObject(expectedBody);
        expect(body).toHaveProperty('orgIds');

        token = body.token; // eslint-disable-line prefer-destructuring
        sessionId = jwtDecode(token).jti;
      });

    await request(app)
      .get('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const existingSession = await principalSessionCache.getSession(req, sessionId);
    expect(existingSession).toBeUndefined();
  } finally {
    await kPrincipalTbl.deleteById(req, user.id);
  }
});

test('user login with org and logout', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'stephanie',
    primaryEmail: 'stephanie@seymour.com',
    password: 'P@ssword1',
    firstName: 'Stephanie',
    lastName: 'Seymour',
    displayName: 'Stephanie Seymour'
  };
  const user = await principalSvc.createUser(req, userInfo);

  const orgInfo = {
    name: 'Victoria\'s Secret'
  };
  const org = await orgSvc.createOrg(req, orgInfo, { principalId: user.id });


  // username, primaryEmail, password not in return
  const expectedUser = _.cloneDeep(user);
  delete expectedUser.password;
  delete expectedUser.human;
  expectedUser.created = expectedUser.created.toISOString();
  expectedUser.lastModified = expectedUser.lastModified.toISOString();
  const expectedBody = {
    user: expectedUser,
    websocketUrl: config.apiEndpoint
  };

  try {
    let sessionId;
    let token;

    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ username: userInfo.username, password: userInfo.password })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => response.body)
      .then((body) => {
        expect(body).toHaveProperty('token');
        expect(body).toMatchObject(expectedBody);
        expect(body).toHaveProperty('orgIds');

        token = body.token; // eslint-disable-line prefer-destructuring
        sessionId = jwtDecode(token).jti;
      });

    await request(app)
      .get('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const existingSession = await principalSessionCache.getSession(req, sessionId);
    expect(existingSession).toBeUndefined();
  } finally {
    await kOrgPrincipalTbl.delete(req, { orgId: org.id, principalId: user.id });
    await kOrgTbl.deleteById(req, org.id);
    await kPrincipalTbl.deleteById(req, user.id);
  }
});

test('client login and logout', async () => {
  const req = createPseudoRequest();
  const userInfo = {
    username: 'stephanie',
    primaryEmail: 'stephanie@seymour.com',
    password: 'P@ssword1',
    firstName: 'Stephanie',
    lastName: 'Seymour',
    displayName: 'Stephanie Seymour'
  };
  const user = await principalSvc.createUser(req, userInfo);

  const orgInfo = {
    name: 'Swimsuit Illustrated'
  };
  const org = await orgSvc.createOrg(req, orgInfo, { principalId: user.id });

  const { clientId, clientSecret } = await principalSvc.createClient(req, org.id);

  try {
    let sessionId;
    let token;

    await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ username: clientId, password: clientSecret })
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => response.body)
      .then((body) => {
        expect(body).toHaveProperty('token');
        expect(body).not.toHaveProperty('user');
        expect(body).not.toHaveProperty('websocketUrl');

        token = body.token; // eslint-disable-line prefer-destructuring
        const decodedToken = jwtDecode(token);
        sessionId = decodedToken.jti;
        expect(decodedToken.orgId).toBe(org.id);
      });

    let existingSession = await principalSessionCache.getSession(req, sessionId);
    expect(existingSession).toBeDefined();

    await request(app)
      .get('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    existingSession = await principalSessionCache.getSession(req, sessionId);
    expect(existingSession).toBeUndefined();
  } finally {
    await kOrgPrincipalTbl.delete(req, { orgId: org.id });
    await kOrgTbl.deleteById(req, org.id);
    await kPrincipalTbl.deleteById(req, user.id);
    await kPrincipalTbl.delete(req, { username: clientId });
  }
});
