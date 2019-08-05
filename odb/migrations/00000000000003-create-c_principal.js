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
    CREATE TABLE "c_principal" (
      "id" uuid PRIMARY KEY,
      "username" text NOT NULL UNIQUE,
      "primary_email" text NOT NULL UNIQUE,
      "primary_email_verified" boolean NOT NULL DEFAULT FALSE,
      "password" text NOT NULL,
      "primary_phone" text,
      "primary_phone_verified" boolean NOT NULL DEFAULT FALSE,
      "human" boolean NOT NULL DEFAULT TRUE,
      "enabled" boolean NOT NULL DEFAULT FALSE,
      "time_zone" text,
      "name_prefix" text,
      "first_name" text NOT NULL,
      "middle_name" text,
      "last_name" text NOT NULL,
      "name_suffix" text,
      "display_name" text NOT NULL,
      "default_locale" text DEFAULT 'en',
      "icon_id" uuid REFERENCES c_media,
      "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb,
      "system_role" text NOT NULL,

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
    DROP TABLE "c_principal";
  `);
};

exports._meta = {
  "version": 1
};

