(function() {
  "use strict";

  function currentScriptURL() {
    return document.getElementsByTagName('SCRIPT')[0].src;
  }

  function resolveURL(url, base) {
    if (!base) {
      // relative to page
      return url;
    } else if (/^\w+:/.test(url)) {
      // absolute (has scheme)
      return url;
    } else if (/^\//.test(url) && /^(\w+:\/\/.*?)\//.test(base)) {
      // rooted e.g. "/res/script.js"
      return RegExp.$1 + url;
    } else {
      // relative
      return base.replace(/\/[^\/]*$/, '/' + url);
    }
  }


  // Async, no callback, shortest
  function importScript1(url) {
    url = resolveURL(url, currentScriptURL());
    document.write('<script type="text/javascript" src="' + url + '"></' + 'script>');
  }

  // Async, callback
  function importScript2(url, callback) {
    var s = document.createElement('script'), ss = document.getElementsByTagName('script'), cur = ss[ss.length - 1];
    s.onload = callback;
    s.onreadystatechange = callback;
    s.src = resolveURL(url, currentScriptURL());
    cur.parentNode.insertBefore(s, cur.nextSibling);
  }

  // Async, callback
  function importScript3(url, callback) {
    var s = document.createElement('script');
    s.onload = callback;
    s.onreadystatechange = callback;
    s.src = resolveURL(url, currentScriptURL());
    (document.getElementsByTagName('head')[0]||document.documentElement).appendChild(s);
  }

  // Sync or async w/ callback
  // ... but then dependent scripts have loading script's URL as current, bleah
  function importScript4(url, callback) {
    var xhr = new XMLHttpRequest(), HTTP_OK = 200, FILE_OK = 0;
    xhr.open("GET", resolveURL(url, currentScriptURL()), Boolean(callback));
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {

        if (xhr.status === FILE_OK || xhr.status === HTTP_OK) {
          eval.call(window, xhr.responseText);
          if (callback) {
            callback();
          }
        }
      }
    };
    xhr.send(null);
  }

  window.importScript = importScript2;
}());
