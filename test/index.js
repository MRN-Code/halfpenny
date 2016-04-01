'use strict';
const halfpenny = require('../');
const DomStorage = require('dom-storage');
const store = new DomStorage(null, { strict: true });
const stubPath = require('path').join(__dirname, 'client-src-stub._js');
const clientSrcStub = require('fs').readFileSync(stubPath, 'utf8');
const axios = require('axios');
const functionStub = '(function() { return function(a) { return a + 1; }; })()';
const test = require('tape');

test('applies defaults', (t) => {
  let rslt;

  t.throws(() => halfpenny._applyDefaults({}), ReferenceError, 'needs storage engine');
  rslt = halfpenny._applyDefaults({ store });
  t.equal(rslt.baseUrl, 'https://coins-api.mrn.org', 'baseUrl injected');
  t.equal(rslt.clientUrl, 'https://coins-api.mrn.org/api/client/client.js', 'clientUrl injected');
  rslt = halfpenny._applyDefaults({ baseUrl: 'foo', store });
  t.equal(rslt.baseUrl, 'foo', 'baseUrl overrides ok');
  rslt = halfpenny._applyDefaults({ xhrAgent: { get: 'testGet' }, store });
  t.equal(rslt.xhrAgent.get, 'testGet', 'xhrAgent overrides ok');
  t.end();
});

test('src client extraction', (t) => {
  const src = halfpenny._extractClientSrc({ data: 'foo' });
  t.equal(src, 'foo', '_extractClientSrc extracts data property');
  t.throws(
    () => halfpenny._extractClientSrc({ data: null }),
    '_extractClientSrc error on empty value (null)'
  );
  t.end();
});

test('src evauluation', (t) => {
  const evaluatedFunction = halfpenny._evalClientSrc(functionStub);
  t.ok(evaluatedFunction instanceof Function, 'src evauluated ok, 1');
  t.equal(evaluatedFunction(1), 2, 'src evaluated ok, 2');
  t.end();
});

test('factory', (t) => {
  t.plan(3);
  axios.get = () => Promise.resolve({ data: clientSrcStub }); // manual stubbing! @warning! :)
  halfpenny.factory({ store }, (err, client) => {
    if (err) { return t.end(err.message); }
    t.ok(client, 'some object returned from halfpenny.factory');
    t.ok(client.auth, 'client.auth is a thing');
    t.ok(client.auth.login, 'client.auth.login is a thing');
    return t.end();
  });
});
