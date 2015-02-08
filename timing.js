(function(global) {
  if (!('window' in global && 'document' in global))
    return;

  //----------------------------------------------------------------------
  //
  // Timing control for script-based animations
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/RequestAnimationFrame/Overview.html
  //
  //----------------------------------------------------------------------

  // requestAnimationFrame - needed for IE9-
  (function() {
    if ('requestAnimationFrame' in global)
      return;

    var TARGET_FPS = 60,
        requests = Object.create(null),
        raf_handle = 0,
        timeout_handle = -1;

    function isVisible(element) {
      return element.offsetWidth > 0 && element.offsetHeight > 0;
    }

    function onFrameTimer() {
      var cur_requests = requests;
      requests = Object.create(null);
      timeout_handle = -1;
      Object.keys(cur_requests).forEach(function(id) {
        var request = cur_requests[id];
        if (!request.element || isVisible(request.element))
          request.callback(Date.now());
      });
    }

    function requestAnimationFrame(callback, element) {
      var cb_handle = ++raf_handle;
      requests[cb_handle] = {callback: callback, element: element};
      if (timeout_handle === -1)
        timeout_handle = global.setTimeout(onFrameTimer, 1000 / TARGET_FPS);
      return cb_handle;
    }

    function cancelAnimationFrame(handle) {
      delete requests[handle];
      if (Object.keys(requests).length === 0) {
        global.clearTimeout(timeout_handle);
        timeout_handle = -1;
      }
    }

    global.requestAnimationFrame = requestAnimationFrame;
    global.cancelAnimationFrame = cancelAnimationFrame;
  }());


  //----------------------------------------------------------------------
  //
  // Efficient Script Yielding
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
  // (Not widely adopted.)
  //
  //----------------------------------------------------------------------

  // setImmediate
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
