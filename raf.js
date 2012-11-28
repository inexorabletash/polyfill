// requestAnimationFrame polyfill
// http://www.w3.org/TR/animation-timing/

// NOTE: This has been integrated into polyfill.js

(function (window) {
  "use strict";

  var TARGET_FPS = 60,
      requests = {},
      raf_handle = 1,
      timeout_handle = -1;

  function isVisible(element) {
    return element.offsetWidth > 0 && element.offsetHeight > 0;
  }

  function onFrameTimer() {
    var cur_requests = requests, id, request;

    requests = {};
    timeout_handle = -1;

    for (id in cur_requests) {
      if (Object.prototype.hasOwnProperty.call(cur_requests, id)) {
        request = cur_requests[id];
        if (!request.element || isVisible(request.element)) {
          request.callback(Date.now());
        }
      }
    }
  }

  function requestAnimationFrame(callback, element) {
    var cb_handle = raf_handle;
    raf_handle = raf_handle + 1;
    requests[cb_handle] = {callback: callback, element: element};

    if (timeout_handle === -1) {
      timeout_handle = setTimeout(onFrameTimer, 1000 / TARGET_FPS);
    }

    return cb_handle;
  }

  function cancelAnimationFrame(handle) {
    delete requests[handle];

    if (Object.keys(requests).length === 0) {
      clearTimeout(timeout_handle);
      timeout_handle = -1;
    }
  }

  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    requestAnimationFrame;

  // NOTE: Older versions of the spec called this "cancelRequestAnimationFrame"
  window.cancelAnimationFrame =
    window.cancelAnimationFrame ||
    window.cancelRequestAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    cancelAnimationFrame;

  window.cancelRequestAnimationFrame = window.cancelAnimationFrame;

}(window));
