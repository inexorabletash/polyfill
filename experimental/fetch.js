// Work-In-Progress 'prollyfill' for Fetch API
// Standard: http://fetch.spec.whatwg.org/#fetch-api
//
// As usual, the intent is to produce a forward-compatible
// subset so that code can be written using future standard
// functionality; not every case is considered or supported.

// Requires ES6: Promise, Symbol.iterator (or polyfill)
// Requires: URL (or polyfill)

// Example:
//   fetch('README.md')
//     .then(function(response) { return response.body.asText(); })
//     .then(function(text) { alert(text); });

(function(global) {

  // Web IDL concepts

  // http://heycam.github.io/webidl/#idl-ByteString
  function ByteString(value) {
    value = String(value);
    if (value.match(/[^\x00-\xFF]/)) throw TypeError('Not a valid ByteString');
    return value;
  }

  // http://encoding.spec.whatwg.org/#scalarvaluestring
  function ScalarValueString(value) {
    value = String(value);
    return value.replace(
        /([\u0000-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF])/g,
      function (c) {
        if (/^[\uD800-\uDFFF]$/.test(c)) return '\uFFFD';
        return c;
      });
  }

  function ushort(x) { return x & 0xFFFF; }

  // 2 Terminology

  function byteLowerCase(s) {
    return String(s).replace(/[A-Z]/g, function(c) { return c.toLowerCase(); });
  }

  function byteUpperCase(s) {
    return String(s).replace(/[a-z]/g, function(c) { return c.toUpperCase(); });
  }

  function byteCaseInsensitiveMatch(a, b) {
    return byteLowerCase(b) === byteLowerCase(b);
  }

  // 2.1 HTTP

  // 2.1.1 Methods

  function isForbiddenMethod(m) {
    m = byteUpperCase(m);
    return m === 'CONNECT' || m === 'TRACE' || m === 'TRACK';
  }

  function normalizeMethod(m) {
    var u = byteUpperCase(m);
    if (u === 'DELETE' || u === 'GET' || u === 'HEAD' || u === 'OPTIONS' ||
        u === 'POST' || u === 'PUT') return u;
    return m;
  }

  function isName(s) {
    return /^[!#$%&'*+\-.09A-Z^_`a-z|~]+$/.test(s);
  }
  function isValue(s) {
    // TODO: Implement me
    return true;
  }
  function isForbiddenHeaderName(n) {
    n = String(n).toLowerCase();
    var forbidden = {
      'accept-charset': true,
      'accept-encoding': true,
      'access-control-request-headers': true,
      'access-control-request-method': true,
      'connection': true,
      'content-length': true,
      'cookie': true,
      'cookie2': true,
      'date': true,
      'dnt': true,
      'expect': true,
      'host': true,
      'keep-alive': true,
      'origin': true,
      'referer': true,
      'te': true,
      'trailer': true,
      'transfer-encoding': true,
      'upgrade': true,
      'user-agent': true,
      'via': true
    };
    return forbidden[n] || n.substring(0, 6) === 'proxy-' || n.substring(0, 4) === 'sec-';
  }

  function isForbiddenResponseHeaderName(n) {
    n = String(n).toLowerCase();
    var forbidden = {
      'set-cookie': true,
      'set-cookie2': true
    };
    return forbidden[n];
  }

  function isSimpleHeader(name, value) {
    name = String(name).toLowerCase();
    return name === 'accept' || name === 'accept-language' || name === 'content-language' ||
      (name === 'content-type' &&
       ['application/x-www-form-encoded', 'multipart/form-data', 'text/plain'].indexOf(value) !== -1);
  }

  //
  // 5.1 Headers class
  //

  // typedef (Headers or sequence<sequence<ByteString>> or OpenEndedDictionary<ByteString>) HeadersInit;

  // Constructor(optional HeadersInit init)
  function Headers(init) {
    this._guard = 'none';
    this._headerList = [];
    if (init) fill(this, init);
  }

  function fill(headers, init) {
    if (init instanceof Headers) {
      init._headerList.forEach(function(header) {
        headers.append(header[0], header[1]);
      });
    } else if (Array.isArray(init)) {
      init.forEach(function(header) {
        if (!Array.isArray(header) || header.length !== 2) throw TypeError();
        headers.append(header[0], header[1]);
      });
    } else {
      init = Object(init);
      Object.keys(init).forEach(function(key) {
        headers.append(key, init[key]);
      });
    }
  }

  // interface Headers
  Headers.prototype = {
    // void append(ByteString name, ByteString value);
    append: function append(name, value) {
      name = ByteString(name);
      if (!isName(name) || !isValue(value)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, value)) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      this._headerList.push([name, value]);
    },

    // void delete(ByteString name);
    'delete': function delete_(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, 'invalid')) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      var index = 0;
      while (index < this._headerList.length) {
        if (this._headerList[index][0] === name)
          this._headerList.splice(index, 1);
        else
          ++index;
      }
    },

    // ByteString? get(ByteString name);
    get: function get(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          return this._headerList[index][1];
      }
      return null;
    },

    // sequence<ByteString> getAll(ByteString name);
    getAll: function getAll(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      var sequence = [];
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          sequence.push(this._headerList[index][1]);
      }
      return sequence;
    },

    // boolean has(ByteString name);
    has: function has(name) {
      name = ByteString(name);
      if (!isName(name)) throw TypeError();
      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name)
          return true;
      }
      return false;
    },

    // void set(ByteString name, ByteString value);
    set: function set(name, value) {
      name = ByteString(name);
      if (!isName(name) || !isValue(value)) throw TypeError();
      if (this._guard === 'immutable') throw TypeError();
      else if (this._guard === 'request' && isForbiddenHeaderName(name)) return;
      else if (this._guard === 'request-no-CORS' && !isSimpleHeader(name, value)) return;
      else if (this._guard === 'response' && isForbiddenResponseHeaderName(name)) return;

      name = name.toLowerCase();
      for (var index = 0; index < this._headerList.length; ++index) {
        if (this._headerList[index][0] === name) {
          this._headerList[index++][1] = value;
          while (index < this._headerList.length) {
            if (this._headerList[index][0] === name)
              this._headerList.splice(index, 1);
            else
              ++index;
          }
          return;
        }
      }
      this._headerList.push([name, value]);
    }
  };
  Headers.prototype[Symbol.iterator] = function() {
    return new HeadersIterator(this);
  };

  function HeadersIterator(headers) {
    this._headers = headers;
    this._index = 0;
  }
  HeadersIterator.prototype = {};
  HeadersIterator.prototype.next = function() {
    if (this._index >= this._headers._headerList.length)
      return { value: undefined, done: true };
    return { value: this._headers._headerList[this._index++], done: false };
  };
  HeadersIterator.prototype[Symbol.iterator] = function() { return this; };


  //
  // 5.2 Body stream concept
  //

  function FetchBodyStream(_init) {
    // TODO: Handle initialization from other types
    this._init = _init;
    this._read = false;
  }

  // interface FetchBodyStream
  FetchBodyStream.prototype = {
    // Promise<ArrayBuffer> asArrayBuffer();
    asArrayBuffer: function() {
      if (this._read) return Promise.reject(TypeError());
      this._read = true;
      if (this._init instanceof ArrayBuffer) return Promise.resolve(this._init);
      var value = this._init;
      return new Promise(function(resolve, reject) {
        var octets = unescape(encodeURIComponent(value)).split('').map(function(c) {
          return c.charCodeAt(0);
        });
        resolve(new Uint8Array(octets).buffer);
      });
    },
    // Promise<Blob> asBlob();
    asBlob: function() {
      if (this._read) return Promise.reject(TypeError());
      this._read = true;
      if (this._init instanceof Blob) return Promise.resolve(this._init);
      return Promise.resolve(new Blob([this._init]));
    },
    // Promise<FormData> asFormData();
    asFormData: function() {
      if (this._read) return Promise.reject(TypeError());
      this._read = true;
      if (this._init instanceof FormData) return Promise.resolve(this._init);
      return Promise.reject(Error('Not yet implemented'));
    },
    // Promise<JSON> asJSON();
    asJSON: function() {
      if (this._read) return Promise.reject(TypeError());
      this._read = true;
      var that = this;
      return new Promise(function(resolve, reject) {
        resolve(JSON.parse(that._init));
      });
    },
    // Promise<ScalarValueString> asText();
    asText: function() {
      if (this._read) return Promise.reject(TypeError());
      this._read = true;
      return Promise.resolve(String(this._init));
    }
  };

  //
  // 5.3 Request class
  //

  // typedef (Request or ScalarValueString) RequestInfo;

  // Constructor(RequestInfo input, optional RequestInit init)
  function Request(input, init) {
    if (arguments.length < 1) throw TypeError('Not enough arguments');

    this.method = 'GET';

    this.headers = new Headers();
    this.headers._guard = 'request';

    this.body = null;

    // TODO: Construct from other Request
    if (typeof input !== 'string') throw Error('Not yet implemented');

    input = ScalarValueString(input);

    init = Object(init);

    // readonly attribute ByteString method;
    if ('method' in init) {
      var method = ByteString(init.method);
      if (isForbiddenMethod(method)) throw TypeError();
      this.method = normalizeMethod(method);
    }

    // readonly attribute ScalarValueString url;
    this.url = String(new URL(input, self.location));

    // readonly attribute Headers headers;
    if ('headers' in init) fill(this.headers, init.headers);

    // readonly attribute FetchBodyStream body;
    if ('body' in init)
      this.body = new FetchBodyStream(init.body);

    // TODO: Implement these
    // readonly attribute DOMString referrer;
    this.referrer = null;

    // readonly attribute RequestMode mode;
    this.mode = null;

    // readonly attribute RequestCredentials credentials;
    this.credentials = null;
  }

  // interface Request
  Request.prototype = {
  };

  //
  // 5.4 Response class
  //

  // Constructor(optional FetchBodyInit body, optional ResponseInit init)
  function Response(body, init) {
    if (arguments.length < 1) throw TypeError('Not enough arguments');

    this.headers = new Headers();
    this.headers._guard = 'response';

    // Internal
    if (body instanceof XMLHttpRequest && '_url' in body) {
      var xhr = body;
      this.type = 'basic'; // TODO: ResponseType
      this.url = ScalarValueString(xhr._url);
      this.status = xhr.status;
      this.statusText = xhr.statusText;
      xhr.getAllResponseHeaders()
        .split(/\r?\n/)
        .filter(function(header) { return header.length; })
        .forEach(function(header) {
          var i = header.indexOf(':');
          this.headers.append(header.substring(0, i), header.substring(i + 2));
        }, this);
      this.body = new FetchBodyStream(xhr.responseText);
      return;
    }

    init = Object(init) || {};

    // readonly attribute ScalarValueString url;
    this.url = '';

    // readonly attribute unsigned short status;
    if ('status' in init) {
      if (ushort(init.status) < 200 || ushort(init.status) > 599) throw RangeError();
      this.status = ushort(init.status);
    }

    // readonly attribute ByteString statusText;
    if ('statusText' in init)
      this.statusText = String(init.statusText); // TODO: Validate

    // readonly attribute Headers headers;
    if ('headers' in init) fill(this.headers, init);

    // readonly attribute FetchBodyStream body;
    this.body = new FetchBodyStream(body);

    // TODO: Implement these
    // readonly attribute ResponseType type;
    this.type = 'basic'; // TODO: ResponseType
  }

  // interface Response
  Response.prototype = {
  };

  Response.redirect = function() {
    // TODO: Implement?
    throw Error('Not supported');
  };

  //
  // 5.5 Structured cloning of Headers, FetchBodyStream, Request, Response
  //

  //
  // 5.6 Fetch method
  //

  // Promise<Response> fetch(RequestInfo input, optional RequestInit init);
  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var r = new Request(input, init);

      var xhr = new XMLHttpRequest(), async = true;
      xhr._url = r.url;

      xhr.open(r.method, r.url, async);
      for (var iter = r.headers[Symbol.iterator](), step = iter.next();
           !step.done; step = iter.next())
        xhr.setRequestHeader(step.value[0], step.value[1]);

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status === 0)
          reject(new TypeError('Network error'));
        else
          resolve(new Response(xhr));
      };

      if (r.body) {
       xhr.send(r.body._init);
      } else {
        xhr.send();
      }
    });
  }

  // Exported
  global.Headers = Headers;
  global.Request = Request;
  global.Response = Response;
  global.fetch = fetch;

}(self));
