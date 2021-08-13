// Work-In-Progress 'prollyfill' for Fetch API
// Standard: https://fetch.spec.whatwg.org/#fetch-api
//
// As usual, the intent is to produce a forward-compatible
// subset so that code can be written using future standard
// functionality; not every case is considered or supported.

// Requires ES2015: Promise, Symbol.iterator (or polyfill)
// Requires: URL (or polyfill)

// Example:
//   fetch('README.md')
//     .then(function(response) { return response.text(); })
//     .then(function(text) { alert(text); });

(function(global) {
  'use strict';

  // Web IDL concepts

  // https://heycam.github.io/webidl/#idl-ByteString
  function ByteString(value) {
    value = String(value);
    if (value.match(/[^\x00-\xFF]/)) throw TypeError('Not a valid ByteString');
    return value;
  }

  // https://heycam.github.io/webidl/#idl-USVString
  function USVString(value) {
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
    return byteLowerCase(a) === byteLowerCase(b);
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
    return /^[!#$%&'*+\-.0-9A-Z^_`a-z|~]+$/.test(s);
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
  // 5.2 Body mixin
  //

  function Body(_stream) {
    // TODO: Handle initialization from other types
    this._stream = _stream;
    this.bodyUsed = false;
  }

  // interface FetchBodyStream
  Body.prototype = {
    // Promise<ArrayBuffer> arrayBuffer();
    arrayBuffer: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof ArrayBuffer) return Promise.resolve(this._stream);
      var value = this._stream;
      return new Promise(function(resolve, reject) {
        var octets = unescape(encodeURIComponent(value)).split('').map(function(c) {
          return c.charCodeAt(0);
        });
        resolve(new Uint8Array(octets).buffer);
      });
    },
    // Promise<Blob> blob();
    blob: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof Blob) return Promise.resolve(this._stream);
      return Promise.resolve(new Blob([this._stream]));
    },
    // Promise<FormData> formData();
    formData: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      if (this._stream instanceof FormData) return Promise.resolve(this._stream);
      return Promise.reject(Error('Not yet implemented'));
    },
    // Promise<JSON> json();
    json: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      var that = this;
      return new Promise(function(resolve, reject) {
        resolve(JSON.parse(that._stream));
      });
    },
    // Promise<USVString> text();
    text: function() {
      if (this.bodyUsed) return Promise.reject(TypeError());
      this.bodyUsed = true;
      return Promise.resolve(String(this._stream));
    }
  };

  //
  // 5.3 Request class
  //

  // typedef (Request or USVString) RequestInfo;

  // Constructor(RequestInfo input, optional RequestInit init)
  function Request(input, init) {
    if (arguments.length < 1) throw TypeError('Not enough arguments');

    Body.call(this, null);

    // readonly attribute ByteString method;
    this.method = 'GET';

    // readonly attribute USVString url;
    this.url = '';

    // readonly attribute Headers headers;
    this.headers = new Headers();
    this.headers._guard = 'request';

    // readonly attribute DOMString referrer;
    this.referrer = null; // TODO: Implement.

    // readonly attribute RequestMode mode;
    this.mode = null; // TODO: Implement.

    // readonly attribute RequestCredentials credentials;
    this.credentials = 'omit';

    if (input instanceof Request) {
      if (input.bodyUsed) throw TypeError();
      input.bodyUsed = true;
      this.method = input.method;
      this.url = input.url;
      this.headers = new Headers(input.headers);
      this.headers._guard = input.headers._guard;
      this.credentials = input.credentials;
      this._stream = input._stream;
    } else {
      input = USVString(input);
      this.url = String(new URL(input, self.location));
    }

    init = Object(init);

    if ('method' in init) {
      var method = ByteString(init.method);
      if (isForbiddenMethod(method)) throw TypeError();
      this.method = normalizeMethod(method);
    }

    if ('headers' in init) {
      this.headers = new Headers();
      fill(this.headers, init.headers);
    }

    if ('body' in init)
      this._stream = init.body;

    if ('credentials' in init &&
        (['omit', 'same-origin', 'include'].indexOf(init.credentials) !== -1))
      this.credentials = init.credentials;
  }

  // interface Request
  Request.prototype = Body.prototype;

  //
  // 5.4 Response class
  //

  // Constructor(optional FetchBodyInit body, optional ResponseInit init)
  function Response(body, init) {
    if (arguments.length < 1)
      body = '';

    this.headers = new Headers();
    this.headers._guard = 'response';

    // Internal
    if (body instanceof XMLHttpRequest && '_url' in body) {
      var xhr = body;
      this.type = 'basic'; // TODO: ResponseType
      this.url = USVString(xhr._url);
      this.status = xhr.status;
      this.ok = 200 <= this.status && this.status <= 299;
      this.statusText = xhr.statusText;
      xhr.getAllResponseHeaders()
        .split(/\r?\n/)
        .filter(function(header) { return header.length; })
        .forEach(function(header) {
          var i = header.indexOf(':');
          this.headers.append(header.substring(0, i), header.substring(i + 2));
        }, this);
      Body.call(this, xhr.responseText);
      return;
    }

    Body.call(this, body);

    init = Object(init) || {};

    // readonly attribute USVString url;
    this.url = '';

    // readonly attribute unsigned short status;
    var status = 'status' in init ? ushort(init.status) : 200;
    if (status < 200 || status > 599) throw RangeError();
    this.status = status;

    // readonly attribute boolean ok;
    this.ok = 200 <= this.status && this.status <= 299;

    // readonly attribute ByteString statusText;
    var statusText = 'statusText' in init ? String(init.statusText) : 'OK';
    if (/[^\x00-\xFF]/.test(statusText)) throw TypeError();
    this.statusText = statusText;

    // readonly attribute Headers headers;
    if ('headers' in init) fill(this.headers, init);

    // TODO: Implement these
    // readonly attribute ResponseType type;
    this.type = 'basic'; // TODO: ResponseType
  }

  // interface Response
  Response.prototype = Body.prototype;

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

      try { xhr.open(r.method, r.url, async); } catch (e) { throw TypeError(e.message); }

      for (var iter = r.headers[Symbol.iterator](), step = iter.next();
           !step.done; step = iter.next())
        xhr.setRequestHeader(step.value[0], step.value[1]);

      if (r.credentials === 'include')
        xhr.withCredentials = true;

      xhr.onreadystatechange = function() {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status === 0)
          reject(new TypeError('Network error'));
        else
          resolve(new Response(xhr));
      };

      xhr.send(r._stream);
    });
  }

  // Exported
  if (!('fetch' in global)) {
    global.Headers = Headers;
    global.Request = Request;
    global.Response = Response;
    global.fetch = fetch;
  }

}(self));
