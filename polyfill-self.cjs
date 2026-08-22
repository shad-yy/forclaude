if (typeof self === 'undefined') {
  global.self = global;
}

// Guard crypto Hash.update against undefined data (Node 22 + webpack 5 fix).
// webpack's BulkUpdateDecorator passes undefined to Hash.update during module
// content hashing. Node 20 silently coerced it, but Node 22 throws
// ERR_INVALID_ARG_TYPE. This patch converts undefined/null to empty string.
const crypto = require('node:crypto');
const _origCreateHash = crypto.createHash;
crypto.createHash = function patchedCreateHash(...args) {
  const hash = _origCreateHash.apply(this, args);
  const _origUpdate = hash.update.bind(hash);
  hash.update = function safeUpdate(data, encoding) {
    if (data === undefined || data === null) {
      return _origUpdate('', encoding);
    }
    return _origUpdate(data, encoding);
  };
  return hash;
};
