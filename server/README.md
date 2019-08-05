# Web Server README

### Dependencies

* [Node.js](https://nodejs.org/) version >=10

I recommend using [NVM](https://github.com/creationix/nvm) instead of installing Node directly.

* AWS Credentials File

    Make sure you have the file `~/.aws/credentials with the contents:
```
    [default]
    aws_access_key_id = fake_access_key
    aws_secret_access_key = fake_secret_key
```
    
* Project [odb](https://github.com/cerebral/odb.git)

    This is the schema for the database.
    
	Please go through it's README for additional dependencies.


### Install

    npm install


### Commands

* `npm run start` - starts the local server with hot reloading enabled

* `npm run lint` - check syntax and formatting of source code for potential errors

* `npm run test` - um, execute tests

* `npm run coverage` - generate a coverage report, `open coverage/index.html`

* `npm run clean` - remove any generated files except for the node_modules dependencies

* `npm run pristine` - clean, including removing node_modules dependencies

* `npm run build` - generate optimized resources for production

* `npm start:prod` - start production intance.  This assumes a build was performed

* `npm run doc` - generate API documentation.  `open doc/cerebralAPI.html` to view the public API.

Refer to the scripts section of `package.json` for a complete and more accurate listing of available commands.


### Usage

This project serves REST endpoints for both UI and customers.

Navigate to [http://localhost:9090/](http://localhost:9090/) for the UI project platform-webapp.
That is pre-configured to use the endpoints here.

NOTE: No UI for this!!! This serves REST endpoints...!!!  ONLY!!! Go to the webapp for that.

You can also use [Postman](https://www.getpostman.com/apps) and hit http://localhost:3000.  Refer to the API documentation ... TODO:


### Documentation

* npm i swagger-editor-dist

