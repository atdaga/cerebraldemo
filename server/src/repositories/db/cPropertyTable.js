import config from '../../config';
import Table from './Table';

const tableName = `${config.dbTablePrefix}c_property`;

class CPropertyTable extends Table {
  constructor() {
    super(tableName);
  }

  findByEnvironment(req) {
    return this.findManyAllowNull(req, { environment: config.deploymentEnv })
      .then((properties) => {
        const props = {};
        properties.forEach((property) => {
          if (props[property.propertyName]) {
            if (property.environment) {
              props[property.propertyName] = property.propertyValue;
            }
          } else {
            props[property.propertyName] = property.propertyValue;
          }
        });
        return Object.keys(props).map((key) => { return { propertyName: key, propertyValue: props[key] }; });
      });
  }
}
const cPropertyTable = new CPropertyTable();
export default cPropertyTable;
