var clientGetter = require('./index.js');
var DomStorage = require('dom-storage');
var store = new DomStorage(null, { strict: true });
var axios = require('axios');
var assert = require('assert');
var stubPath = require('path').join(__dirname, 'client-src-stub.js');
var clientSrcStub = require('fs').readFileSync(stubPath, 'utf8');
var functionStub = '(function() { return function(a) { return a + 1; }; })()';

// test getDefaults:
assert.deepEqual(
    clientGetter.getDefaults({}),
    {
        baseUrl: 'https://coins-api.mrn.org',
        clientUrl: 'https://coins-api.mrn.org/api/client/client.js'
    },
    'Expected default baseUrl and clientUrl to be added to options'
);

assert.deepEqual(
    clientGetter.getDefaults({ baseUrl: 'foo' }),
    {
        baseUrl: 'foo',
        clientUrl: 'foo/api/client/client.js'
    },
    'Expected provided baseUrl option to be used instead of default'
);

// test assertOptions
assert.throws(
    function() {
        return clientGetter.assertOptions({
            store: store,
            baseUrl: 'http://foo',
            clientUrl: 'http://foo/api/client/client.js'
        });
    },

    /xhrAgent/,
    'Expected error to be thrown for missing xhrAgent option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            baseUrl: 'http://foo',
            clientUrl: 'http://foo/api/client/client.js'
        });
    },

    /store/,
    'Expected error to be thrown for missing store option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            store: {},
            baseUrl: 'http://foo',
            clientUrl: 'http://foo/api/client/client.js'
        });
    },

    /store/,
    'Expected error to be thrown for incorrect store option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            store: store,
            clientUrl: 'http://foo/api/client/client.js'
        });
    },

    /baseUrl/,
    'Expected error to be thrown for missing baseUrl option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            store: store,
            baseUrl: 'http://foo',
        });
    },

    /clientUrl/,
    'Expected error to be thrown for missing clientUrl option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            store: store,
            baseUrl: 'foo',
            clientUrl: 'foo/api/client/client.js'
        });
    },

    /baseUrl/,
    'Expected error to be thrown for malformed baseUrl option'
);

assert.throws(
    function() {
        return clientGetter.assertOptions({
            xhrAgent: axios,
            store: store,
            baseUrl: 'http://foo',
            clientUrl: 'http://bar'
        });
    },

    /clientUrl/,
    'Expected error to be thrown for malformed clientUrl option'
);

// test extractClientSrc
assert.equal(
    clientGetter.extractClientSrc({ data: 'foo' }),
    'foo',
    'Expected extractClientSrc to extract data property'
);

assert.throws(
    function() {
        return clientGetter.extractClientSrc({ data: null });
    },

    /invalid/,
    'Expected extractClientSrc to throw error when src is falsy'
);

// test evalClientSrc
var evaluatedFunction = clientGetter.evalClientSrc(functionStub);

assert.equal(
    typeof evaluatedFunction,
    'function',
    'Expected evaluated source to be a function'
);

assert.equal(
    evaluatedFunction(2),
    3,
    'Expected evaluated source function to return `3`'
);

// test constructClient
var mockConstructor = function(config) {
    return {
        config: config
    };
};

var mockConfig = {
    xhrAgent: axios,
    store: store,
    baseUrl: 'http://example.com'
};

var expectedMockConfig = {
    xhrAgent: axios,
    store: store,
    apiUrl: 'http://example.com'
};

assert.deepEqual(
    clientGetter.constructClient(mockConfig, mockConstructor),
    { config: expectedMockConfig },
    'Expected constructClient to return mockConfig'
);

// add interceptor to axios requests
function returnStub() {
    return { data: clientSrcStub };
}

axios.interceptors.response.use(returnStub, returnStub);

// integration Tests

var config = {
    xhrAgent: axios,
    store: store,
    basueUrl: 'http://example.com'
};

function finishTest() {
    console.log('Tests passing');
    process.exit(0);
}

clientGetter(config)
    .then(function(client) {
        assert.equal(
            client(3),
            6,
            'Expected client to calculate 4'
        );
    })
    .then(finishTest)
    .catch(function(error) {
        console.log('Client integration test failed');
        throw error;
    });
