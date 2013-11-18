//----------------------------------------------------------------------
//
// Browser Polyfills
//
// This assumes ES5 or ES3 + es5.js
//
//----------------------------------------------------------------------

if ('window' in this && 'document' in this) {

  //----------------------------------------------------------------------
  //
  // Web Standards Polyfills
  //
  //----------------------------------------------------------------------

  //
  // document.head (HTML5)
  //
  document.head = document.head || document.getElementsByTagName('head')[0];

  //
  // XMLHttpRequest (http://www.w3.org/TR/XMLHttpRequest/)
  //
  window.XMLHttpRequest = window.XMLHttpRequest || function () {
    /*global ActiveXObject*/
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) { }
    throw new Error("This browser does not support XMLHttpRequest.");
  };
  XMLHttpRequest.UNSENT = 0;
  XMLHttpRequest.OPENED = 1;
  XMLHttpRequest.HEADERS_RECEIVED = 2;
  XMLHttpRequest.LOADING = 3;
  XMLHttpRequest.DONE = 4;

  //----------------------------------------------------------------------
  //
  // Performance
  //
  //----------------------------------------------------------------------

  // requestAnimationFrame
  // http://www.w3.org/TR/animation-timing/
  (function() {
    var TARGET_FPS = 60,
        requests = Object.create(null),
        raf_handle = 1,
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
        if (!request.element || isVisible(request.element)) {
          request.callback(Date.now());
        }
      });
    }

    function requestAnimationFrame(callback, element) {
      var cb_handle = raf_handle++;
      requests[cb_handle] = {callback: callback, element: element};

      if (timeout_handle === -1) {
        timeout_handle = window.setTimeout(onFrameTimer, 1000 / TARGET_FPS);
      }

      return cb_handle;
    }

    function cancelAnimationFrame(handle) {
      delete requests[handle];

      if (Object.keys(requests).length === 0) {
        window.clearTimeout(timeout_handle);
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
    window.cancelAnimationFrame = window.cancelRequestAnimationFrame =
      window.cancelAnimationFrame || window.cancelRequestAnimationFrame ||
      window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame ||
      window.mozCancelAnimationFrame || window.mozCancelRequestAnimationFrame ||
      window.oCancelAnimationFrame || window.oCancelRequestAnimationFrame ||
      window.msCancelAnimationFrame || window.msCancelRequestAnimationFrame ||
      cancelAnimationFrame;
  }());

  // setImmediate
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
  (function () {
    function setImmediate(callback, args) {
      var params = [].slice.call(arguments, 1), i;
      return window.setTimeout(function() {
        callback.apply(null, params);
      }, 0);
    }

    function clearImmediate(handle) {
      window.clearTimeout(handle);
    }

    window.setImmediate =
      window.setImmediate ||
      window.msSetImmediate ||
      setImmediate;

    window.clearImmediate =
      window.clearImmediate ||
      window.msClearImmediate ||
      clearImmediate;
  } ());

  //----------------------------------------------------------------------
  //
  // DOM
  //
  //----------------------------------------------------------------------

  //
  // Selectors API Level 1 (http://www.w3.org/TR/selectors-api/)
  // http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed
  //
  if (!document.querySelectorAll) {
    document.querySelectorAll = function (selectors) {
      var style = document.createElement('style'), elements = [], element;
      document.documentElement.firstChild.appendChild(style);
      document._qsa = [];

      style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
      window.scrollBy(0, 0);
      style.parentNode.removeChild(style);

      while (document._qsa.length) {
        element = document._qsa.shift();
        element.style.removeAttribute('x-qsa');
        elements.push(element);
      }
      document._qsa = null;
      return elements;
    };
  }

  if (!document.querySelector) {
    document.querySelector = function (selectors) {
      var elements = document.querySelectorAll(selectors);
      return (elements.length) ? elements[0] : null;
    };
  }

  if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (classNames) {
      classNames = String(classNames).replace(/^|\s+/g, '.');
      return document.querySelectorAll(classNames);
    };
  }

  // Fix for IE8-'s Element.getBoundingClientRect()
  if ('TextRectangle' in this && !('width' in TextRectangle.prototype)) {
    Object.defineProperties(TextRectangle.prototype, {
      'width': { get: function() { return this.right - this.left; } },
      'height': { get: function() { return this.bottom - this.top; } }
    });
  }

  //
  // DOM Enumerations (http://www.w3.org/TR/DOM-Level-2-Core/)
  //
  window.Node = window.Node || function Node() { throw new TypeError("Illegal constructor"); };
  Node.ELEMENT_NODE = 1;
  Node.ATTRIBUTE_NODE = 2;
  Node.TEXT_NODE = 3;
  Node.CDATA_SECTION_NODE = 4;
  Node.ENTITY_REFERENCE_NODE = 5;
  Node.ENTITY_NODE = 6;
  Node.PROCESSING_INSTRUCTION_NODE = 7;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9;
  Node.DOCUMENT_TYPE_NODE = 10;
  Node.DOCUMENT_FRAGMENT_NODE = 11;
  Node.NOTATION_NODE = 12;

  window.DOMException = window.DOMException || function DOMException() { throw new TypeError("Illegal constructor"); };
  DOMException.INDEX_SIZE_ERR = 1;
  DOMException.DOMSTRING_SIZE_ERR = 2;
  DOMException.HIERARCHY_REQUEST_ERR = 3;
  DOMException.WRONG_DOCUMENT_ERR = 4;
  DOMException.INVALID_CHARACTER_ERR = 5;
  DOMException.NO_DATA_ALLOWED_ERR = 6;
  DOMException.NO_MODIFICATION_ALLOWED_ERR = 7;
  DOMException.NOT_FOUND_ERR = 8;
  DOMException.NOT_SUPPORTED_ERR = 9;
  DOMException.INUSE_ATTRIBUTE_ERR = 10;
  DOMException.INVALID_STATE_ERR = 11;
  DOMException.SYNTAX_ERR = 12;
  DOMException.INVALID_MODIFICATION_ERR = 13;
  DOMException.NAMESPACE_ERR = 14;
  DOMException.INVALID_ACCESS_ERR = 15;

  //
  // Events and EventTargets
  //

  (function(){
    if (!('Element' in window) || Element.prototype.addEventListener || !Object.defineProperty)
      return;

    // interface Event

    // PhaseType (const unsigned short)
    Event.CAPTURING_PHASE = 1;
    Event.AT_TARGET       = 2;
    Event.BUBBLING_PHASE  = 3;

    Object.defineProperty(Event.prototype, 'CAPTURING_PHASE', { get: function() { return 1; } });
    Object.defineProperty(Event.prototype, 'AT_TARGET',       { get: function() { return 2; } });
    Object.defineProperty(Event.prototype, 'BUBBLING_HASE',   { get: function() { return 3; } });

    Object.defineProperty(Event.prototype, 'target', {
      get: function() {
        return this.srcElement;
      }
    });

    Object.defineProperty(Event.prototype, 'currentTarget', {
      get: function() {
        return this._currentTarget;
      }
    });

    Object.defineProperty(Event.prototype, 'eventPhase', {
      get: function() {
        return (this.srcElement === this.currentTarget) ? Event.AT_TARGET : Event.BUBBLING_PHASE;
      }
    });

    Object.defineProperty(Event.prototype, 'bubbles', {
      get: function() {
        switch (this.type) {
          // Mouse
        case 'click':
        case 'dblclick':
        case 'mousedown':
        case 'mouseup':
        case 'mouseover':
        case 'mousemove':
        case 'mouseout':
        case 'mousewheel':
          // Keyboard
        case 'keydown':
        case 'keypress':
        case 'keyup':
          // Frame/Object
        case 'resize':
        case 'scroll':
          // Form
        case 'select':
        case 'change':
        case 'submit':
        case 'reset':
          return true;
        }
        return false;
      }
    });

    Object.defineProperty(Event.prototype, 'cancelable', {
      get: function() {
        switch (this.type) {
          // Mouse
        case 'click':
        case 'dblclick':
        case 'mousedown':
        case 'mouseup':
        case 'mouseover':
        case 'mouseout':
        case 'mousewheel':
          // Keyboard
        case 'keydown':
        case 'keypress':
        case 'keyup':
          // Form
        case 'submit':
          return true;
        }
        return false;
      }
    });

    Object.defineProperty(Event.prototype, 'timeStamp', {
      get: function() {
        return this._timeStamp;
      }
    });

    Event.prototype.stopPropagation = function() {
      this.cancelBubble = true;
    };

    Event.prototype.preventDefault = function() {
      this.returnValue = false;
    };

    Object.defineProperty(Event.prototype, 'defaultPrevented', {
      get: function() {
        return this.returnValue === false;
      }
    });


    // interface EventTarget

    function addEventListener(type, listener, useCapture) {
      if (type === 'DOMContentLoaded') type = 'load';
      var target = this;
      var f = function(e) {
        e._timeStamp = Number(new Date);
        e._currentTarget = target;
        listener.call(this, e);
        e._currentTarget = null;
      };
      this['_' + type + listener] = f;
      this.attachEvent('on' + type, f);
    }

    function removeEventListener(type, listener, useCapture) {
      if (type === 'DOMContentLoaded') type = 'load';
      var f = this['_' + type + listener];
      if (f) {
        this.detachEvent('on' + type, f);
        this['_' + type + listener] = null;
      }
    }

    var p1 = Window.prototype, p2 = HTMLDocument.prototype, p3 = Element.prototype;
    p1.addEventListener    = p2.addEventListener    = p3.addEventListener    = addEventListener;
    p1.removeEventListener = p2.removeEventListener = p3.removeEventListener = removeEventListener;

  }());

  // Shim for DOM Events for IE7-
  // http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html
  // Use addEvent(object, event, handler) instead of object.addEventListener(event, handler)

  window.addEvent = function (obj, type, fn) {
    if (obj.addEventListener) {
      obj.addEventListener(type, fn, false);
    } else if (obj.attachEvent) {
      obj["e" + type + fn] = fn;
      obj[type + fn] = function () {
        var e = window.event;
        e.currentTarget = obj;
        e.preventDefault = function () { e.returnValue = false; };
        e.stopPropagation = function () { e.cancelBubble = true; };
        e.target = e.srcElement;
        e.timeStamp = Number(new Date);
        obj["e" + type + fn].call(this, e);
      };
      obj.attachEvent("on" + type, obj[type + fn]);
    }
  };

  window.removeEvent = function (obj, type, fn) {
    if (obj.removeEventListener) {
      obj.removeEventListener(type, fn, false);
    } else if (obj.detachEvent) {
      obj.detachEvent("on" + type, obj[type + fn]);
      obj[type + fn] = null;
      obj["e" + type + fn] = null;
    }
  };

  //----------------------------------------------------------------------
  //
  // DOMTokenList - classList and relList shims
  //
  //----------------------------------------------------------------------

  // Shim for http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#dom-classlist
  // Use getClassList(elem) instead of elem.classList() if IE7- support is needed
  // Use getRelList(elem) instead of elem.relList() if IE7- support is needed

  (function () {

    /** @constructor */
    function DOMTokenListShim(o, p) {
      function split(s) { return s.length ? s.split(/\s+/g) : []; }

      // NOTE: This does not exactly match the spec.
      function removeTokenFromString(token, string) {
        var tokens = split(string),
            index = tokens.indexOf(token);
        if (index !== -1) {
          tokens.splice(index, 1);
        }
        return tokens.join(' ');
      }

      Object.defineProperties(
        this,
        {
          length: {
            get: function () { return split(o[p]).length; }
          },

          item: {
            value: function (idx) {
              var tokens = split(o[p]);
              return 0 <= idx && idx < tokens.length ? tokens[idx] : null;
            }
          },

          contains: {
            value: function (token) {
              token = String(token);
              if (token.length === 0) { throw new SyntaxError(); }
              if (/\s/.test(token)) { throw new Error("InvalidCharacterError"); }
              var tokens = split(o[p]);

              return tokens.indexOf(token) !== -1;
            }
          },

          add: {
            value: function (tokens___) {
              tokens = Array.prototype.slice.call(arguments).map(String);
              if (tokens.some(function(token) { return token.length === 0; })) {
                throw new SyntaxError();
              }
              if (tokens.some(function(token) { return /\s/.test(token); })) {
                throw new Error("InvalidCharacterError");
              }

              try {
                var underlying_string = o[p];
                var token_list = split(underlying_string);
                tokens = tokens.filter(function(token) { return token_list.indexOf(token) === -1; });
                if (tokens.length === 0) {
                  return;
                }
                if (underlying_string.length !== 0 && !/\s$/.test(underlying_string)) {
                  underlying_string += ' ';
                }
                underlying_string += tokens.join(' ');
                o[p] = underlying_string;
              } finally {
                var length = split(o[p]).length;
                if (this.length !== length) { this.length = length; }
              }
            }
          },

          remove: {
            value: function (tokens___) {
              tokens = Array.prototype.slice.call(arguments).map(String);
              if (tokens.some(function(token) { return token.length === 0; })) {
                throw new SyntaxError();
              }
              if (tokens.some(function(token) { return /\s/.test(token); })) {
                throw new Error("InvalidCharacterError");
              }

              try {
                var underlying_string = o[p];
                tokens.forEach(function(token) {
                  underlying_string = removeTokenFromString(token, underlying_string);
                });
                o[p] = underlying_string;
              } finally {
                var length = split(o[p]).length;
                if (this.length !== length) { this.length = length; }
              }
            }
          },

          toggle: {
            value: function (token, force) {
              try {
                token = String(token);
                if (token.length === 0) { throw new SyntaxError(); }
                if (/\s/.test(token)) { throw new Error("InvalidCharacterError"); }
                var tokens = split(o[p]),
                    index = tokens.indexOf(token);

                if (index !== -1 && (!force || force === (void 0))) {
                  o[p] = removeTokenFromString(token, o[p]);
                  return false;
                }
                if (index !== -1 && force) {
                  return true;
                }
                var underlying_string = o[p];
                if (underlying_string.length !== 0 && !/\s$/.test(underlying_string)) {
                  underlying_string += ' ';
                }
                underlying_string += token;
                o[p] = underlying_string;
                return true;
              } finally {
                var length = split(o[p]).length;
                if (this.length !== length) { this.length = length; }
              }
            }
          },

          toString: {
            value: function () {
              return o[p];
            }
          }
        });
      if (!('length' in this)) {
        // In case getters are not supported
        this.length = split(o[p]).length;
      } else {
        // If they are, shim in index getters (up to 100)
        for (var i = 0; i < 100; ++i) {
          Object.defineProperty(this, String(i), {
            get: (function(n) { return function () { return this.item(n); }; }(i))
          });
        }
      }
    }

    function addToElementPrototype(p, f) {
      if ('Element' in window && Element.prototype && Object.defineProperty) {
        Object.defineProperty(Element.prototype, p, { get: f });
      }
    }

    if ('classList' in document.createElement('span')) {
      window.getClassList = function (elem) { return elem.classList; };
    } else {
      window.getClassList = function (elem) { return new DOMTokenListShim(elem, 'className'); };
      addToElementPrototype('classList', function() { return new DOMTokenListShim(this, 'className'); } );
    }

    if ('relList' in document.createElement('link')) {
      window.getRelList = function (elem) { return elem.relList; };
    } else {
      window.getRelList = function (elem) { return new DOMTokenListShim(elem, 'rel'); };
      addToElementPrototype('relList', function() { return new DOMTokenListShim(this, 'rel'); } );
    }
  }());

  if (!('dataset' in document.createElement('span')) &&
      'Element' in window && Element.prototype && Object.defineProperty) {
    Object.defineProperty(Element.prototype, 'dataset', { get: function() {
      var result = Object.create(null);
      for (var i = 0; i < this.attributes.length; ++i) {
        var attr = this.attributes[i];
        if (attr.specified && attr.name.substring(0, 5) === 'data-') {
          (function(element, name) {
            Object.defineProperty(result, name, {
              get: function() {
                return element.getAttribute('data-' + name);
              },
              set: function(value) {
                element.setAttribute('data-' + name, value);
              }});
          }(this, attr.name.substring(5)));
        }
      }
        return result;
    }});
  }
}

