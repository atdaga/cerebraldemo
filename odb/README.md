# platform-rdb

## Dependencies

* postgresql.app
* [PostgreSQL](https://www.postgresql.org/download/) version >= 10

    * [Postgres.app](http://postgresapp.com) (Mac)
    
     ```
     export POSTGRES_HOME=/Applications/Postgres.app/Contents/Versions/10
     
     export PATH="${POSTGRES_HOME}/bin:${PATH}"
     ```
    
* [Node Version Manager](https://github.com/creationix/nvm)

    * Use Node.js version >= 10.x


## Install

    npm install
    

## Create Local Database (for local development and testing)

    createdb cerebral
    createdb cerebral_test

## Environment Variables

    * PG_HOST (default "localhost")

    * PG_PORT (default 5432)
    
    * PG_DATABASE (default "cerebral")
    
    * PG_SCHEMA (default "public")
    
    * PG_USERNAME (default undefined)
    
    * PG_PASSWORD (default "")
    

## Commands

Create or update tables:

    npm run migrate:up
    
Drop all tables (except for schema status table):

    npm run migrate:reset
    
Rebuild everything:

    npm run migrate:resetup
    
Drop last create or update:

    npm run migrate:down

Create tables for cerebral_test:

    PG_DATABASE=cerebral_test npm run migrate:up

