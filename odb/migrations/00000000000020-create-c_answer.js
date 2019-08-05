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
    CREATE TABLE "answer" (
      "id" uuid PRIMARY KEY,
      "email" text NOT NULL,
      "question_id" integer NOT NULL,
      "question" text NOT NULL,
      "answer" text,

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
    DROP TABLE "answer";
  `);
};

exports._meta = {
  "version": 1
};

