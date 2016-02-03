var defaultBaseUrl = 'https://coins-api.mrn.org';
var defaultClientPath = '/api/client/client.js';

function evalClientSrc (src) {
    // @TODO: verify hmac of src for security
    return eval(src);
}

function extractClientSrc(response) {
    if (!response.data) {
        throw new Error('Client source code invalid');
    }
    return response.data;
}

function assertOptions(options) {
    // validate options
    if (!options.xhrAgent) {
        throw new Error('Options must include an xhrAgent (e.g. axios)');
    }

    if (!options.store || !options.store.setItem || !options.store.getItem) {
        throw new Error('Options must include a `store` (e.g. localstorage)');
    }

    if (!options.baseUrl || options.baseUrl.indexOf('http') !== 0) {
        throw new Error('Options must include a valid baseUrl');
    }

    if (
        !options.clientUrl ||
        options.clientUrl.indexOf(options.baseUrl) !== 0
    ) {
        throw new Error('Options must include a valid clientUrl');
    }

    return options;
}

function getDefaults(_options) {

    //shallow copy options
    var options = Object.create(_options);
    options.baseUrl = options.baseUrl || defaultBaseUrl;
    options.clientUrl = options.baseUrl + defaultClientPath;
    return options;
}

function constructClient (options, clientFactory) {
    var config = {
        xhrAgent: options.xhrAgent,
        store: options.store,
        apiUrl: options.baseUrl
    };
    return clientFactory(config);
}

module.exports = function(_options) {
    var options = getDefaults(_options);
    assertOptions(options);

    return options.xhrAgent.get(options.clientUrl)
        .then(extractClientSrc)
        .then(evalClientSrc)
        .then(constructClient.bind(null, options))
};

module.exports.getDefaults = getDefaults;
module.exports.assertOptions = assertOptions;
module.exports.evalClientSrc = evalClientSrc;
module.exports.extractClientSrc = extractClientSrc;
module.exports.constructClient = constructClient;
