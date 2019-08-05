import _ from 'lodash';
import moment from 'moment';
import { SystemId } from '../../System';

/**
 * Allow transaction support.
 *
 * @param req
 * @returns {*}
 */
export const db = (req) => {
  return req.dbTx || req.app.locals.db;
};

const utcOffsetOfLocal = moment().utcOffset() * 60 * 1000;

export const dbTsToMoment = (dbTs) => {
  return moment(dbTs.getTime() + utcOffsetOfLocal).utc();
};

export const convertModelKeyToDbField = (modelKey) => {
  return _.kebabCase(modelKey).replace(/-/g, '_');
};

export const convertModelToDbFields = (model) => {
  return Object.keys(model).reduce((dbFields, key) => {
    dbFields[convertModelKeyToDbField(key)] = model[key]; // eslint-disable-line no-param-reassign
    return dbFields;
  }, {});
};

export const convertDbFieldsToModel = (dbFields) => {
  return Object.keys(dbFields).reduce((model, key) => {
    const modelFieldName = _.camelCase(key);
    const fieldValue = dbFields[key];
    model[modelFieldName] = (fieldValue instanceof Date) ? dbTsToMoment(fieldValue) : fieldValue; // eslint-disable-line no-param-reassign
    return model;
  }, {});
};

export const ComparisonOperator = Object.freeze({
  equal: '=',
  notEqual: '!=',
  greaterThan: '>',
  greaterThanOrEqual: '>',
  lessThan: '<',
  lessThanOrEqual: '<=',
  in: 'in',
  between: 'between',
  isNull: 'is null',
  isNotNull: 'is not null',
  like: 'like',
  from(value) { return (this[value]); }
});

export const AndOr = Object.freeze({
  and: 'and',
  or: 'or',
  from(value) { return (this[value]); }
});

export const Order = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC',
  from(value) { return (this[value]); }
});

/**
 * Free-form query, typically used across multiple tables.
 *
 * @param req
 * @param query
 * @param params
 * @returns {PromiseLike<T | never> | Promise<T | never> | void}
 */
export const findMany = (req, query, params) => {
  req.logger.silly(`findMany(),\nquery=${query}\nparams=${params}\n`);
  return req.app.locals.db.any({
    text: query,
    values: params
  })
    .then(data => data.map(item => convertDbFieldsToModel(item)));
};


export default class Table {
  tableName;

  shadowable;

  constructor(tableName, shadowable = true) {
    if (new.target === Table) {
      throw new TypeError('Cannot construct Table instances directly.');
    }

    this.tableName = tableName;
    this.shadowable = shadowable;
  }

  findAll(req) {
    return db(req).any({
      text: `SELECT * FROM ${this.tableName}`,
    })
      .then(data => data.map(item => convertDbFieldsToModel(item)));
  }

  findOne(req, attribs, { andor = 'and', load } = { andor: 'and' }) {
    andor = andor || 'and'; // eslint-disable-line no-param-reassign
    const dbFields = convertModelToDbFields(attribs);
    let text = `SELECT ${this.tableName}.*`;

    if (load) {
      Object.keys(load).forEach((attribName) => {
        const { tableName } = load[attribName];
        text += `, ${tableName}.*`;
      });
      text += ` FROM ${this.tableName}`;
      Object.keys(load).forEach((attribName) => {
        const { tableName } = load[attribName];
        const attrib = convertModelKeyToDbField(load[attribName].attrib);
        text += ` join ${tableName} on ${tableName}.${attrib} = ${this.tableName}.${convertModelKeyToDbField(attribName)}`;
      });
      text += ' where';
    } else {
      text += ` FROM ${this.tableName} where`;
    }

    const values = [];
    Object.keys(dbFields).forEach((key) => {
      if (values.length > 0) {
        text += ` ${andor}`;
      }
      text += ` ${this.tableName}.${key} = $${values.length + 1}`;
      values.push(dbFields[key]);
    });

    req.logger.silly(`findOne(),\nquery=${text}\nparams=${values}\n`);
    return db(req).one({
      text,
      values
    })
      .then(data => convertDbFieldsToModel(data))
      .catch((err) => {
        if (err.code !== 0) {
          throw err;
        }
      });
  }

