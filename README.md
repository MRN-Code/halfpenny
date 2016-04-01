# halfpenny

[ ![Codeship Status for MRN-Code/halfpenny](https://codeship.com/projects/233242e0-d9e4-0133-38b5-0ae147979a90/status?branch=master)](https://codeship.com/projects/143661)
[![Coverage Status](https://coveralls.io/repos/github/MRN-Code/halfpenny/badge.svg?branch=master)](https://coveralls.io/github/MRN-Code/halfpenny?branch=master)

_The official COINS API Javascript client_

What is a [halfpenny](https://en.wikipedia.org/wiki/Halfpenny_(British_pre-decimal_coin)), anyway?  Beyond an old-timey coin (AKA a pence), halfpenny is the official javascript API client for the COINS platform.  halfpenny works in the browser and in nodejs.

# usage

```js
const hp = require('halfpenny')
const client = hp.factory({}, (client) => {
  client.auth.login('username', 'password');
  client.ScansApi.get(null, 'M87100000');
});
```

@NOTE, halfpenny is written in node-style commonjs.  Therefore, if you are using it in the browser, make sure you are bundling it with browserify/webpack/etc!  We do not provide a bundled version on your behalf.

## peer dependencies

### storage
In order to persist data to disk, a localstorage interface is required. In the
browser, this will default to `window.localStorage`.  If you use nodejs, you must pass in `localStorage` like interface, such as `node-localstorage` or `dom-storage`.

## basic configuration
*See examples*
The above configuration parameters are *required*.
**Note that the 'requestFn' must be promisified**

## how it works

The source code for the client is auto-generated during the build process of the
API itself. The API then bundles and serves the source code from `/client/client.js`.

This package retrieves the bundled source code and evaluates it. The result is an
object with properties corresponding to each method exposed by an API endpoint
(e.g. `ScansApi.get()`).

See `nodeapi/test/integration` for more

## todo
* support UMD and browser compatibility.
* Auto-generate documentation from API client

## changelog
- 2.x
  - convert to auto-generated api client, built from server API spec
  - remove browser support temporarily
- 1.x
  - commonjs-ify
- 0.x
  - init
