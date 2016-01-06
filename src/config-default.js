module.exports = {
    requestFn: null,
    requestObjectMap: {
        method: 'method',
        body: 'body',
        headers: 'headers',
        uri: 'uri'
    },
    baseUrl: __NODEAPI_BASEURL__, // jshint ignore:line
    version: null,
    formatRequestHeaders: function(value) {
        return value;
    },

    formatResponseCallback: function(respArray) {
        respArray[0].body = JSON.parse(respArray[0].body);
        return respArray[0];
    }
};