  /**
   * Example load: { attribName: { tableName, attrib } }
   *
   * @param req
   * @param attribs
   * @param andor
   * @param orderBys
   * @param load
   * @returns {PromiseLike<T | never> | Promise<T | never> | void}
   */
  findMany(req, attribs, { andor = 'and', orderBys, load } = { andor: 'and' }) {
    andor = andor || 'and'; // eslint-disable-line no-param-reassign
    const dbFields = convertModelToDbFields(attribs);
    let text = `SELECT ${this.tableName}.*`;

    if (load) {
      Object.keys(load).forEach((attribName) => {
        const { tableName } = load[attribName];
        text += `, ${tableName}.*`;
      });
      text += ` FROM ${this.tableName}`;
      Object.keys(load).forEach((attribName) => {
        const { tableName } = load[attribName];
        const attrib = convertModelKeyToDbField(load[attribName].attrib);
        text += ` join ${tableName} on ${tableName}.${attrib} = ${this.tableName}.${convertModelKeyToDbField(attribName)}`;
      });
      text += ' where';
    } else {
      text += ` FROM ${this.tableName} where`;
    }

    const values = [];
    Object.keys(dbFields).forEach((key) => {
      const value = dbFields[key];
      if (value) {
        if (values.length > 0) {
          text += ` ${andor}`;
        }

        if ((_.isArray(value)) && (value.length > 0)) {
          if (value[0].operator) { // Separate with operator.
            value.forEach((operatorWithValue) => {
              if (operatorWithValue.andor) {
                text += ` ${operatorWithValue.andor}`;
              }
              text += ` ${this.tableName}.${key} ${operatorWithValue.operator} $${values.length + 1}`;
              values.push(operatorWithValue.value);
            });
          } else { // This is an IN statement.
            text += ` ${this.tableName}.${key} in (`;
            let separator = '';
            value.forEach((inValue) => {
              text += `${separator}$${values.length + 1}`;
              values.push(inValue);
              separator = ', ';
            });
            text += ')';
          }
        } else {
          text += ` ${this.tableName}.${key} = $${values.length + 1}`;
          values.push(dbFields[key]);
        }
      }
    });

    if ((orderBys) && (orderBys.length > 0)) {
      let columnName = convertModelKeyToDbField(orderBys[0].attrib);
      text += ` order by ${this.tableName}.${columnName} ${orderBys[0].order}`;

      if (orderBys.length > 1) {
        columnName = convertModelKeyToDbField(orderBys[1].attrib);
        text += ` order by ${this.tableName}.${columnName} ${orderBys[1].order}`;
      }
    }

    req.logger.silly(`findMany(),\nquery=${text}\nparams=${values}\n`);
    return db(req).any({
      text,
      values
    })
      .then(data => data.map(item => convertDbFieldsToModel(item)));
  }

  findManyAllowNull(req, attribs) {
    const dbFields = convertModelToDbFields(attribs);
    let text = `SELECT * FROM ${this.tableName} where`;
    const values = [];
    Object.keys(dbFields).forEach((key) => {
      if (values.length > 0) {
        text += ' and';
      }
      text += ` ((${key} = $${values.length + 1}) or (${key} is NULL))`;
      values.push(dbFields[key]);
    });
    return db(req).any({
      text,
      values
    })
      .then(data => data.map(item => convertDbFieldsToModel(item)));
  }

  save(req, attribs, ...overlayAttribs) {
    const model = _.merge({}, attribs, ...overlayAttribs);
    const sub = req.user ? req.user.sub : SystemId;

    if (this.shadowable) {
      if (!model.created) {
        model.created = req.now;
      }
      if (!model.createdBy) {
        model.createdBy = sub;
      }
      if (!model.lastModified) {
        model.lastModified = req.now;
      }
      if (!model.lastModifiedBy) {
        model.lastModifiedBy = sub;
      }
    }

    const saveObj = convertModelToDbFields(model);

    const attribNames = Object.keys(saveObj).join(', ');
    const attribValues = Object.values(saveObj);
    let cnt = 0;
    const valueParams = Object.keys(saveObj).map(() => `$${++cnt}`).join(', '); // eslint-disable-line no-plusplus
    const text = `INSERT INTO ${this.tableName}(${attribNames}) VALUES (${valueParams})`;
    return db(req).result(text, attribValues)
      .then(result => model); // eslint-disable-line no-unused-vars
  }

