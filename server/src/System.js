export const SystemId = '00000000-0000-0000-0000-000000000000';

export const SystemRoles = Object.freeze({
  system: 'system',
  systemRoot: 'systemRoot',
  systemAdmin: 'systemAdmin',
  systemUser: 'systemUser',
  systemIntegration: 'systemIntegration',
  from(value) { return (this[value]); }
});
