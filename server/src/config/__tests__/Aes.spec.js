import config from '../';
import Aes from '../Aes';

test('encrypt and decrypt', () => {
  const aes = new Aes(config.aesKey);

  const unencryptedString = 'Hello World!';
  const encryptedString = aes.encrypt(unencryptedString);
  const decryptedString = aes.decrypt(encryptedString);

  expect(decryptedString).toBe(unencryptedString);
});

test('key too short', () => {
  expect(() => { new Aes('Hello World'); }) // eslint-disable-line no-new
    .toThrowError(/^AES Key is too short/);
});

test('simple encrypt and decrypt cipher', () => {
  const aes = new Aes(config.aesKey);

  const unencryptedCipher = 'Hello World';
  const encryptedCipher = aes.encryptCipher(unencryptedCipher);
  const decryptedCipher = aes.decryptCiphers(encryptedCipher);

  expect(decryptedCipher).toBe(unencryptedCipher);
});

test('encrypt and decrypt cipher within longer string', () => {
  const aes = new Aes(config.aesKey);

  const unencryptedCipher = 'Hello World';
  const encryptedCipher = aes.encryptCipher(unencryptedCipher);
  const encryptedString = `abc${encryptedCipher}xyz`;
  const decryptedString = aes.decryptCiphers(encryptedString);

  expect(decryptedString).toBe(`abc${unencryptedCipher}xyz`);
});

test('no need to decrypt within longer string', () => {
  const aes = new Aes(config.aesKey);

  const unencryptedCipher = 'Hello World';
  const decryptedString = aes.decryptCiphers(unencryptedCipher);

  expect(decryptedString).toBe(unencryptedCipher);
});

test('encrypt and decrypt multiple ciphers within longer string', () => {
  const aes = new Aes(config.aesKey);

  const unencryptedCipher1 = 'Marisa Miller';
  const encryptedCipher1 = aes.encryptCipher(unencryptedCipher1);

  const unencryptedCipher2 = 'Heidi Klum';
  const encryptedCipher2 = aes.encryptCipher(unencryptedCipher2);

  const encryptedString = `${encryptedCipher2} and ${encryptedCipher1} got it goin on`;
  const decryptedString = aes.decryptCiphers(encryptedString);

  expect(decryptedString).toBe(`${unencryptedCipher2} and ${unencryptedCipher1} got it goin on`);
});
