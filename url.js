// URL Polyfill
// Draft specification: http://url.spec.whatwg.org

// Notes:
// - Primarily useful for parsing URLs and modifying query parameters
// - Should work in IE8+ and everything more modern

(function (global) {
  "use strict";

  var OVERRIDE = (function () {
    if (!('URL' in global))
      return true;
    if (typeof global.URL !== 'function')
      return true;
    try {
      var url = new global.URL;
      return !('searchParams' in url);
    } catch (e) {
      return true;
    }
  }());

  if (!OVERRIDE)
    return;

  // Strip empty query/hash
  function tidy(anchor) {
    var href = anchor.href.replace(/#$|\?$|\?(?=#)/g, '');
    if (anchor.href !== href)
      anchor.href = href;
  }

  var origURL = global.URL;
  global.URL = function URL(url, baseURL) {
    if (!(this instanceof global.URL))
      throw new TypeError("Failed to construct 'URL': Please use the 'new' operator.");

    if (baseURL) {
      url = (function () {
        var doc, base, anchor;
        // Use another document/base tag/anchor for relative URL resolution, if possible
        if (document.implementation && document.implementation.createHTMLDocument) {
          doc = document.implementation.createHTMLDocument("");
        } else if (document.implementation && document.implementation.createDocument) {
          doc = document.implementation.createElement('http://www.w3.org/1999/xhtml', 'html', null);
          doc.documentElement.appendChild(doc.createElement('head'));
          doc.documentElement.appendChild(doc.createElement('body'));
        } else if (window.ActiveXObject) {
          doc = new window.ActiveXObject("htmlfile");
          doc.write("<head></head><body></body>");
          doc.close();
        }

        if (!doc) throw Error("baseURL not supported");

        base = doc.createElement("base");
        base.href = baseURL;
        doc.getElementsByTagName("head")[0].appendChild(base);
        anchor = doc.createElement("a");
        anchor.href = url;
        return anchor.href;
      }());
    }

    // Use an actual HTMLAnchorElement instance since the semantics
    // are pretty close.
    var anchor = document.createElement('a');
    anchor.href = url || "";

    // NOTE: Doesn't do the encoding/decoding dance
    function parse(input, isindex) {
      var sequences = input.split('&');
      if (isindex && sequences[0].indexOf('=') === -1)
        sequences[0] = '=' + sequences[0];
      var pairs = [];
      sequences.forEach(function (bytes) {
        if (bytes.length === 0) return;
        var index = bytes.indexOf('=');
        if (index !== -1) {
          var name = bytes.substring(0, index);
          var value = bytes.substring(index + 1);
        } else {
          name = bytes;
          value = '';
        }
        name = name.replace('+', ' ');
        value = value.replace('+', ' ');
        pairs.push({ name: name, value: value });
      });
      var output = [];
      pairs.forEach(function (pair) {
        output.push({
          name: decodeURIComponent(pair.name),
          value: decodeURIComponent(pair.value)
        });
      });
      return output; // Spec bug?
    }

    function URLSearchParams(anchor, init) {
      var pairs = [];
      if (init)
        pairs = parse(init);

      this._setPairs = function (list) { pairs = list; };
      this._updateSteps = function () { updateSteps(); };

      function updateSteps() {
        // TODO: For all associated url objects
        anchor.search = serialize(pairs);
        tidy(anchor);
      }

      // NOTE: Doesn't do the encoding/decoding dance
      function serialize(pairs) {
        var output = '', first = true;
        pairs.forEach(function (pair) {
          var name = encodeURIComponent(pair.name);
          var value = encodeURIComponent(pair.value);
          if (!first) output += '&';
          output += name + '=' + value;
          first = false;
        });
        return output;
      }

      Object.defineProperties(this, {
        append: {
          value: function (name, value) {
            pairs.push({ name: name, value: value });
            updateSteps();
          }
        },

        'delete': {
          value: function (name) {
            for (var i = 0; i < pairs.length;) {
              if (pairs[i].name === name)
                pairs.splice(i, 1);
              else
                ++i;
            }
            updateSteps();
          }
        },

        get: {
          value: function (name) {
            for (var i = 0; i < pairs.length; ++i) {
              if (pairs[i].name === name)
                return pairs[i].value;
            }
            return null;
          }
        },

        getAll: {
          value: function (name) {
            var result = [];
            for (var i = 0; i < pairs.length; ++i) {
              if (pairs[i].name === name)
                result.push(pairs[i].value);
            }
            return result;
          }
        },

        has: {
          value: function (name) {
            for (var i = 0; i < pairs.length; ++i) {
              if (pairs[i].name === name)
                return true;
            }
            return false;
          }
        },

        set: {
          value: function (name, value) {
            var found = false;
            for (var i = 0; i < pairs.length;) {
              if (pairs[i].name === name) {
                if (!found) {
                  pairs[i].value = value;
                  ++i;
                } else {
                  pairs.splice(i, 1);
                }
              } else {
                ++i;
              }
            }
            updateSteps();
          }
        },

        toString: {
          value: function () {
            return serialize(pairs);
          }
        }
      });
    };

    var queryObject = new URLSearchParams(
      anchor, anchor.search ? anchor.search.substring(1) : null);

    // An inner HTMLAnchorElement is used to perform the URL algorithms.
    // With full ES5 getter/setter support, return a regular object
    // For IE8's limited getter/setter support, a different HTMLAnchorElement
    // is returned with properties overridden

    // Detect for ES5 getter/setter support
    var ES5_GET_SET = (Object.defineProperties && (function () {
      var o = {}; Object.defineProperties(o, { p: { 'get': function () { return true; } } }); return o.p;
    }()));

    var self = ES5_GET_SET ? this : document.createElement('a');

    Object.defineProperties(self, {
      href: {
        get: function () { return anchor.href; },
        set: function (v) { anchor.href = v; update(); }
      },
      origin: {
        get: function () {
          if ('origin' in anchor) return anchor.origin;
          var host = anchor.host;
          if (anchor.protocol === 'http:') host = host.replace(/:80$/, '');
          if (anchor.protocol === 'https:') host = host.replace(/:443$/, '');
          if (anchor.protocol === 'ftp:') host = host.replace(/:21$/, '');
          return anchor.protocol + '//' + host;
        }
      },
      protocol: {
        get: function () { return anchor.protocol; },
        set: function (v) { anchor.protocol = v; update(); }
      },
      username: {
        get: function () { return anchor.username; },
        set: function (v) { anchor.username = v; update(); }
      },
      password: {
        get: function () { return anchor.password; },
        set: function (v) { anchor.password = v; update(); }
      },
      host: {
        get: function () {
          // IE returns default port in |host|
          if (anchor.protocol === 'http:') return anchor.host.replace(/:80$/, '');
          if (anchor.protocol === 'https:') return anchor.host.replace(/:443$/, '');
          if (anchor.protocol === 'ftp:') return anchor.host.replace(/:21$/, '');
          return anchor.host;
        },
        set: function (v) { anchor.host = v; update(); }
      },
      hostname: {
        get: function () { return anchor.hostname; },
        set: function (v) { anchor.hostname = v; update(); }
      },
      port: {
        get: function () { return anchor.port; },
        set: function (v) { anchor.port = v; update(); }
      },
      pathname: {
        get: function () {
          // IE does not include leading '/' in |pathname|
          if (anchor.pathname.charAt(0) !== '/') return '/' + anchor.pathname;
          return anchor.pathname;
        },
        set: function (v) { anchor.pathname = v; update(); }
      },
      search: {
        get: function () { return anchor.search; },
        set: function (v) { anchor.search = v; update(); }
      },
      searchParams: {
        get: function () { return queryObject; }
        // TODO: implement setter
      },
      hash: {
        get: function () { return anchor.hash; },
        set: function (v) { anchor.hash = v; update(); }
      }
    });

    function update() {
      tidy(anchor);
      queryObject._setPairs(anchor.search ? parse(anchor.search.substring(1)) : []);
      queryObject._updateSteps();
    };

    return self;
  };

  if (origURL) {
    for (var i in origURL)
      global.URL[i] = origURL[i];
  }

}(this));
