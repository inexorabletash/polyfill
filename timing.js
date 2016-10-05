(function(global) {
  if (!('window' in global && 'document' in global))
    return;

  //----------------------------------------------------------------------
  //
  // Efficient Script Yielding
  // http://w3c.github.io/setImmediate/
  // (Not widely adopted.)
  //
  //----------------------------------------------------------------------

  (function() {
    if ('setImmediate' in global)
      return;

    function setImmediate(callback/*, args*/) {
      var params = [].slice.call(arguments, 1);
      return global.setTimeout(function() {
        callback.apply(null, params);
      }, 0);
    }

    function clearImmediate(handle) {
      global.clearTimeout(handle);
    }

    global.setImmediate = setImmediate;
    global.clearImmediate = clearImmediate;
  }());
}(this));
