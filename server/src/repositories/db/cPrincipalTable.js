import _ from 'lodash';
import uuid from 'uuid/v4';
import config from '../../config';
import Table from './Table';

const tableName = `${config.dbTablePrefix}c_principal`;

class CPrincipalTable extends Table {
  constructor() {
    super(tableName);
  }

  save(req, attribs, ...overlayAttribs) {
    const model = _.merge({}, attribs, ...overlayAttribs);
    if (!model.id) {
      return super.save(req, model, { id: uuid() });
    }
    return super.save(req, model);
  }
}
const cPrincipalTable = new CPrincipalTable();
export default cPrincipalTable;
