//
// Web Workers (http://www.whatwg.org/specs/web-workers/current-work/)
//
window.Worker = window.Worker || (function () {

  function __loadScript(src, callback, errback) {
    var HTTP_OK = 200,
        FILE_OK = 0,
        xhr = new XMLHttpRequest(),
        async = true;
    xhr.open("GET", src, async);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (status === FILE_OK || status === HTTP_OK) {
          callback(xhr.responseText);
        }
        else if (errback) {
          errback(xhr.responseText);
        }
      }
    };
    xhr.send(null);
  }

  function Worker(src) {
    //--------------------------------------------------
    // Environment exposed to the worker script
    //--------------------------------------------------

    var worker = this,
        onmessage = null, // set by worker, called on post by parent
        __tasks = [], // queue of messages from parent
        __closing = false; // flag, set when closing

    //--------------------------------------------------
    // API exposed from the Worker object
    //--------------------------------------------------

    // set by parent, called on post by worker
    worker.onmessage = null;

    // set by parent, called on post by worker
    worker.onerror = null;

    // post message to the worker
    worker.postMessage = function (message) {
      if (__closing) { return; }
      __tasks.push(setTimeout(function () {
        try {
          if (typeof onmessage === 'function') {
            onmessage({ data: message });
          }
        }
        catch (e) {
          if (typeof worker.onerror === 'function') {
            worker.onerror(e);
          }
        }
      }, 0));
    };

    // terminate the worker
    worker.terminate = function () {
      __closing = true;
      while (__tasks.length) {
        clearTimeout(__tasks.shift());
      }
    };

    //--------------------------------------------------
    // API exposed to the worker script
    //--------------------------------------------------

    var workerContext = {
      // post message from the worker to the parent
      postMessage: function(message) {
        setTimeout(function () {
          if (typeof worker.onmessage === 'function') {
            worker.onmessage({ data: message });
          }
        }, 0);
      },

      // discard tasks and prevent further task queueing
      close: function() {
        worker.terminate();
      },

      importScripts: function(urls) {
        var i;
        for (i = 0; i < arguments.length; i += 1) {
          __loadScript(src, function (script) {
            eval(script);
          }, function (error) {
            throw new Error(error);
          });
        }
      }
    };

    workerContext.self = workerContext;

    __loadScript(src, function (script) {
      with (workerContext) {
        eval("(function(){" + script + "}).call(workerContext)");
      }
    });
  };

  return Worker;

} ());