//
// Base64 utility methods (HTML5)
//
(function (global) {
  var B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  global.atob = global.atob || function (input) {
    input = String(input);
    var position = 0,
        output = [],
        buffer = 0, bits = 0, n;

    input = input.replace(/\s/g, '');
    if ((input.length % 4) === 0) { input = input.replace(/=+$/, ''); }
    if ((input.length % 4) === 1) { throw new Error("InvalidCharacterError"); }
    if (/[^+/0-9A-Za-z]/.test(input)) { throw new Error("InvalidCharacterError"); }

    while (position < input.length) {
      n = B64_ALPHABET.indexOf(input.charAt(position));
      buffer = (buffer << 6) | n;
      bits += 6;

      if (bits === 24) {
        output.push(String.fromCharCode((buffer >> 16) & 0xFF));
        output.push(String.fromCharCode((buffer >>  8) & 0xFF));
        output.push(String.fromCharCode(buffer & 0xFF));
        bits = 0;
        buffer = 0;
      }
      position += 1;
    }

    if (bits === 12) {
      buffer = buffer >> 4;
      output.push(String.fromCharCode(buffer & 0xFF));
    } else if (bits === 18) {
      buffer = buffer >> 2;
      output.push(String.fromCharCode((buffer >> 8) & 0xFF));
      output.push(String.fromCharCode(buffer & 0xFF));
    }

    return output.join('');
  };

  global.btoa = global.btoa || function (input) {
    input = String(input);
    var position = 0,
        out = [],
        o1, o2, o3,
        e1, e2, e3, e4;

    if (/[^\x00-\xFF]/.test(input)) { throw new Error("InvalidCharacterError"); }

    while (position < input.length) {
      o1 = input.charCodeAt(position++);
      o2 = input.charCodeAt(position++);
      o3 = input.charCodeAt(position++);

      // 111111 112222 222233 333333
      e1 = o1 >> 2;
      e2 = ((o1 & 0x3) << 4) | (o2 >> 4);
      e3 = ((o2 & 0xf) << 2) | (o3 >> 6);
      e4 = o3 & 0x3f;

      if (position === input.length + 2) {
        e3 = 64; e4 = 64;
      }
      else if (position === input.length + 1) {
        e4 = 64;
      }

      out.push(B64_ALPHABET.charAt(e1),
               B64_ALPHABET.charAt(e2),
               B64_ALPHABET.charAt(e3),
               B64_ALPHABET.charAt(e4));
    }

    return out.join('');
  };
} (this));


//----------------------------------------------------------------------
//
// Non-standard JavaScript (Mozilla) functions
//
//----------------------------------------------------------------------

(function () {
  // JavaScript 1.8.1
  String.prototype.trimLeft = String.prototype.trimLeft || function () {
    return String(this).replace(/^\s+/, '');
  };

  // JavaScript 1.8.1
  String.prototype.trimRight = String.prototype.trimRight || function () {
    return String(this).replace(/\s+$/, '');
  };

  // JavaScript 1.?
  var ESCAPES = {
    //'\x00': '\\0', Special case in FF3.6, removed by FF10
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };
  String.prototype.quote = String.prototype.quote || function() {
    return '"' + String(this).replace(/[\x00-\x1F"\\\x7F-\uFFFF]/g, function(c) {
      if (Object.prototype.hasOwnProperty.call(ESCAPES, c)) {
        return ESCAPES[c];
      } else if (c.charCodeAt(0) <= 0xFF) {
        return '\\x' + ('00' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-2);
      } else {
        return '\\u' + ('0000' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
      }
    }) + '"';
  };
}());
