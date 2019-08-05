'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE "c_org_principal" (
      "org_id" uuid REFERENCES c_org,
      "principal_id" uuid REFERENCES c_principal,
      "enabled" boolean NOT NULL DEFAULT TRUE,
      "roles" text array,
      "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,

      "created" timestamp NOT NULL DEFAULT now(),
      "created_by" uuid NOT NULL,
      "last_modified" timestamp NOT NULL DEFAULT now(),
      "last_modified_by" uuid NOT NULL,

      PRIMARY KEY (org_id, principal_id)
    );
  `)
  .catch(err => err);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE "c_org_principal";
  `);
};

exports._meta = {
  "version": 1
};

