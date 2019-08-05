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
    CREATE TABLE "c_property" (
      "id" uuid PRIMARY KEY,
      "environment" text,
      "propertyName" text NOT NULL,
      "propertyValue" text,

      "created" timestamp NOT NULL DEFAULT now(),
      "created_by" uuid NOT NULL,
      "last_modified" timestamp NOT NULL DEFAULT now(),
      "last_modified_by" uuid NOT NULL
    );
  `)
  .catch(err => err);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE "c_property";
  `);
};

exports._meta = {
  "version": 1
};

