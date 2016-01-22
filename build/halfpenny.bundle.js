(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("dom-storage"));
	else if(typeof define === 'function' && define.amd)
		define("halfpenny", ["dom-storage"], factory);
	else if(typeof exports === 'object')
		exports["halfpenny"] = factory(require("dom-storage"));
	else
		root["halfpenny"] = factory(root["dom-storage"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global Promise */
	/**
	 * @module halfpenny
	 */

	var assign = __webpack_require__(1).assign;
	var hawk = __webpack_require__(2);
	var renameKeys = __webpack_require__(3);
	var storage = __webpack_require__(4);
	var routes = __webpack_require__(6);

	var hawkClientHeader = hawk.client.header;
	var authKeyId = 'COINS_AUTH_CREDENTIALS';
	var defaultConfig = __webpack_require__(16);
	var me = {};

	/**
	 * get the currently stored auth credentials
	 * @return {Promise}        resolves to the credentials object
	 */
	var getAuthCredentials = function() {
	    return new Promise(function(resolve) {
	        resolve(JSON.parse(storage.getItem(authKeyId)));
	    });
	};

	/**
	 * set auth credentials
	 * @param  {object} val the credentials to be saved
	 * @return {Promise}    resolves to an object containing the id and rev
	 */
	var setAuthCredentials = function(credentials) {
	    return new Promise(function(resolve) {
	        storage.setItem(authKeyId, JSON.stringify(credentials));
	        resolve(getAuthCredentials());
	    });
	};

	/**
	 * generate the header expected by Hawk.
	 * Note that the url must include a protocol and hostname
	 * @param  {string} url
	 * @param  {string} method e.g. 'GET'
	 * @return {string} The hawk auth signature
	 */
	var generateHawkHeader = function(url, method) {
	    return me.getAuthCredentials()
	        .then(function(credentials) {
	            if (!credentials) {
	                throw new Error('No credentials found to sign with');
	            }

	            return me.getHawkHeader(
	                url,
	                method,
	                { credentials: credentials }
	            );
	        });
	};

	/**
	 * format requestObj for use by requestFn
	 * @param  {object} requestObj the object to be passed to the requestFn
	 * @return {object}            the object after mapping keys to new ones
	 */
	var formatRequestOptions = function(requestOptions) {
	    if (me.config.onPreFormatRequestOptions instanceof Function) {
	        requestOptions = me.config.onPreFormatRequestOptions(
	            requestOptions
	        );
	    }

	    requestOptions.uri = [
	        me.config.baseUrl,
	        '/v' + me.config.version,
	        requestOptions.uri
	    ].join('');

	    return renameKeys(requestOptions, function(key) {
	        return me.config.requestObjectMap[key] || key;
	    });
	};

	/**
	 * make a request using config.requestFn
	 * @param  {object} options request options to be passed to requestFn
	 * @return {Promise}        promise that resolves with the value of the response
	 */
	var makeRequest = function(options, sign) {
	    var formattedOptions = formatRequestOptions(options);

	    /**
	     * convenience function for sending the formatted request
	     * @return {Promise} resolves to the formatted response value
	     */
	    var sendRequest = function() {
	        return me.config.requestFn(formattedOptions)
	            .then(me.config.formatResponseCallback);
	    };

	    /**
	     * convenience function for adding a header property to the
	     * formattedOptions
	     * @param  {object} header output from hawk.client.header();
	     * @return {null}        nothing
	     */
	    var addFormattedHeader = function(header) {
	        var headers = formattedOptions.headers || [];
	        headers.push({
	            name: 'Authorization',
	            value: header.field
	        });
	        formattedOptions.headers = me.config.formatRequestHeaders(headers);
	        return;
	    };

	    var masterPromise;
	    if (sign !== false) {
	        masterPromise = generateHawkHeader(
	            formattedOptions.url,
	            formattedOptions.method
	        )
	        .then(addFormattedHeader);
	    } else {
	        masterPromise = Promise.resolve();
	    }

	    return masterPromise.then(sendRequest);
	};

	module.exports = function init(config) {
	    me.config = assign({}, defaultConfig, config);
	    me.getHawkHeader = hawkClientHeader;
	    me.generateHawkHeader = generateHawkHeader;
	    me.makeRequest = makeRequest;
	    me.setAuthCredentials = setAuthCredentials;
	    me.getAuthCredentials = getAuthCredentials;
	    me.auth = routes.authentication(me);
	    me.scans = routes.scans(me);
	    me.users = routes.users(me);
	    me.coinstac = {
	        consortia: routes.coinstac.consortia(me)
	    };
	    return me;
	};


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Code refactored from Mozilla Developer Network:
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 */

	'use strict';

	function assign(target, firstSource) {
	  if (target === undefined || target === null) {
	    throw new TypeError('Cannot convert first argument to object');
	  }

	  var to = Object(target);
	  for (var i = 1; i < arguments.length; i++) {
	    var nextSource = arguments[i];
	    if (nextSource === undefined || nextSource === null) {
	      continue;
	    }

	    var keysArray = Object.keys(Object(nextSource));
	    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
	      var nextKey = keysArray[nextIndex];
	      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	      if (desc !== undefined && desc.enumerable) {
	        to[nextKey] = nextSource[nextKey];
	      }
	    }
	  }
	  return to;
	}

	function polyfill() {
	  if (!Object.assign) {
	    Object.defineProperty(Object, 'assign', {
	      enumerable: false,
	      configurable: true,
	      writable: true,
	      value: assign
	    });
	  }
	}

	module.exports = {
	  assign: assign,
	  polyfill: polyfill
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/*
	    HTTP Hawk Authentication Scheme
	    Copyright (c) 2012-2014, Eran Hammer <eran@hammer.io>
	    BSD Licensed
	*/


	// Declare namespace

	const hawk = {
	    internals: {}
	};


	hawk.client = {

	    // Generate an Authorization header for a given request

	    /*
	        uri: 'http://example.com/resource?a=b' or object generated by hawk.utils.parseUri()
	        method: HTTP verb (e.g. 'GET', 'POST')
	        options: {

	            // Required

	            credentials: {
	                id: 'dh37fgj492je',
	                key: 'aoijedoaijsdlaksjdl',
	                algorithm: 'sha256'                                 // 'sha1', 'sha256'
	            },

	            // Optional

	            ext: 'application-specific',                        // Application specific data sent via the ext attribute
	            timestamp: Date.now() / 1000,                       // A pre-calculated timestamp in seconds
	            nonce: '2334f34f',                                  // A pre-generated nonce
	            localtimeOffsetMsec: 400,                           // Time offset to sync with server time (ignored if timestamp provided)
	            payload: '{"some":"payload"}',                      // UTF-8 encoded string for body hash generation (ignored if hash provided)
	            contentType: 'application/json',                    // Payload content-type (ignored if hash provided)
	            hash: 'U4MKKSmiVxk37JCCrAVIjV=',                    // Pre-calculated payload hash
	            app: '24s23423f34dx',                               // Oz application id
	            dlg: '234sz34tww3sd'                                // Oz delegated-by application id
	        }
	    */

	    header: function (uri, method, options) {

	        const result = {
	            field: '',
	            artifacts: {}
	        };

	        // Validate inputs

	        if (!uri || (typeof uri !== 'string' && typeof uri !== 'object') ||
	            !method || typeof method !== 'string' ||
	            !options || typeof options !== 'object') {

	            result.err = 'Invalid argument type';
	            return result;
	        }

	        // Application time

	        const timestamp = options.timestamp || hawk.utils.now(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            result.err = 'Invalid credentials object';
	            return result;
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            result.err = 'Unknown algorithm';
	            return result;
	        }

	        // Parse URI

	        if (typeof uri === 'string') {
	            uri = hawk.utils.parseUri(uri);
	        }

	        // Calculate signature

	        const artifacts = {
	            ts: timestamp,
	            nonce: options.nonce || hawk.utils.randomString(6),
	            method: method,
	            resource: uri.resource,
	            host: uri.host,
	            port: uri.port,
	            hash: options.hash,
	            ext: options.ext,
	            app: options.app,
	            dlg: options.dlg
	        };

	        result.artifacts = artifacts;

	        // Calculate payload hash

	        if (!artifacts.hash &&
	            (options.payload || options.payload === '')) {

	            artifacts.hash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, options.contentType);
	        }

	        const mac = hawk.crypto.calculateMac('header', credentials, artifacts);

	        // Construct header

	        const hasExt = artifacts.ext !== null && artifacts.ext !== undefined && artifacts.ext !== '';       // Other falsey values allowed
	        let header = 'Hawk id="' + credentials.id +
	                     '", ts="' + artifacts.ts +
	                     '", nonce="' + artifacts.nonce +
	                     (artifacts.hash ? '", hash="' + artifacts.hash : '') +
	                     (hasExt ? '", ext="' + hawk.utils.escapeHeaderAttribute(artifacts.ext) : '') +
	                     '", mac="' + mac + '"';

	        if (artifacts.app) {
	            header += ', app="' + artifacts.app +
	                      (artifacts.dlg ? '", dlg="' + artifacts.dlg : '') + '"';
	        }

	        result.field = header;

	        return result;
	    },

	    // Generate a bewit value for a given URI

	    /*
	        uri: 'http://example.com/resource?a=b'
	        options: {

	            // Required

	            credentials: {
	            id: 'dh37fgj492je',
	            key: 'aoijedoaijsdlaksjdl',
	            algorithm: 'sha256'                             // 'sha1', 'sha256'
	            },
	            ttlSec: 60 * 60,                                    // TTL in seconds

	            // Optional

	            ext: 'application-specific',                        // Application specific data sent via the ext attribute
	            localtimeOffsetMsec: 400                            // Time offset to sync with server time
	         };
	    */

	    bewit: function (uri, options) {

	        // Validate inputs

	        if (!uri ||
	            (typeof uri !== 'string') ||
	            !options ||
	            typeof options !== 'object' ||
	            !options.ttlSec) {

	            return '';
	        }

	        options.ext = (options.ext === null || options.ext === undefined ? '' : options.ext);       // Zero is valid value

	        // Application time

	        const now = hawk.utils.now(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            return '';
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            return '';
	        }

	        // Parse URI

	        uri = hawk.utils.parseUri(uri);

	        // Calculate signature

	        const exp = now + options.ttlSec;
	        const mac = hawk.crypto.calculateMac('bewit', credentials, {
	            ts: exp,
	            nonce: '',
	            method: 'GET',
	            resource: uri.resource,                            // Maintain trailing '?' and query params
	            host: uri.host,
	            port: uri.port,
	            ext: options.ext
	        });

	        // Construct bewit: id\exp\mac\ext

	        const bewit = credentials.id + '\\' + exp + '\\' + mac + '\\' + options.ext;
	        return hawk.utils.base64urlEncode(bewit);
	    },

	    // Validate server response

	    /*
	        request:    object created via 'new XMLHttpRequest()' after response received
	        artifacts:  object received from header().artifacts
	        options: {
	            payload:    optional payload received
	            required:   specifies if a Server-Authorization header is required. Defaults to 'false'
	        }
	    */

	    authenticate: function (request, credentials, artifacts, options) {

	        options = options || {};

	        const getHeader = function (name) {

	            return request.getResponseHeader ? request.getResponseHeader(name) : request.getHeader(name);
	        };

	        const wwwAuthenticate = getHeader('www-authenticate');
	        if (wwwAuthenticate) {

	            // Parse HTTP WWW-Authenticate header

	            const wwwAttributes = hawk.utils.parseAuthorizationHeader(wwwAuthenticate, ['ts', 'tsm', 'error']);
	            if (!wwwAttributes) {
	                return false;
	            }

	            if (wwwAttributes.ts) {
	                const tsm = hawk.crypto.calculateTsMac(wwwAttributes.ts, credentials);
	                if (tsm !== wwwAttributes.tsm) {
	                    return false;
	                }

	                hawk.utils.setNtpOffset(wwwAttributes.ts - Math.floor((new Date()).getTime() / 1000));     // Keep offset at 1 second precision
	            }
	        }

	        // Parse HTTP Server-Authorization header

	        const serverAuthorization = getHeader('server-authorization');
	        if (!serverAuthorization &&
	            !options.required) {

	            return true;
	        }

	        const attributes = hawk.utils.parseAuthorizationHeader(serverAuthorization, ['mac', 'ext', 'hash']);
	        if (!attributes) {
	            return false;
	        }

	        const modArtifacts = {
	            ts: artifacts.ts,
	            nonce: artifacts.nonce,
	            method: artifacts.method,
	            resource: artifacts.resource,
	            host: artifacts.host,
	            port: artifacts.port,
	            hash: attributes.hash,
	            ext: attributes.ext,
	            app: artifacts.app,
	            dlg: artifacts.dlg
	        };

	        const mac = hawk.crypto.calculateMac('response', credentials, modArtifacts);
	        if (mac !== attributes.mac) {
	            return false;
	        }

	        if (!options.payload &&
	            options.payload !== '') {

	            return true;
	        }

	        if (!attributes.hash) {
	            return false;
	        }

	        const calculatedHash = hawk.crypto.calculatePayloadHash(options.payload, credentials.algorithm, getHeader('content-type'));
	        return (calculatedHash === attributes.hash);
	    },

	    message: function (host, port, message, options) {

	        // Validate inputs

	        if (!host || typeof host !== 'string' ||
	            !port || typeof port !== 'number' ||
	            message === null || message === undefined || typeof message !== 'string' ||
	            !options || typeof options !== 'object') {

	            return null;
	        }

	        // Application time

	        const timestamp = options.timestamp || hawk.utils.now(options.localtimeOffsetMsec);

	        // Validate credentials

	        const credentials = options.credentials;
	        if (!credentials ||
	            !credentials.id ||
	            !credentials.key ||
	            !credentials.algorithm) {

	            // Invalid credential object
	            return null;
	        }

	        if (hawk.crypto.algorithms.indexOf(credentials.algorithm) === -1) {
	            return null;
	        }

	        // Calculate signature

	        const artifacts = {
	            ts: timestamp,
	            nonce: options.nonce || hawk.utils.randomString(6),
	            host: host,
	            port: port,
	            hash: hawk.crypto.calculatePayloadHash(message, credentials.algorithm)
	        };

	        // Construct authorization

	        const result = {
	            id: credentials.id,
	            ts: artifacts.ts,
	            nonce: artifacts.nonce,
	            hash: artifacts.hash,
	            mac: hawk.crypto.calculateMac('message', credentials, artifacts)
	        };

	        return result;
	    },

	    authenticateTimestamp: function (message, credentials, updateClock) {           // updateClock defaults to true

	        const tsm = hawk.crypto.calculateTsMac(message.ts, credentials);
	        if (tsm !== message.tsm) {
	            return false;
	        }

	        if (updateClock !== false) {
	            hawk.utils.setNtpOffset(message.ts - Math.floor((new Date()).getTime() / 1000));    // Keep offset at 1 second precision
	        }

	        return true;
	    }
	};


	hawk.crypto = {

	    headerVersion: '1',

	    algorithms: ['sha1', 'sha256'],

	    calculateMac: function (type, credentials, options) {

	        const normalized = hawk.crypto.generateNormalizedString(type, options);

	        const hmac = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()](normalized, credentials.key);
	        return hmac.toString(CryptoJS.enc.Base64);
	    },

	    generateNormalizedString: function (type, options) {

	        let normalized = 'hawk.' + hawk.crypto.headerVersion + '.' + type + '\n' +
	                         options.ts + '\n' +
	                         options.nonce + '\n' +
	                         (options.method || '').toUpperCase() + '\n' +
	                         (options.resource || '') + '\n' +
	                         options.host.toLowerCase() + '\n' +
	                         options.port + '\n' +
	                         (options.hash || '') + '\n';

	        if (options.ext) {
	            normalized += options.ext.replace('\\', '\\\\').replace('\n', '\\n');
	        }

	        normalized += '\n';

	        if (options.app) {
	            normalized += options.app + '\n' +
	                          (options.dlg || '') + '\n';
	        }

	        return normalized;
	    },

	    calculatePayloadHash: function (payload, algorithm, contentType) {

	        const hash = CryptoJS.algo[algorithm.toUpperCase()].create();
	        hash.update('hawk.' + hawk.crypto.headerVersion + '.payload\n');
	        hash.update(hawk.utils.parseContentType(contentType) + '\n');
	        hash.update(payload);
	        hash.update('\n');
	        return hash.finalize().toString(CryptoJS.enc.Base64);
	    },

	    calculateTsMac: function (ts, credentials) {

	        const hash = CryptoJS['Hmac' + credentials.algorithm.toUpperCase()]('hawk.' + hawk.crypto.headerVersion + '.ts\n' + ts + '\n', credentials.key);
	        return hash.toString(CryptoJS.enc.Base64);
	    }
	};


	// localStorage compatible interface

	hawk.internals.LocalStorage = function () {

	    this._cache = {};
	    this.length = 0;

	    this.getItem = function (key) {

	        return this._cache.hasOwnProperty(key) ? String(this._cache[key]) : null;
	    };

	    this.setItem = function (key, value) {

	        this._cache[key] = String(value);
	        this.length = Object.keys(this._cache).length;
	    };

	    this.removeItem = function (key) {

	        delete this._cache[key];
	        this.length = Object.keys(this._cache).length;
	    };

	    this.clear = function () {

	        this._cache = {};
	        this.length = 0;
	    };

	    this.key = function (i) {

	        return Object.keys(this._cache)[i || 0];
	    };
	};


	hawk.utils = {

	    storage: new hawk.internals.LocalStorage(),

	    setStorage: function (storage) {

	        const ntpOffset = hawk.utils.storage.getItem('hawk_ntp_offset');
	        hawk.utils.storage = storage;
	        if (ntpOffset) {
	            hawk.utils.setNtpOffset(ntpOffset);
	        }
	    },

	    setNtpOffset: function (offset) {

	        try {
	            hawk.utils.storage.setItem('hawk_ntp_offset', offset);
	        }
	        catch (err) {
	            console.error('[hawk] could not write to storage.');
	            console.error(err);
	        }
	    },

	    getNtpOffset: function () {

	        const offset = hawk.utils.storage.getItem('hawk_ntp_offset');
	        if (!offset) {
	            return 0;
	        }

	        return parseInt(offset, 10);
	    },

	    now: function (localtimeOffsetMsec) {

	        return Math.floor(((new Date()).getTime() + (localtimeOffsetMsec || 0)) / 1000) + hawk.utils.getNtpOffset();
	    },

	    escapeHeaderAttribute: function (attribute) {

	        return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');
	    },

	    parseContentType: function (header) {

	        if (!header) {
	            return '';
	        }

	        return header.split(';')[0].replace(/^\s+|\s+$/g, '').toLowerCase();
	    },

	    parseAuthorizationHeader: function (header, keys) {

	        if (!header) {
	            return null;
	        }

	        const headerParts = header.match(/^(\w+)(?:\s+(.*))?$/);       // Header: scheme[ something]
	        if (!headerParts) {
	            return null;
	        }

	        const scheme = headerParts[1];
	        if (scheme.toLowerCase() !== 'hawk') {
	            return null;
	        }

	        const attributesString = headerParts[2];
	        if (!attributesString) {
	            return null;
	        }

	        const attributes = {};
	        const verify = attributesString.replace(/(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g, ($0, $1, $2) => {

	            // Check valid attribute names

	            if (keys.indexOf($1) === -1) {
	                return;
	            }

	            // Allowed attribute value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9

	            if ($2.match(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~]+$/) === null) {
	                return;
	            }

	            // Check for duplicates

	            if (attributes.hasOwnProperty($1)) {
	                return;
	            }

	            attributes[$1] = $2;
	            return '';
	        });

	        if (verify !== '') {
	            return null;
	        }

	        return attributes;
	    },

	    randomString: function (size) {

	        const randomSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	        const len = randomSource.length;

	        const result = [];
	        for (let i = 0; i < size; ++i) {
	            result[i] = randomSource[Math.floor(Math.random() * len)];
	        }

	        return result.join('');
	    },

	    uriRegex: /^([^:]+)\:\/\/(?:[^@]*@)?([^\/:]+)(?:\:(\d+))?([^#]*)(?:#.*)?$/,       // scheme://credentials@host:port/resource#fragment
	    parseUri: function (input) {

	        const parts = input.match(hawk.utils.uriRegex);
	        if (!parts) {
	            return { host: '', port: '', resource: '' };
	        }

	        const scheme = parts[1].toLowerCase();
	        const uri = {
	            host: parts[2],
	            port: parts[3] || (scheme === 'http' ? '80' : (scheme === 'https' ? '443' : '')),
	            resource: parts[4]
	        };

	        return uri;
	    },

	    base64urlEncode: function (value) {

	        const wordArray = CryptoJS.enc.Utf8.parse(value);
	        const encoded = CryptoJS.enc.Base64.stringify(wordArray);
	        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
	    }
	};


	// $lab:coverage:off$
	/* eslint-disable */

	// Based on: Crypto-JS v3.1.2
	// Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
	// http://code.google.com/p/crypto-js/
	// http://code.google.com/p/crypto-js/wiki/License

	var CryptoJS = CryptoJS || function (h, r) { var k = {}, l = k.lib = {}, n = function () { }, f = l.Base = { extend: function (a) { n.prototype = this; var b = new n; a && b.mixIn(a); b.hasOwnProperty("init") || (b.init = function () { b.$super.init.apply(this, arguments) }); b.init.prototype = b; b.$super = this; return b }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (let b in a) a.hasOwnProperty(b) && (this[b] = a[b]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } }, j = l.WordArray = f.extend({ init: function (a, b) { a = this.words = a || []; this.sigBytes = b != r ? b : 4 * a.length }, toString: function (a) { return (a || s).stringify(this) }, concat: function (a) { var b = this.words, d = a.words, c = this.sigBytes; a = a.sigBytes; this.clamp(); if (c % 4) for (let e = 0; e < a; e++) b[c + e >>> 2] |= (d[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((c + e) % 4); else if (65535 < d.length) for (e = 0; e < a; e += 4) b[c + e >>> 2] = d[e >>> 2]; else b.push.apply(b, d); this.sigBytes += a; return this }, clamp: function () { var a = this.words, b = this.sigBytes; a[b >>> 2] &= 4294967295 << 32 - 8 * (b % 4); a.length = h.ceil(b / 4) }, clone: function () { var a = f.clone.call(this); a.words = this.words.slice(0); return a }, random: function (a) { for (let b = [], d = 0; d < a; d += 4) b.push(4294967296 * h.random() | 0); return new j.init(b, a) } }), m = k.enc = {}, s = m.Hex = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) { var e = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255; d.push((e >>> 4).toString(16)); d.push((e & 15).toString(16)) } return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c += 2) d[c >>> 3] |= parseInt(a.substr(c, 2), 16) << 24 - 4 * (c % 8); return new j.init(d, b / 2) } }, p = m.Latin1 = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255)); return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c++) d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4); return new j.init(d, b) } }, t = m.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(p.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return p.parse(unescape(encodeURIComponent(a))) } }, q = l.BufferedBlockAlgorithm = f.extend({ reset: function () { this._data = new j.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = t.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (a) { var b = this._data, d = b.words, c = b.sigBytes, e = this.blockSize, f = c / (4 * e), f = a ? h.ceil(f) : h.max((f | 0) - this._minBufferSize, 0); a = f * e; c = h.min(4 * a, c); if (a) { for (var g = 0; g < a; g += e) this._doProcessBlock(d, g); g = d.splice(0, a); b.sigBytes -= c } return new j.init(g, c) }, clone: function () { var a = f.clone.call(this); a._data = this._data.clone(); return a }, _minBufferSize: 0 }); l.Hasher = q.extend({ cfg: f.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { q.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (b, d) { return (new a.init(d)).finalize(b) } }, _createHmacHelper: function (a) { return function (b, d) { return (new u.HMAC.init(a, d)).finalize(b) } } }); var u = k.algo = {}; return k }(Math);
	(() => { var k = CryptoJS, b = k.lib, m = b.WordArray, l = b.Hasher, d = [], b = k.algo.SHA1 = l.extend({ _doReset: function () { this._hash = new m.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (n, p) { for (var a = this._hash.words, e = a[0], f = a[1], h = a[2], j = a[3], b = a[4], c = 0; 80 > c; c++) { if (16 > c) d[c] = n[p + c] | 0; else { var g = d[c - 3] ^ d[c - 8] ^ d[c - 14] ^ d[c - 16]; d[c] = g << 1 | g >>> 31 } g = (e << 5 | e >>> 27) + b + d[c]; g = 20 > c ? g + ((f & h | ~f & j) + 1518500249) : 40 > c ? g + ((f ^ h ^ j) + 1859775393) : 60 > c ? g + ((f & h | f & j | h & j) - 1894007588) : g + ((f ^ h ^ j) - 899497514); b = j; j = h; h = f << 30 | f >>> 2; f = e; e = g } a[0] = a[0] + e | 0; a[1] = a[1] + f | 0; a[2] = a[2] + h | 0; a[3] = a[3] + j | 0; a[4] = a[4] + b | 0 }, _doFinalize: function () { var b = this._data, d = b.words, a = 8 * this._nDataBytes, e = 8 * b.sigBytes; d[e >>> 5] |= 128 << 24 - e % 32; d[(e + 64 >>> 9 << 4) + 14] = Math.floor(a / 4294967296); d[(e + 64 >>> 9 << 4) + 15] = a; b.sigBytes = 4 * d.length; this._process(); return this._hash }, clone: function () { var b = l.clone.call(this); b._hash = this._hash.clone(); return b } }); k.SHA1 = l._createHelper(b); k.HmacSHA1 = l._createHmacHelper(b) })();
	(function (k) { for (var g = CryptoJS, h = g.lib, v = h.WordArray, j = h.Hasher, h = g.algo, s = [], t = [], u = function (q) { return 4294967296 * (q - (q | 0)) | 0 }, l = 2, b = 0; 64 > b;) { var d; a: { d = l; for (var w = k.sqrt(d), r = 2; r <= w; r++) if (!(d % r)) { d = !1; break a } d = !0 } d && (8 > b && (s[b] = u(k.pow(l, 0.5))), t[b] = u(k.pow(l, 1 / 3)), b++); l++ } var n = [], h = h.SHA256 = j.extend({ _doReset: function () { this._hash = new v.init(s.slice(0)) }, _doProcessBlock: function (q, h) { for (var a = this._hash.words, c = a[0], d = a[1], b = a[2], k = a[3], f = a[4], g = a[5], j = a[6], l = a[7], e = 0; 64 > e; e++) { if (16 > e) n[e] = q[h + e] | 0; else { var m = n[e - 15], p = n[e - 2]; n[e] = ((m << 25 | m >>> 7) ^ (m << 14 | m >>> 18) ^ m >>> 3) + n[e - 7] + ((p << 15 | p >>> 17) ^ (p << 13 | p >>> 19) ^ p >>> 10) + n[e - 16] } m = l + ((f << 26 | f >>> 6) ^ (f << 21 | f >>> 11) ^ (f << 7 | f >>> 25)) + (f & g ^ ~f & j) + t[e] + n[e]; p = ((c << 30 | c >>> 2) ^ (c << 19 | c >>> 13) ^ (c << 10 | c >>> 22)) + (c & d ^ c & b ^ d & b); l = j; j = g; g = f; f = k + m | 0; k = b; b = d; d = c; c = m + p | 0 } a[0] = a[0] + c | 0; a[1] = a[1] + d | 0; a[2] = a[2] + b | 0; a[3] = a[3] + k | 0; a[4] = a[4] + f | 0; a[5] = a[5] + g | 0; a[6] = a[6] + j | 0; a[7] = a[7] + l | 0 }, _doFinalize: function () { var d = this._data, b = d.words, a = 8 * this._nDataBytes, c = 8 * d.sigBytes; b[c >>> 5] |= 128 << 24 - c % 32; b[(c + 64 >>> 9 << 4) + 14] = k.floor(a / 4294967296); b[(c + 64 >>> 9 << 4) + 15] = a; d.sigBytes = 4 * b.length; this._process(); return this._hash }, clone: function () { var b = j.clone.call(this); b._hash = this._hash.clone(); return b } }); g.SHA256 = j._createHelper(h); g.HmacSHA256 = j._createHmacHelper(h) })(Math);
	(() => { var c = CryptoJS, k = c.enc.Utf8; c.algo.HMAC = c.lib.Base.extend({ init: function (a, b) { a = this._hasher = new a.init; "string" == typeof b && (b = k.parse(b)); var c = a.blockSize, e = 4 * c; b.sigBytes > e && (b = a.finalize(b)); b.clamp(); for (var f = this._oKey = b.clone(), g = this._iKey = b.clone(), h = f.words, j = g.words, d = 0; d < c; d++) h[d] ^= 1549556828, j[d] ^= 909522486; f.sigBytes = g.sigBytes = e; this.reset() }, reset: function () { var a = this._hasher; a.reset(); a.update(this._iKey) }, update: function (a) { this._hasher.update(a); return this }, finalize: function (a) { var b = this._hasher; a = b.finalize(a); b.reset(); return b.finalize(this._oKey.clone().concat(a)) } }) })();
	(() => { var h = CryptoJS, j = h.lib.WordArray; h.enc.Base64 = { stringify: function (b) { var e = b.words, f = b.sigBytes, c = this._map; b.clamp(); b = []; for (var a = 0; a < f; a += 3) for (var d = (e[a >>> 2] >>> 24 - 8 * (a % 4) & 255) << 16 | (e[a + 1 >>> 2] >>> 24 - 8 * ((a + 1) % 4) & 255) << 8 | e[a + 2 >>> 2] >>> 24 - 8 * ((a + 2) % 4) & 255, g = 0; 4 > g && a + 0.75 * g < f; g++) b.push(c.charAt(d >>> 6 * (3 - g) & 63)); if (e = c.charAt(64)) for (; b.length % 4;) b.push(e); return b.join("") }, parse: function (b) { var e = b.length, f = this._map, c = f.charAt(64); c && (c = b.indexOf(c), -1 != c && (e = c)); for (var c = [], a = 0, d = 0; d < e; d++) if (d % 4) { var g = f.indexOf(b.charAt(d - 1)) << 2 * (d % 4), h = f.indexOf(b.charAt(d)) >>> 6 - 2 * (d % 4); c[a >>> 2] |= (g | h) << 24 - 8 * (a % 4); a++ } return j.create(c, a) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" } })();

	hawk.crypto.internals = CryptoJS;


	// Export if used as a module

	if (typeof module !== 'undefined' && module.exports) {
	    module.exports = hawk;
	}

	/* eslint-enable */
	// $lab:coverage:on$


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function () {
	  'use strict';

	  function rename(obj, fn) {
	    if (typeof fn !== 'function') {
	      return obj;
	    }

	    var res = {};
	    for (var key in obj) {
	      if (obj.hasOwnProperty(key)) {
	        res[fn(key) || key] = obj[key];
	      }
	    }
	    return res;
	  }

	  if (typeof module !== 'undefined' && module.exports) {
	    module.exports = rename;
	  } else {
	    if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return rename;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	      window.rename = rename;
	    }
	  }
	})();


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* global localStorage */

	var getDOMStorage = function() {
	    var Storage = __webpack_require__(5);
	    return new Storage(null, { strict: true });
	};

	module.exports = (function() {
	    if (typeof localStorage !== 'undefined') {
	        return localStorage;
	    }
	    return getDOMStorage();
	})();


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	module.exports = {
	    coinstac: {
	        consortia: __webpack_require__(7)
	    },
	    authentication: __webpack_require__(8),
	    scans: __webpack_require__(14),
	    users: __webpack_require__(15),
	};


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	var baseUri = '/coinstac/consortia';
	var me;

	/**
	 * fetch consortia
	 * @param  {object} options: currently only supports {id: ...}
	 * @return {Promise}          promise resolving to server response
	 */
	function fetchConsortia(options) {
	    var uri = baseUri;
	    if (options && options.id) {
	        uri += '/' + options.id;
	    }

	    var request = {
	        method: 'GET',
	        uri: uri
	    };

	    return me.makeRequest(request, false)
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
	 * create a new consortium
	 * @param  {options} options is the consortium properties. see swagger docs
	 * @return {Promise}         a promise that resolves to server response
	 */
	function createConsortium(options) {
	    var request = {
	        method: 'POST',
	        uri: baseUri,
	        body: options
	    };

	    return me.makeRequest(request, false)
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
	 * update consortium
	 * @param  {options} options is the consortium properties. see swagger docs
	 * @return {Promise}         a promise that resolves to server response
	 */
	function updateConsortium(options) {
	    var request = {
	        method: 'PUT',
	        uri: baseUri + '/' + options._id,
	        body: options
	    };

	    return me.makeRequest(request, false)
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
	var init = function(base) {
	    me = base;
	    return {
	        get: fetchConsortia,
	        post: createConsortium,
	        put: updateConsortium
	    };
	};

	module.exports = init;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var btoa = __webpack_require__(9); // jshint ignore:line
	var baseUri = '/auth';
	var me;

	/**
	 * generate the authentication payload expected by POST /auth/keys route
	 * @param  {string} username
	 * @param  {string} password
	 * @return {object} object to be sent as POST data to /auth/keys
	 */
	function generateLoginPayload(username, password) {
	    return {
	        username: btoa(username),
	        password: btoa(password)
	    };
	}

	/**
	 * attempt to login to the API. This sets the API credentials
	 * @param  {string} username is the username to login with
	 * @param  {string} password is the password to login with
	 * @return {Promise}         a promise that resolves to server response
	 *                           or rejects with an error, where error.data
	 *                           contains the full response object
	 */
	function login(username, password) {
	    var authPayload = generateLoginPayload(username, password);
	    var request = {
	        method: 'POST',
	        uri: baseUri + '/keys',
	        body: authPayload
	    };
	    return me.makeRequest(request, false)
	        .then(function(response) {
	            var err;
	            if (response.statusCode !== 200) {
	                err = new Error(response.body.error.message);
	                err.data = response;
	                throw err;
	            } else {
	                return me.setAuthCredentials(response.body.data[0])
	                    .then(function() { return response; });
	            }
	        });
	}

	/**
	 * logout of the application
	 * @param  {string} id     (optional) is the id to logout.
	 *                         defaults to the currently logged in ID.
	 * @return {Promise}       a promise that resolves to server response
	 *                         or rejects with an error, where error.data
	 *                         contains the full response object
	 */
	function logout(id) {
	    /**
	     * set options and send request
	     * @param  {object} credentials hawk credentials object
	     * @return {Promise}             resolves to response
	     */
	    var sendRequest = function(credentials) {
	        id = id || credentials.id;
	        var uri = baseUri + '/keys/' + id;
	        var method = 'DELETE';
	        var request = {
	            method: method,
	            uri: uri
	        };
	        return me.makeRequest(request, true);
	    };

	    /**
	     * handle response from server: throwing an error if needed
	     * also unsets the local store of credentials
	     * @param  {object} response the response sent back from the server
	     * @return {Promise}          resolves to the response object
	     */
	    var handleResponse = function(response) {
	        var loggedOutCreds = { status: 'logged out', date: Date.now() };
	        var err;

	        /**
	         * convenience function to return the response
	         * @return {object} response object
	         */
	        var returnResponse = function() {
	            return response;
	        };

	        if (response.statusCode !== 200) {
	            err = new Error(response.body.error.message);
	            err.data = response;
	            throw err;
	        }

	        return me.setAuthCredentials(loggedOutCreds)
	            .then(returnResponse);
	    };

	    return me.getAuthCredentials()
	        .then(sendRequest)
	        .then(handleResponse);
	}

	/**
	 * initialize the internals with the config from index.js
	 * @param  {object} config the config object from index.js
	 * @return {null}        nothing
	 */
	function init(base) {
	    me = base;
	    return {
	        login: login,
	        logout: logout
	    };
	}

	module.exports = init;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {(function () {
	  "use strict";

	  function btoa(str) {
	    var buffer
	      ;

	    if (str instanceof Buffer) {
	      buffer = str;
	    } else {
	      buffer = new Buffer(str.toString(), 'binary');
	    }

	    return buffer.toString('base64');
	  }

	  module.exports = btoa;
	}());

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(11)
	var ieee754 = __webpack_require__(12)
	var isArray = __webpack_require__(13)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10).Buffer, (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 12 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';
	var me;
	var baseUri = '/scans';

	/**
	 * get scans
	 * @param  {object} queryParameters: optional object of query parameters
	 *                                   See swagger docs for accepted
	 *                                   parameters
	 * @return {Promise}         a promise that resolves to server response
	 *                           or rejects with an error, where error.data
	 *                           contains the full response object
	 */
	function getScans(queryParameters) {
	    queryParameters = queryParameters || {};

	    var request = {
	        method: 'GET',
	        uri: baseUri,
	        qs: queryParameters
	    };

	    return me.makeRequest(request, true)
	        .then(function(response) {
	            var err;
	            if (response.statusCode !== 200) {
	                err = new Error(response.body.error.message);
	                err.data = response;
	                throw err;
	            } else {
	                return response;
	            }
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
	        get: getScans
	    };
	}

	module.exports = init;


/***/ },
/* 15 */
/***/ function(module, exports) {

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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    requestFn: null,
	    requestObjectMap: {
	        method: 'method',
	        body: 'body',
	        headers: 'headers',
	        uri: 'uri'
	    },
	    baseUrl: ("https://coins-api.mrn.org/api"), // jshint ignore:line
	    version: null,
	    formatRequestHeaders: function(value) {
	        return value;
	    },

	    formatResponseCallback: function(respArray) {
	        respArray[0].body = JSON.parse(respArray[0].body);
	        return respArray[0];
	    }
	};


/***/ }
/******/ ])
});
;