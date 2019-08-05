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
    CREATE TABLE "c_org" (
      "id" uuid PRIMARY KEY,
      "name" text NOT NULL UNIQUE,
      "description" text,
      "default_time_zone" text,
      "enabled" boolean NOT NULL DEFAULT FALSE,
      "default_locale" text DEFAULT 'en',
      "icon_id" uuid REFERENCES c_media,
      "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,

      "created" timestamp NOT NULL DEFAULT now(),
      "created_by" uuid NOT NULL,
      "last_modified" timestamp NOT NULL DEFAULT now(),
      "last_modified_by" uuid NOT NULL,

      "db_host" text,
      "db_port" text,
      "db_schema" text,
      "db_table_prefix" text
    );
  `)
  .catch(err => err);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE "c_org";
  `);
};

exports._meta = {
  "version": 1
};

