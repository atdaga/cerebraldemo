import bcrypt from 'bcryptjs';

export default class BCrypt {
  salt;

  constructor(strength) {
    this.salt = bcrypt.genSaltSync(strength);
  }

  hash(input) {
    return bcrypt.hashSync(input, this.salt);
  }

  static compare(input, hash) {
    return bcrypt.compareSync(input, hash);
  }
}
