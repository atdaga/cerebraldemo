import request from 'supertest';
import app, { versionInfo } from '../../express';

test('version info correct', async () => {
  return request(app)
    .get('/api/version')
    .expect(200, versionInfo);
});
