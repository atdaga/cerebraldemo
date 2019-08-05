import BCrypt from '../BCrypt';

test('one-way hash matches', () => {
  const bcrypt = new BCrypt(12);
  const password = 'P@ssword1';

  const hash = bcrypt.hash(password);
  const matches = BCrypt.compare(password, hash);
  expect(matches).toBe(true);
});

test('one-way hash doesn\'t matches', () => {
  const bcrypt = new BCrypt(12);
  const password = 'P@ssword1';

  const hash = bcrypt.hash(password);
  const matches = BCrypt.compare('chick', hash);
  expect(matches).toBe(false);
});
