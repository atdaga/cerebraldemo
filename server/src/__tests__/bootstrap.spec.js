import start, { gracefulShutdown } from '../bootstrap';

beforeAll(async () => {
  await start();
});

afterAll(async () => {
  // jest.setTimeout(1000 * 22);
  await gracefulShutdown();
});


test('server starts', async () => {
  expect(true).toBe(true);
});
