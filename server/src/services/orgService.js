import uuid from 'uuid/v4';
import kOrgTbl from '../repositories/db/kOrgTable';
import kOrgPrincipalTbl, { orgPrincipalInfoDefaults } from '../repositories/db/kOrgPrincipalTable';
import { OrgExistsError } from '../errors';

const orgInfoDefaults = {
  description: null,
  defaultTimeZone: null,
  enabled: true,
  defaultLocale: 'en',
  iconId: null,
  preferences: {}
};

export const createOrg = (req, orgInfo, orgPrincipalInfo = {}) => { // eslint-disable-line import/prefer-default-export
  return kOrgTbl.findMany(req, { name: orgInfo.name }, 'or')
    .then((existingOrgs) => {
      if (existingOrgs.length > 0) {
        const errorData = existingOrgs.reduce((data, existingOrg) => {
          if (orgInfo.name === existingOrg.name) {
            data.name = orgInfo.name; // eslint-disable-line no-param-reassign
          }
          return data;
        }, {});
        throw new OrgExistsError({ message: 'Org exists.', data: errorData });
      }

      const orgId = orgInfo.id || uuid();
      return req.app.locals.db.tx((t) => {
        req.dbTx = t;

        return t.batch([
          kOrgTbl.save(req, orgInfoDefaults, orgInfo, { id: orgId }),
          kOrgPrincipalTbl.save(req, orgPrincipalInfoDefaults, { principalId: req.user.sub }, orgPrincipalInfo, { orgId })
        ]);
      });
    })
    .then(([org]) => {
      delete req.dbTx;
      return org;
    })
    .catch((err) => {
      delete req.dbTx;
      throw err;
    });
};