  saveRaw(req, attribs, ...overlayAttribs) {
    const model = _.merge({}, attribs, ...overlayAttribs);

    const saveObj = convertModelToDbFields(model);

    const attribNames = Object.keys(saveObj).join(', ');
    const attribValues = Object.values(saveObj);
    let cnt = 0;
    const valueParams = Object.keys(saveObj).map(() => `$${++cnt}`).join(', '); // eslint-disable-line no-plusplus
    const text = `INSERT INTO ${this.tableName}(${attribNames}) VALUES (${valueParams})`;
    return db(req).result(text, attribValues)
      .then(result => model); // eslint-disable-line no-unused-vars
  }

  update(req, updateAttribs, whereAttribs, { andor = 'and', orderBys } = { andor: 'and' }) {
    const model = _.cloneDeep(updateAttribs);

    if (this.shadowable) {
      if (!model.lastModified) {
        model.lastModified = req.now;
      }
      if (!model.lastModifiedBy) {
        model.lastModifiedBy = req.user.sub;
      }
    }

    const saveObj = convertModelToDbFields(model);
    let text = `UPDATE ${this.tableName} set`;
    const values = Object.values(saveObj);
    let setSeparator = ' ';
    let idx = 0;
    Object.keys(saveObj).forEach((key) => {
      text += `${setSeparator}${key} = $${idx + 1}`;
      setSeparator = ', ';
      idx += 1;
    });

    andor = andor || 'and'; // eslint-disable-line no-param-reassign
    const dbFields = convertModelToDbFields(whereAttribs);
    text += ' where';
    let oper = false;
    Object.keys(dbFields).forEach((key) => {
      const value = dbFields[key];
      if (value) {
        if (oper) {
          text += ` ${andor}`;
        } else {
          oper = true;
        }

        if ((_.isArray(value)) && (value.length > 0)) {
          if (value[0].operator) { // Separate with operator.
            value.forEach((operatorWithValue) => {
              if (operatorWithValue.andor) {
                text += ` ${operatorWithValue.andor}`;
              }
              text += ` ${key} ${operatorWithValue.operator} $${values.length + 1}`;
              values.push(operatorWithValue.value);
            });
          } else { // This is an IN statement.
            text += ` ${key} in (`;
            let separator = '';
            value.forEach((inValue) => {
              text += `${separator}$${values.length + 1}`;
              values.push(inValue);
              separator = ', ';
            });
            text += ')';
          }
        } else {
          text += ` ${key} = $${values.length + 1}`;
          values.push(dbFields[key]);
        }
      }
    });

    if ((orderBys) && (orderBys.length > 0)) {
      let columnName = convertModelKeyToDbField(orderBys[0].attrib);
      text += ` order by ${columnName} ${orderBys[0].order}`;

      if (orderBys.length > 1) {
        columnName = convertModelKeyToDbField(orderBys[1].attrib);
        text += ` order by ${columnName} ${orderBys[1].order}`;
      }
    }

    req.logger.silly(`update(),\nquery=${text}\nparams=${values}\n`);
    return db(req).result(text, values)
      .then(result => result.rowCount);
  }

  deleteById(req, id) {
    return db(req).result(`DELETE FROM ${this.tableName} WHERE id = $1`, id)
      .then(result => result.rowCount);
  }

  delete(req, attribs, { andor = 'and' } = { andor: 'and' }) {
    andor = andor || 'and'; // eslint-disable-line no-param-reassign
    const dbFields = convertModelToDbFields(attribs);
    let text = `DELETE FROM ${this.tableName} where`;
    const values = [];
    Object.keys(dbFields).forEach((key) => {
      if (values.length > 0) {
        text += ` ${andor}`;
      }
      text += ` ${key} = $${values.length + 1}`;
      values.push(dbFields[key]);
    });

    return db(req).result({
      text,
      values
    })
      .then(result => result.rowCount);
  }
}
