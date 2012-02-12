// Browser and ES5 shims
// <script src="/polyfill/polyfill.js"></script>

// ECMAScript "Harmony" shims
// <script src="/polyfill/harmony.js"></script>

// <script>
(function() {

  function currentScriptURL() {
    return document.getElementsByTagName('SCRIPT')[0].src;
  }

  function resolveURL(url, base) {
    if (/^\w+:/.test(url)) {
      return url;
    } else if (/^\//.test(url) && /^(\w+:\/\/.*?)\//.test(base)) {
      return RegExp.$1 + url;
    } else {
      return base.replace(/\/[^\/]*$/, '/' + url);
    }
  }


  // Async, no callback, shortest
  function importScript(url) {
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

  // Sync, callback
  function importScript4(url) {
    var xhr = new XMLHttpRequest(), async = false, HTTP_OK = 200, FILE_OK = 0;
    xhr.open("GET", resolveURL(url, currentScriptURL()), async);
    xhr.onreadystatechange = function (e) {
      if (e.status === XMLHttpRequest.DONE) {
        if (status === FILE_OK || status === HTTP_OK) {
          eval(response.responseText);
        }
      }
    };
    xhr.send(null);
  }

  /*
  if (!window.JSON) { importScript('polyfill/json2.js'); }
  if (!window.console) { importScript('polyfill/console.js'); }
  if (!window.requestAnimationFrame) { importScript('polyfill/raf.js'); }
  if (!window.localStorage) { importScript('polyfill/storage.js'); }
  if (!window.Worker) { importScript('polyfill/workers.js'); }
  if (!window.requestAnimationFrame) { importScript('polyfill/raf.js'); }
  if (!window.URL) { importScript('polyfill/url.js'); }
  if (!document.getCookie) { importScript('polyfill/cookie.js'); }
  if (!('getContext' in document.createElement('canvas'))) { importScript('polyfill/flashcanvas.js'); }
  */
}());
// </script>
