//----------------------------------------------------------------------
//
// Proposed ECMAScript Feature Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  'use strict';
  var undefined = (void 0); // Paranoia

  // Helpers

  function strict(o) {
    return o === global ? undefined : o;
  }

  function isSymbol(s) {
    return (typeof s === 'symbol') || ('Symbol' in global && s instanceof global.Symbol);
  }

  function define(o, p, v, override) {
    if (p in o && !override)
      return;

    if (typeof v === 'function') {
      // Sanity check that functions are appropriately named (where possible)
      console.assert(isSymbol(p) || !('name' in v) || v.name === p || v.name === p + '_', 'Expected function name "' + p.toString() + '", was "' + v.name + '"');
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

  // Snapshot intrinsic functions
  var $isNaN = global.isNaN;

  var abs = Math.abs,
      floor = Math.floor,
      max = Math.max,
      min = Math.min;

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
    return Object.create(proto);
  }


  //----------------------------------------------------------------------
  //
  // ECMAScript Proposals
  //
  //----------------------------------------------------------------------


  //----------------------------------------------------------------------
  // Stage 3
  //----------------------------------------------------------------------

  // https://github.com/tc39/proposal-global
  if (!('global' in global)) {
    Object.defineProperty(global, 'global', {
      value: global,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }

  //----------------------------------------------------------------------
  // Stage 2
  //----------------------------------------------------------------------

  // https://github.com/sebmarkbage/ecmascript-string-left-right-trim
  define(
    String.prototype, 'trimLeft',
    function trimLeft() {
      return String(this).replace(/^\s+/, '');
    });
  define(
    String.prototype, 'trimStart',
    function trimStart() {
      return String(this).replace(/^\s+/, '');
    });

  // https://github.com/sebmarkbage/ecmascript-string-left-right-trim
  define(
    String.prototype, 'trimRight',
    function trimRight() {
      return String(this).replace(/\s+$/, '');
    });
  define(
    String.prototype, 'trimEnd',
    function trimEnd() {
      return String(this).replace(/\s+$/, '');
    });

  // https://github.com/tc39/proposal-promise-finally
  define(
    Promise.prototype, 'finally',
    function finally_(func) {
      return this.then(
        function(r) { func(); return r; },
        function(r) { func(); throw r; }
      );
    });

  //----------------------------------------------------------------------
  // Stage 1
  //----------------------------------------------------------------------

  // https://github.com/ljharb/String.prototype.matchAll
  define(
    String.prototype, 'matchAll',
    function matchAll(regexp) {
      var o = strict(this);
      if (!(regexp instanceof RegExp)) throw TypeError();
      var s = String(o);
      var flags = String(regexp['flags']);
      if (flags.indexOf('g') === -1) flags = flags + 'g';
      var rx = new RegExp(regexp.source, flags);
      var lastIndex = ToLength(regexp['lastIndex']);
      rx['lastIndex'] = lastIndex;
      return CreateRegExpStringIterator(rx, s);
    });

  function CreateRegExpStringIterator(regexp, string) {
    var iterator = Object.create($RegExpStringIteratorPrototype$);
    iterator['[[IteratingRegExp]]'] = regexp;
    iterator['[[IteratedString]]'] = string;
    return iterator;
  }

  var $RegExpStringIteratorPrototype$ = Object.create({}); // TODO: %IteratorPrototype%

  define(
    $RegExpStringIteratorPrototype$, 'next',
    function next() {
      var o = strict(this);
      if (Type(o) !== 'object') throw TypeError();
      var regexp = o['[[IteratingRegExp]]'];
      var string = o['[[IteratedString]]'];
      var match = regexp.exec(string);
      if (match === null)
        return {value: null, done: true};
      else
        return {value: match, done: false};
    });

  define($RegExpStringIteratorPrototype$, Symbol.toStringTag, 'RegExp String Iterator');

  // https://github.com/rwaldron/proposal-math-extensions/blob/master/README.md

  define(
    Math, 'clamp',
    function clamp(x, lower, upper) {
      if ($isNaN(x) || $isNaN(lower) || $isNaN(upper))
        return NaN;
      var _max = max(x, lower);
      var _min = min(_max, upper);
      return _min;
    });

  define(
    Math, 'scale',
    function scale(x, inLow, inHigh, outLow, outHigh) {
      if ($isNaN(x) || $isNaN(inLow) || $isNaN(inHigh) || $isNaN(outLow) || $isNaN(outHigh))
        return NaN;
      if (x === Infinity || x === -Infinity)
        return x;
      return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
    });

  define(
    Math, 'radians',
    function radians(degrees) {
      if ($isNaN(degrees) || degrees === Infinity || degrees === -Infinity)
        return degrees;
      var radians = degrees * Math.DEG_PER_RAD;
      return radians;
    });

  define(
    Math, 'degrees',
    function degrees(radians) {
      if ($isNaN(radians) || radians === Infinity || radians === -Infinity)
        return radians;
      var degrees = radians * Math.RAD_PER_DEG;
      return degrees;
    });

  define(Math, 'RAD_PER_DEG', 180 / Math.PI);

  define(Math, 'DEG_PER_RAD', Math.PI / 180);

  // https://github.com/leobalter/proposal-setmap-offrom
  [Map, Set, WeakMap, WeakSet].forEach(function(t) {
    define(t, 'of', function of(/*args...*/) { return new t(arguments); });
    define(t, 'from', function from(iterable) { return new t(iterable); });
  });

  // https://github.com/ljharb/proposal-promise-try
  define(
    Promise, 'try',
    function try_(func) {
      return new Promise(function(resolve) {
        resolve(func());
      });
    });


  //----------------------------------------------------------------------
  // Stage 0
  //----------------------------------------------------------------------

  // https://github.com/mathiasbynens/String.prototype.at
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


  // https://gist.github.com/BrendanEich/4294d5c212a6d2254703

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


  //----------------------------------------------------------------------
  // Obsolete/Abandoned
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


}(this));
