# halfpenny // COINS API Javascript client

What is a [halfpenny](https://en.wikipedia.org/wiki/Halfpenny_(British_pre-decimal_coin)), anyway?  Beyond an old-timey coin (AKA a pence), halfpenny is the official javascript API client for the COINS platform.

## peer dependencies

### axios
A HTTP request agent is required to retrieve the Client source code and to make
requests. Axios was chosen as that client in order to support both server and
browser environments.

### storage
In order to persist data to disk, a localstorage interface is required. In the
browser, this means supplying `window.localStorage` in the browser, and using
`node-localstorage` or `dom-storage` on the server.

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

## examples

```js
const agent = require('axios');
const DomStorage = require('dom-storage');
const store = new DomStorage('/path/to/file', {strict: true});
const apiClientOptions = {
    xhrAgent: agent,
    baseUrl: 'http://localhost:8800', // hostname:port of nodeapi service
    store: store
};
const clientReady = require('halfpenny')(apiClientOptions)
    .catch((err) => {
        //whoops
    });

// login
clientReady.then((client) => {
    return client.auth.login('username', 'password');
});

// get scans
clientReady.then((client) => {
    return client.ScansApi.get(null, 'M87100000')
});
```

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
