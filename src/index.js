'use-strict';

const async = require('async');
const defaultBaseUrl = 'https://coins-api.mrn.org';
const defaultClientPath = '/api/client/client.js';

module.exports = {

  /**
   * apply defaults over user-specified options
   * @param {object} opts see `factory`
   * @return {object}
   */
  _applyDefaults(opts) {
    const options = Object.create(opts);
    if (!options.store) {
      try {
        options.store = localStorage;
      } catch (err) {
        throw new ReferenceError([
          'localStorage-like storage engine not available.',
          'please pass one into .factory. e.g.',
          'halfpenny.factory({ store: require(\'node-localstorage\')})',
        ].join(' '));
      }
    }
    options.xhrAgent = options.xhrAgent || require('axios');
    options.baseUrl = options.baseUrl || defaultBaseUrl;
    options.clientUrl = options.baseUrl + defaultClientPath;
    return options;
  },

  /**
   * validates client option inputs
   * @private
   * @param {object} options see `init`
   * @returns {undefined}
   */
  _assertOptions(options) {
    // validate options
    /* istanbul ignore next */
    if (!options.xhrAgent) {
      throw new Error('Options must include an xhrAgent (e.g. axios)');
    }

    /* istanbul ignore next */
    if (!options.store || !options.store.setItem || !options.store.getItem) {
      throw new Error('Options must include a `store` (e.g. localstorage)');
    }

    /* istanbul ignore next */
    if (!options.baseUrl || options.baseUrl.indexOf('http') !== 0) {
      throw new Error('Options must include a valid baseUrl');
    }

    /* istanbul ignore next */
    if (
      !options.clientUrl ||
      options.clientUrl.indexOf(options.baseUrl) !== 0
    ) {
      throw new Error('Options must include a valid clientUrl');
    }

    return options;
  },

  /**
   * build a halfpenny instance
   * @private
   * @param {object} options see `factory`
   */
  _constructClient(options, clientFactory) {
    const config = {
      xhrAgent: options.xhrAgent,
      store: options.store,
      apiUrl: options.baseUrl,
    };
    return clientFactory(config);
  },

  /**
   * @param {string} src
   * @returns {object} API client factory
   */
  _evalClientSrc(src) {
    // @TODO: verify hmac of src for security
    return eval(src); // eslint-disable-line
  },

  /**
   * @param {object} response nodeapi response, containing api client code
   * @returns {string} api source code
   */
  _extractClientSrc(response) {
    if (!response.data) {
      throw new Error('client source code invalid');
    }
    return response.data;
  },

  /**
   * build an API client instance
   * @param {object} opts
   * @param {object=} opts.store store localstorage-like interface.
   *                             			 attempts to default to localStorage.  node users
   *                             			 will have to provide an implementation, such
   *                             			 as node-localstorage
   * @param {string=} opts.baseUrl COINS api root. defaults to 'https://coins-api.mrn.org'
   * @param {object=} opts.xhrAgent defauts to `xhr`.
   *                               user can squash. must have a `.get` method
   * @param {function} cb
   * @returns {undefined}
   */
  factory(opts, cb) {
    const options = this._applyDefaults(opts);
    this._assertOptions(options);
    return async.waterfall([
      (cb1) => options.xhrAgent.get(options.clientUrl, cb1),
      (response, cb2) => { // eslint-disable-line
        return Promise.resolve()
        .then(() => this._extractClientSrc(response))
        .then((src) => this._evalClientSrc(src))
        .then((factory) => this._constructClient(options, factory))
        .then((client) => cb2(null, client))
        .catch(cb2);
      },
    ], cb);
  },

};
