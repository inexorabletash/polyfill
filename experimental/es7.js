//----------------------------------------------------------------------
//
// ECMAScript "Harmony" Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  "use strict";
  var undefined = (void 0); // Paranoia

  // Helpers

  function assert(c, m) {
    if (!c) throw Error("Internal assertion failure" + (m ? ': ' + m : ''));
  }

  function strict(o) {
    return o === global ? undefined : o;
  }

  function hook(o, p, f) {
    var op = o[p];
    assert(typeof op === 'function', 'Hooking a non-function');
    o[p] = function() {
      var o = strict(this);
      var r = f.apply(o, arguments);
      return r !== undefined ? r : op.apply(o, arguments);
    };
  }

  function define(o, p, v, override) {
    if (p in o && !override)
      return;

    if (typeof v === 'function') {
      // Sanity check that functions are appropriately named (where possible)
      assert((global.Symbol && p instanceof global.Symbol) || !('name' in v) || v.name === p || v.name === p + '_', 'Expected function name "' + p + '", was "' + v.name + '"');
      Object.defineProperty(o, p, {
        value: v,
        configurable: true,
        enumerable: false,
        writable: true
      });
    } else {
      Object.defineProperty(o, p, {
        value: v,
        configurable: false,
        enumerable: false,
        writable: false
      });
    }
  }

  function set_internal(o, p, v) {
    Object.defineProperty(o, p, {
      value: v,
      configurable: false,
      enumerable: false,
      writable: true
    });
  }

  // Snapshot intrinsic functions
  var $isNaN = global.isNaN,
      $isFinite = global.isFinite,
      $parseInt = global.parseInt,
      $parseFloat = global.parseFloat;

   var E = Math.E,
      LOG10E = Math.LOG10E,
      LOG2E = Math.LOG2E,
      abs = Math.abs,
      ceil = Math.ceil,
      exp = Math.exp,
      floor = Math.floor,
      log = Math.log,
      max = Math.max,
      min = Math.min,
      pow = Math.pow,
      sqrt = Math.sqrt;

  var empty = Object.create(null);

  //----------------------------------------
  // 6 ECMAScript Data Types and Values
  //----------------------------------------

  // "Type(x)" is used as shorthand for "the type of x"...
  function Type(v) {
    switch (typeof v) {
    case 'undefined': return 'undefined';
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'string': return 'string';
    default:
      if (v === null) return 'null';
      if (v instanceof global.Symbol) return 'symbol';
      return 'object';
    }
  }

  // 6.1.7.4 Well-Known Symbols and Intrinsics
  var $$iterator = global.Symbol.iterator,
      $$toStringTag = global.Symbol.toStringTag;

  //----------------------------------------
  // 7 Abstract Operations
  //----------------------------------------

  // 7.1.4
  function ToInteger(n) {
    n = Number(n);
    if ($isNaN(n)) return 0;
    if (n === 0 || n === Infinity || n === -Infinity) return n;
    return ((n < 0) ? -1 : 1) * floor(abs(n));
  }

  // 7.1.6
  function ToUint32(v) { return v >>> 0; }

  // 7.1.13 ToObject
  function ToObject(v) {
    if (v === null || v === undefined) throw TypeError();
    return Object(v);
  }

  // 7.1.15 ToLength ( argument )
  function ToLength(v) {
    var len = ToInteger(v);
    if (len <= 0) {
      return 0;
    }
    return min(len, 0x20000000000000 - 1); // 2^53-1
  }

  //----------------------------------------
  // 7.2 Testing and Comparison Operations
  //----------------------------------------

  // 7.2.3
  var SameValue = Object.is;

  //----------------------------------------
  // 9 ECMAScript Ordinary and Exotic Objects Behaviors
  //----------------------------------------

  // 9.1.13 ObjectCreate(proto, internalDataList)
  function ObjectCreate(proto, internalDataList) {
    return Object.create(proto, internalDataList);
  }


  //----------------------------------------------------------------------
  //
  // ECMAScript 7 Strawman Proposals
  //
  //----------------------------------------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_compare
  define(
    Number, 'compare',
    function compare(first, second, tolerance) {
      var difference = first - second;
      return abs(difference) <= (tolerance || 0) ? 0 : difference < 0 ? -1 : 1;
    });

  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  define(
    Object, 'getPropertyDescriptor',
    function getPropertyDescriptor(o, p) {
      do {
        var desc = Object.getOwnPropertyDescriptor(o, p);
        if (desc) {
          return desc;
        }
        o = Object.getPrototypeOf(o);
      } while (o);
      return undefined;
    });

  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  define(
    Object, 'getPropertyNames',
    function getPropertyNames(o) {
      var names = ObjectCreate(null);
      do {
        Object.getOwnPropertyNames(o).forEach(function(name) {
          names[name] = true;
        });
        o = Object.getPrototypeOf(o);
      } while (o);
      return Object.keys(names);
    });

  // https://gist.github.com/WebReflection/9353781
  define(
    Object, 'getOwnPropertyDescriptors',
    function getOwnPropertyDescriptors(o) {
      var obj = ToObject(o);
      var keys = Object.getOwnPropertyNames(obj);
      var descriptors = {};
      for (var i = 0; i < keys.length; ++i) {
        var nextKey = keys[i];
        var desc = Object.getOwnPropertyDescriptor(obj, nextKey);
        descriptors[nextKey] = desc;
      }
      return descriptors;
    });

  // http://wiki.ecmascript.org/doku.php?id=strawman:array.prototype.pushall
  define(
    Array.prototype, 'pushAll',
    function pushAll(other, start, end) {
      other = ToObject(other);
      if (start === undefined) {
        start = 0;
      }
      start = ToUint32(start);
      var otherLength = ToUint32(other.length);
      if (end === undefined) {
        end = otherLength;
      }
      end = ToUint32(end);
      var self = ToObject(this);
      var length = ToUint32(self.length);
      for (var i = 0, j = length; i < end; i++, j++) {
        self[j] = other[i];
      }
      self.length = j;
      return;
    });

  // https://github.com/domenic/Array.prototype.contains/
  // TC39 2014-11 renamed to 'includes'
  define(
    Array.prototype, 'includes',
    function includes(target) {
      var fromIndex = arguments[1];

      var o = ToObject(this);
      var lenValue = o["length"];
      var len = ToLength(lenValue);
      if (len === 0) return false;
      var n = (fromIndex !== undefined) ? ToInteger(fromIndex) : 0;
      if (n >= len) return false;
      if (n >= 0) {
        var k = n;
      } else {
        k = len - abs(n);
        if (k < 0) k = 0;
      }
      while (k < len) {
        // eval('0 in [undefined]') == false in IE8-
        if (/*i in t &&*/ SameValue(o[k], target)) {
          return true;
        }
        k += 1;
      }
      return false;
    });

  define(
    Object, 'values',
    function values(o) {
      return Object.keys(o).map(function(p) { return o[p]; });
    });

  define(
    Object, 'entries',
    function entries(o) {
      return Object.keys(o).map(function(p) { return [p, o[p]]; });
    });

  // http://esdiscuss.org/topic/regexp-escape
  define(
    RegExp, 'escape',
    function escape(s) {
      return String(s).replace(/[^a-zA-Z0-9]/g, '\\$&');
    });

  // http://wiki.ecmascript.org/doku.php?id=strawman:string_at
  define(
    String.prototype, 'at',
    function at(pos) {
      var s = String(this);
      var position = ToInteger(pos);
      var size = s.length;
      if (position < 0 || position >= size) return "";
      var first = s.charAt(position);
      var cuFirst = first.charCodeAt(0);
      if (cuFirst < 0xD800 || cuFirst > 0xDBFF || position + 1 === size) return first;
      var cuSecond = s.charCodeAt(position + 1);
      if (cuSecond < 0xDC00 || cuSecond > 0xDFFF) return first;
      var second = s.charAt(position + 1);
      var cp = (first - 0xD800) * 0x400 + (second - 0xDC00) + 0x10000;
      return String.fromCharCode(cuFirst, cuSecond);
    });

  // http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
  define(
    String.prototype, 'lpad',
    function lpad() {
      var minLength = arguments[0];
      var fillStr = arguments[1];

      var s = String(this);
      if (minLength === undefined) return s; // NOTE: Wiki is bogus here
      var intMinLength = ToInteger(minLength);
      var fillLen = intMinLength - s.length; // NOTE: Wiki is bogus here
      if (fillLen < 0) throw RangeError();
      if (fillLen === Infinity) throw RangeError();
      var sFillStr = String(fillStr);
      if (fillStr === undefined) sFillStr = ' '; // NOTE: Wiki is bogus here
      var sFillVal = '';
      while (sFillVal.length < fillLen) sFillVal += sFillStr;
      return sFillVal + s;
    });

  // http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
  define(
    String.prototype, 'rpad',
    function rpad() {
      var minLength = arguments[0];
      var fillStr = arguments[1];

      var s = String(this);
      if (minLength === undefined) return s; // NOTE: Wiki is bogus here
      var intMinLength = ToInteger(minLength);
      var fillLen = intMinLength - s.length; // NOTE: Wiki is bogus here
      if (fillLen < 0) throw RangeError();
      if (fillLen === Infinity) throw RangeError();
      var sFillStr = String(fillStr);
      if (fillStr === undefined) sFillStr = ' '; // NOTE: Wiki is bogus here
      var sFillVal = '';
      while (sFillVal.length < fillLen) sFillVal += sFillStr;
      return s + sFillVal;
    });

  var MIN_NORMALIZED_F32 = Math.pow(2,-126);
  var MIN_NORMALIZED_F64 = Math.pow(2,-1022);

  define(
    Math, 'denormz',
    function denormz(x) {
      if (x > 0 && x < MIN_NORMALIZED_F64) return 0;
      if (x < 0 && x > -MIN_NORMALIZED_F64) return -0;
      return x;
    });

  define(
    Math, 'fdenormz',
    function fdenormz(x) {
      if (x > 0 && x < MIN_NORMALIZED_F32) return 0;
      if (x < 0 && x > -MIN_NORMALIZED_F32) return -0;
      return x;
    });

  // Inspired by Hacker's Delight - http://hackersdelight.org

  define(
    Math, 'imulh',
    function imulh(u, v) {
      var u0 = u & 0xFFFF, u1 = u >> 16;
      var v0 = v & 0xFFFF, v1 = v >> 16;
      var w0 = u0 * v0;
      var t = ((u1 * v0) >>> 0) + (w0 >>> 16);
      var w1 = t & 0xFFFF;
      var w2 = t >> 16;
      w1 = ((u0 * v1) >>> 0) + w1;
      return u1 * v1 + w2 + (w1 >> 16);
    });

  define(
    Math, 'umulh',
    function umulh(u, v) {
      var u0 = u & 0xFFFF, u1 = u >>> 16;
      var v0 = v & 0xFFFF, v1 = v >>> 16;
      var w0 = u0 * v0;
      var t = ((u1 * v0) >>> 0) + (w0 >>> 16);
      var w1 = t & 0xFFFF;
      var w2 = t >>> 16;
      w1 = ((u0 * v1) >>> 0) + w1;
      return u1 * v1 + w2 + (w1 >>> 16);
    });

  define(
    Math, 'iaddh',
    function iaddh(x0, x1, y0, y1) {
      x0 = x0 >>> 0; x1 = x1 >>> 0; y0 = y0 >>> 0; y1 = y1 >>> 0;
      var z0 = (x0 + y0) >>> 0;
      var c = ((x0 & y0) | (x0 | y0) & ~z0) >>> 31;
      var z1 = x1 + y1 + c;
      return z1 | 0;
    });

  define(
    Math, 'isubh',
    function isubh(x0, x1, y0, y1) {
      x0 = x0 >>> 0; x1 = x1 >>> 0; y0 = y0 >>> 0; y1 = y1 >>> 0;
      var z0 = (x0 - y0) >>> 0;
      var b = ((~x0 & y0) | (~(x0 ^ y0) & z0)) >>> 31;
      var z1 = x1 - y1 - b;
      return z1 | 0;
    });

}(this));
