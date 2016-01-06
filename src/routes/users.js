'use strict';
var baseUri = '/users';
var me;

/**
 * create a new user
 * @param  {object} userData user form data: see swagger for expected fields
 * @return {Promise}          promise resolving to server response
 */
function createUser(userData) {
    var request = {
        method: 'POST',
        uri: baseUri,
        body: userData
    };

    return me.makeRequest(request)
        .then(function(response) {
            var err;
            if (response.statusCode !== 200) {
                err = new Error(response.body.error.message);
                err.data = response;
                throw err;
            }

            return response;
        });
}

/**
 * initialize the internals with the config from index.js
 * @param  {object} config the config object from index.js
 * @return {null}        nothing
 */
function init(base) {
    me = base;
    return {
        post: createUser
    };
}

module.exports = init;
