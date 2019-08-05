import config from '../../config';
import Table from './Table';
import { COrgRoles } from '../../services/roles';

const tableName = `${config.dbTablePrefix}c_org_principal`;

export const orgPrincipalInfoDefaults = {
  enabled: true,
  roles: [COrgRoles.admin],
  preferences: {}
};

class COrgPrincipalTable extends Table {
  constructor() {
    super(tableName);
  }
}
const cOrgPrincipalTable = new COrgPrincipalTable();
export default cOrgPrincipalTable;
