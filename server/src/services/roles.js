export const COrgRoles = Object.freeze({ // eslint-disable-line import/prefer-default-export
  client: 'client',
  user: 'user',
  admin: 'admin',
  from(value) { return (this[value]); }
});
