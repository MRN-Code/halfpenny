var getDOMStorage = function() {
    var Storage = require('dom-storage');
    return new Storage(null, { strict: true });
};

module.exports = (function() {
    if (typeof localStorage !== 'undefined') {
        return localStorage;
    }
    return getDOMStorage();
})();
