//----------------------------------------------------------------------
//
// ECMAScript "Harmony" Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  "use strict";
  var undefined = (void 0); // Paranoia

  // Helpers

  function assert(c) {
    if (!c) {
      throw new Error("Internal assertion failure");
    }
  }

  function hook(o, p, f) {
    var op = o[p];
    if (typeof op !== 'function') { throw new TypeError('Not a function'); }
    o[p] = function() {
      var r = f.apply(this, arguments);
      return r !== undefined ? r : op.apply(this, arguments);
    };
  }

  function defineFunctionProperty(o, p, f) {
    if (!(p in o)) {
      Object.defineProperty(o, p, {
        value: f,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }

  function defineValueProperty(o, p, c) {
    if (!(p in o)) {
      Object.defineProperty(o, p, {
        value: c,
        configurable: false,
        enumerable: false,
        writable: false
      });
    }
  }



  // Snapshot intrinsic functions
  var global_isNaN = global.isNaN,
      global_isFinite = global.isFinite,
      global_parseInt = global.parseInt,
      global_parseFloat = global.parseFloat;

  var E = Math.E,
      LOG10E = Math.LOG10E,
      LOG2E = Math.LOG2E,
      abs = Math.abs,
      ceil = Math.ceil,
      exp = Math.exp,
      floor = Math.floor,
      log = Math.log,
      pow = Math.pow,
      sqrt = Math.sqrt;

  // These are used for implementing the polyfills, but not exported.
  var abstractOperation = {};

  //----------------------------------------------------------------------
  //
  // ECMAScript 6 Draft
  // http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
  //
  //----------------------------------------------------------------------

  //----------------------------------------
  // 8 Types
  //----------------------------------------

  // shorthand
  function Type(v) { return v === null ? 'null' : typeof v; };

  // 8.1.7.2 Object Internal Methods
  abstractOperation.HasOwnProperty = (function() {
    var ophop = Object.prototype.hasOwnProperty;
    return function (o, p) { return ophop.call(o, p); };
  }());

  // 8.3.14
  abstractOperation.ObjectCreate =  (function() {
    var oc = Object.create;
    return function(p, idl) { return oc(p, idl); };
  }());

  //----------------------------------------
  // 9 Abstract Operations
  //----------------------------------------

  //----------------------------------------
  // 9.2 Type Conversion and Testing
  //----------------------------------------

  // 9.1.2 ToBoolean - just use Boolean()
  // 9.1.3 ToNumber - just use Number()

  // 9.1.4
  abstractOperation.ToInteger = function (n) {
    n = Number(n);
    if (global_isNaN(n)) { return 0; }
    if (n === 0 || n === Infinity || n === -Infinity) { return n; }
    return ((n < 0) ? -1 : 1) * floor(abs(n));
  };

  // 9.1.5
  abstractOperation.ToInt32 = function (v) { return v >> 0; };

  // 9.1.6
  abstractOperation.ToUint32 = function (v) { return v >>> 0; };

  // 9.1.7
  abstractOperation.ToUint16 = function (v) { return (v >>> 0) & 0xFFFF; };

  // 9.1.8 ToString - just use String()
  // 9.1.9 ToObject - just use Object()

  // 9.1.10 ToPropertyKey - TODO: consider for Symbol polyfill

  //----------------------------------------
  // 9.2 Testing and Comparison Operations
  //----------------------------------------

  // 9.2.1 CheckObjectCoercible - TODO: needed?

  // 9.2.2
  abstractOperation.IsCallable = function (o) { return typeof o === 'function'; };

  // 9.2.3
  abstractOperation.SameValue = function (x, y) {
    if (typeof x !== typeof y) {
      return false;
    }
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'null':
      return true;
    case 'number':
      if (global_isNaN(x) && global_isNaN(y)) { return true; }
      if (x === 0 && y === 0) { return 1/x === 1/y; }
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  };

  // 9.2.4
  abstractOperation.SameValueZero = function (x, y) {
    if (typeof x !== typeof y) {
      return false;
    }
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'null':
      return true;
    case 'number':
      if (global_isNaN(x) && global_isNaN(y)) { return true; }
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  };

  // 9.2.5
  abstractOperation.IsConstructor = function (o) { return typeof o === 'function'; };

  // 9.2.6 IsPropertyKey - TODO: Consider for Symbol() polyfill

  //----------------------------------------
  // 9.3 Operations on Object
  //----------------------------------------

  // 9.3.1 Get - just use o.p or o[p]
  // 9.3.2 Put - just use o.p = v or o[p] = v

  // 9.3.6
  abstractOperation.HasProperty = function (o, p) { return p in o; };

  var $$toStringTag = Symbol(),
      $$iterator = Symbol();

  //----------------------------------------
  // 15.2 Object Objects
  //----------------------------------------

  // 15.2.3 Properties of the Object Constructor

  // 15.2.3.2
  defineFunctionProperty(
    Object, 'setPrototypeOf',
    function setPrototypeOf(o, proto) {
      if (Type(o) !== 'object') { throw new TypeError(); }
      if (Type(proto) !== 'object' && Type(proto) !== 'null') { throw new TypeError(); }
      o.__proto__ = proto;
      return o;
    }
  );

  // 15.2.3.15
  // TODO: Object.getOwnPropertyKeys vs. Object.keys
  defineFunctionProperty(
    Object, 'getOwnPropertyKeys',
    Object.keys
  );

  // 15.2.3.16
  defineFunctionProperty(
    Object, 'is',
    function is(x, y) {
      return abstractOperation.SameValue(x, y);
    });

  // 15.2.3.17
  defineFunctionProperty(
    Object, 'assign',
    function assign(target, source) {
      target = Object(target);
      source = Object(source);
      Object.keys(source).forEach(function(key) {
        target[key] = source[key];
      });
      return target;
    });

  // 15.2.3.18
  defineFunctionProperty(
    Object, 'mixin',
    function mixin(target, source) {
      target = Object(target);
      source = Object(source);
      Object.keys(source).forEach(function(key) {
        var desc = Object.getOwnPropertyDescriptor(source, key);
        Object.defineProperty(target, key, desc);
      });
      return target;
    });

  // 15.2.4 Properties of the Object Prototype Object

  // 15.2.4.2
  hook(Object.prototype, 'toString',
       function() {
         if (this === Object(this) && $$toStringTag in this) {
           return '[object ' + this[$$toStringTag] + ']';
         }
         return undefined;
       });


  //----------------------------------------
  // 15.4 Array Objects
  //----------------------------------------

  // 15.4.2 Properties of the Array Constructor

  // 15.4.2.3
  defineFunctionProperty(
    Array, 'of',
    function of() {
      var items = arguments;
      var lenValue = items.length;
      var len = abstractOperation.ToUint32(lenValue);
      var c = this, a;
      if (abstractOperation.IsConstructor(c)) {
        a = new c(len);
        a = Object(a);
      } else {
        a = new Array(len);
      }
      var k = 0;
      while (k < len) {
        a[k] = items[k];
        k += 1;
      }
      a.length = len;
      return a;
      return Array.from(arguments);
    });

  // 15.4.2.4
  defineFunctionProperty(
    Array, 'from',
    function from(arrayLike) {
      var mapfn = arguments[1];
      var thisArg = arguments[2];

      var items = Object(arrayLike);
      var lenValue = items.length;
      var len = abstractOperation.ToUint32(lenValue);
      var c = this, a;
      if (abstractOperation.IsConstructor(c)) {
        a = new c(len);
        a = Object(a);
      } else {
        a = new Array(len);
      }
      var k = 0;
      while (k < len) {
        var item = items[k];
        if (mapfn) {
          item = mapfn.call(thisArg, item);
        }
        a[k] = item;
        k += 1;
      }
      a.length = len;
      return a;
    });

  // 15.4.3 Properties of the Array Prototype Object

  // 15.4.3.23
  defineFunctionProperty(
    Array.prototype, 'find',
    function find(predicate) {
      var o = Object(this);
      var lenValue = o["length"];
      var len = abstractOperation.ToInteger(lenValue);
      if (!abstractOperation.IsCallable(predicate)) { throw new TypeError(); }
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = abstractOperation.HasProperty(o, pk);
        if (kPresent) {
          var kValue = o[pk];
          var testResult = predicate.call(t, kValue, k, o);
          if (Boolean(testResult)) {
            return kValue;
          }
        }
        ++k;
      }
      return undefined;
    });

  // 15.4.3.25
  defineFunctionProperty(
    Array.prototype, 'findIndex',
    function findIndex(predicate) {
      var o = Object(this);
      var lenValue = o["length"];
      var len = abstractOperation.ToInteger(lenValue);
      if (!abstractOperation.IsCallable(predicate)) { throw new TypeError(); }
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = abstractOperation.HasProperty(o, pk);
        if (kPresent) {
          var kValue = o[pk];
          var testResult = predicate.call(t, kValue, k, o);
          if (Boolean(testResult)) {
            return k;
          }
        }
        ++k;
      }
      return -1;
    });

  // 15.4.3.25
  defineFunctionProperty(
    Array.prototype, 'entries',
    function entries() {
      return CreateArrayIterator(this, 'key+value');
    });

  // 15.4.4.26
  defineFunctionProperty(
    Array.prototype, 'keys',
    function keys() {
      return CreateArrayIterator(this, 'key');
    });

  // 15.4.4.27
  defineFunctionProperty(
    Array.prototype, 'values',
    function values() {
      return CreateArrayIterator(this, 'value');
    });

  // 15.4.4.28
  defineFunctionProperty(
    Array.prototype, $$iterator,
    Array.prototype.entries
    );

  // 15.4.6 Array Iterator Object Structure

  function CreateArrayIterator(array, kind) {
    return new ArrayIterator(array, 0, kind);
  }

  function ArrayIterator(object, nextIndex, kind) {
    this.iteratedObject = object;
    this.nextIndex = nextIndex;
    this.iterationKind = kind;
  }
  ArrayIterator.prototype = {};

  // 15.4.6.2.2
  defineFunctionProperty(
    ArrayIterator.prototype, 'next',
    function() {
      if (typeof this !== 'object') { throw new TypeError; }
      var a = this.iteratedObject,
          index = this.nextIndex,
          itemKind = this.iterationKind,
          lenValue = a.length,
          len = abstractOperation.ToUint32(lenValue),
          elementKey,
          elementValue;
      if (itemKind.indexOf('sparse') !== -1) {
        var found = false;
        while (!found && index < len) {
          elementKey = String(index);
          found = abstractOperation.HasProperty(a, elementKey);
          if (!found) {
            index += 1;
          }
        }
      }
      if (index >= len) {
        this.nextIndex = Infinity;
        return abstractOperation.CreateItrResultObject(undefined, true);
      }
      elementKey = index;
      this.nextIndex = index + 1;
      if (itemKind.indexOf('value') !== -1) {
        elementValue = a[elementKey];
      }
      if (itemKind.indexOf('key+value') !== -1) {
        return abstractOperation.CreateItrResultObject([elementKey, elementValue], false);
      } else if (itemKind.indexOf('key') !== -1) {
        return abstractOperation.CreateItrResultObject(elementKey, false);
      } else if (itemKind === 'value') {
        return abstractOperation.CreateItrResultObject(elementValue, false);
      }
      throw new Error('Internal error');
    });

  // 15.4.6.2.3
  defineFunctionProperty(
    ArrayIterator.prototype, $$iterator,
    function() {
      return this;
    });

  // 15.4.6.2.4
  ArrayIterator.prototype[$$toStringTag] = 'Array Iterator';

  //----------------------------------------
  // 15.5 String Objects
  //----------------------------------------

  // 15.5.3 Properties of the String Constructor

  // 15.5.3.3
  defineFunctionProperty(
    String, 'fromCodePoint',
    function fromCodePoint(/*...codePoints*/) {
      var codePoints = arguments,
          length = codePoints.length,
          elements = [],
          nextIndex = 0;
      while (nextIndex < length) {
        var next = codePoints[nextIndex];
        var nextCP = Number(next);
        if (!abstractOperation.SameValue(nextCP, abstractOperation.ToInteger(nextCP)) ||
            nextCP < 0 || nextCP > 0x10FFFF) {
          throw new RangeError('Invalid code point ' + nextCP);
        }
        if (nextCP < 0x10000) {
          elements.push(String.fromCharCode(nextCP));
        } else {
          nextCP -= 0x10000;
          elements.push(String.fromCharCode((nextCP >> 10) + 0xD800));
          elements.push(String.fromCharCode((nextCP % 0x400) + 0xDC00));
        }
        nextIndex += 1;
      }
      return elements.join('');
    });

  // 15.5.4 Properties of the String Prototype Object

  // 15.5.4.21
  defineFunctionProperty(
    String.prototype, 'repeat',
    function repeat(count) {
      // var string = '' + this;
      // count = abstractOperation.ToInteger(count);
      // var result = ';
      // while (--count >= 0) {
      //     result += string;
      // }
      // return result;
      count = abstractOperation.ToInteger(count);
      var a = [];
      a.length = count + 1;
      return a.join(String(this));
    });

  // 15.5.4.22
  defineFunctionProperty(
    String.prototype, 'startsWith',
    function startsWith(s) {
      s = String(s);
      return String(this).substring(0, s.length) === s;
    });

  // 15.5.4.23
  defineFunctionProperty(
    String.prototype, 'endsWith',
    function endsWith(s) {
      s = String(s);
      var t = String(this);
      return t.substring(t.length - s.length) === s;
    });

  // 15.5.4.24
  defineFunctionProperty(
    String.prototype, 'contains',
    function contains(searchString, position) {
      return String(this).indexOf(searchString, position) !== -1;
    });

  // 15.5.4.25
  defineFunctionProperty(
    String.prototype, 'codePointAt',
    function codePointAt(pos) {
      var s = String(this),
          position = abstractOperation.ToInteger(pos),
          size = s.length;
      if (position < 0 || position >= size) {
        return undefined;
      }
      var first = s.charCodeAt(position);
      if (first < 0xD800 || first > 0xDBFF || position + 1 === size) {
        return first;
      }
      var second = s.charCodeAt(position + 1);
      if (second < 0xDC00 || second > 0xDFFF) {
        return first;
      }
      return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
    });

  //----------------------------------------
  // 15.7 Number Objects
  //----------------------------------------

  // 15.7.3 Properties of the Number Constructor

  // 15.7.3.7
  defineValueProperty(
    Number, 'EPSILON',
    (function () {
      var next, result;
      for (next = 1; 1 + next !== 1; next = next / 2) {
        result = next;
      }
      return result;
    }()));

  // 15.7.3.8
  defineValueProperty(
    Number, 'MAX_INTEGER',
    9007199254740991); // 2^53 - 1

  // 15.7.3.9
  defineFunctionProperty(
    Number,
    'parseInt',
    function parseInt(string) {
      return global_parseInt(string);
    });

  // 15.7.3.10
  defineFunctionProperty(
    Number, 'parseFloat',
    function parseFloat(string) {
      return global_parseFloat(string);
    });

  // 15.7.3.11
  defineFunctionProperty(
    Number, 'isNaN',
    function isNaN(value) {
      return typeof value === 'number' && global_isNaN(value);
    });

  // 15.7.3.12
  defineFunctionProperty(
    Number, 'isFinite',
    function isFinite(value) {
      return typeof value === 'number' && global_isFinite(value);
    });

  // 15.7.3.13
  defineFunctionProperty(
    Number, 'isInteger',
    function isInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      var integer = abstractOperation.ToInteger(number);
      if (integer !== number) {
        return false;
      }
      return true;
    });

  // 15.7.3.14
  defineFunctionProperty(
    Number, 'toInteger',
    function toInteger(value) {
      return abstractOperation.ToInteger(value);
    });

  // 15.7.4 Properties of the Number Prototype Object

  // 15.7.4.8
  defineFunctionProperty(
    Number.prototype, 'clz',
    function clz() {
      function clz8(x) {
        return (x & 0xf0) ? (x & 0x80 ? 0 : x & 0x40 ? 1 : x & 0x20 ? 2 : 3) :
        (x & 0x08 ? 4 : x & 0x04 ? 5 : x & 0x02 ? 6 : x & 0x01 ? 7 : 8);
      }
      var x = Number(this);
      x = abstractOperation.ToUint32(x);
      return x & 0xff000000 ? clz8(x >> 24) :
        x & 0xff0000 ? clz8(x >> 16) + 8 :
        x & 0xff00 ? clz8(x >> 8) + 16 : clz8(x) + 24;
    });

  //----------------------------------------
  // 15.8 The Math Object
  //----------------------------------------

  // 15.8.2 Function Properties of the Math Object

  // 15.8.2.19
  defineFunctionProperty(
    Math, 'log10',
    function log10(x) {
      x = Number(x);
      return log(x) * LOG10E;
    });

  // 15.8.2.20
  defineFunctionProperty(
    Math, 'log2',
    function log2(x) {
      x = Number(x);
      return log(x) * LOG2E;
    });

  // 15.8.2.21
  defineFunctionProperty(
    Math, 'log1p',
    function log1p(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_expm1.html
      if (x < -1) {
        return NaN;
      } else if (abstractOperation.SameValue(x, -0)) {
        return -0;
      } else if (abs(x) > 1e-4) {
        return log(1 + x);
      } else {
        return (-0.5 * x + 1) * x;
      }
    });

  // 15.8.2.22
  defineFunctionProperty(
    Math, 'expm1',
    function expm1(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_log1p.html
      if (abstractOperation.SameValue(x, -0)) {
        return -0;
      } else if (abs(x) < 1e-5) {
        return x + 0.5 * x * x; // two terms of Taylor expansion
      } else {
        return exp(x) - 1;
      }
    });

  // 15.8.2.23
  defineFunctionProperty(
    Math, 'cosh',
    function cosh(x) {
      x = Number(x);
      return (pow(E, x) + pow(E, -x)) / 2;
    });

  // 15.8.2.24
  defineFunctionProperty(
    Math, 'sinh',
    function sinh(x) {
      x = Number(x);
      return abstractOperation.SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
    });

  // 15.8.2.25
  defineFunctionProperty(
    Math, 'tanh',
    function tanh(x) {
      x = Number(x);
      var n = pow(E, 2 * x) - 1,
          d = pow(E, 2 * x) + 1;
      return abstractOperation.SameValue(x, -0) ? x : (n === d) ? 1 : n / d; // Handle Infinity/Infinity
    });

  // 15.8.2.26
  defineFunctionProperty(
    Math, 'acosh',
    function acosh(x) {
      x = Number(x);
      return log(x + sqrt(x * x - 1));
    });

  // 15.8.2.27
  defineFunctionProperty(
    Math, 'asinh',
    function asinh(x) {
      x = Number(x);
      if (abstractOperation.SameValue(x, -0)) {
        return x;
      }
      var s = sqrt(x * x + 1);
      return (s === -x) ? log(0) : log(x + s);
    });

  // 15.8.2.28
  defineFunctionProperty(
    Math, 'atanh',
    function atanh(x) {
      x = Number(x);
      return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
    });

  // 15.8.2.29
  defineFunctionProperty(
    Math, 'hypot',
    function hypot(x, y, z) {
      function isInfinite(x) { return x === Infinity || x === -Infinity; }
      x = Number(x);
      y = Number(y);
      z = (z === undefined) ? 0 : Number(z);
      if (isInfinite(x) || isInfinite(y) || isInfinite(z)) {
        return Infinity;
      }
      if (global_isNaN(x) || global_isNaN(y) || global_isNaN(z)) {
        return NaN;
      }
      return sqrt(x*x + y*y + z*z);
    });

  // 15.8.2.30
  defineFunctionProperty(
    Math, 'trunc',
    function trunc(x) {
      x = Number(x);
      return global_isNaN(x) ? NaN :
        x < 0 ? ceil(x) : floor(x);
    });

  // 15.8.2.31
  defineFunctionProperty(
    Math, 'sign',
    function sign(x) {
      x = Number(x);
      return x < 0 ? -1 : x > 0 ? 1 : x;
    });

  // 15.8.2.32
  defineFunctionProperty(
    Math, 'cbrt',
    function sign(x) {
      x = Number(x);
      if (global_isNaN(x/x)) {
        return x;
      }
      var r = pow( abs(x), 1/3 );
      var t = x/r/r;
      return r + (r * (t-r) / (2*r + t));
    });

  // 15.8.2.33
  defineFunctionProperty(
    Math, 'imul',
    function imul(x, y) {
      var a = abstractOperation.ToUint32(x);
      var b = abstractOperation.ToUint32(y);
      // (slow but accurate)
      var ah  = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh  = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    });

  //----------------------------------------
  // 15.14 Map Objects
  //----------------------------------------

  var empty = abstractOperation.ObjectCreate(null);

  (function() {

    // 15.14.1 Abstract Operations For Map Objects

    function MapInitialisation(obj, iterable, comparator) {
      if (typeof obj !== 'object') { throw new TypeError(); }
      if ('_mapData' in obj) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = iterable[$$iterator](); // or throw...
        var adder = obj['set'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      obj._mapData = { keys: [], values: [] };
      if (comparator !== undefined && comparator !== "is") { throw new TypeError(); }
      obj._mapComparator = (comparator === 'is') ? Object.is : Map.defaultComparator;

      if (iterable === undefined) {
        return obj;
      }
      while (true) {
        var result = itr.next();
        if (abstractOperation.IteratorComplete(result))
          return obj;
        adder.call(obj, result.value[0], result.value[1]);
      }
    }

    // 15.14.3 The Map Constructor

    /** @constructor */
    function Map(iterable, comparator) {
      if (!(this instanceof Map)) { return new Map(iterable, comparator); }

      MapInitialisation(this, iterable, comparator);

      return this;
    }

    function indexOf(mapComparator, mapData, key) {
      var i;
      // NOTE: Assumed invariant over all supported comparators
      if (key === key && key !== 0) {
        return mapData.keys.indexOf(key);
      }
      // Slow case for NaN/+0/-0
      for (i = 0; i < mapData.keys.length; i += 1) {
        if (mapComparator(mapData.keys[i], key)) { return i; }
      }
      return -1;
    }

    Map.defaultComparator = abstractOperation.SameValueZero;

    // 15.14.5 Properties of the Map Prototype Object

    Map.prototype = {};

    // 15.14.5.2
    defineFunctionProperty(
      Map.prototype, 'clear',
      function clear() {
        this._mapData.keys.length = 0;
        this._mapData.values.length = 0;
      });

    // 15.14.5.3
    defineFunctionProperty(
      Map.prototype, 'delete',
      function deleteFunction(key) {
        var i = indexOf(this._mapComparator, this._mapData, key);
        if (i < 0) { return false; }
        this._mapData.keys[i] = empty;
        this._mapData.values[i] = empty;
        return true;
      });

    // 15.14.5.4
    defineFunctionProperty(
      Map.prototype, 'forEach',
      function forEach(callbackfn /*, thisArg*/) {
        var thisArg = arguments[1];
        var m = Object(this);
        if (!abstractOperation.IsCallable(callbackfn)) {
          throw new TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < this._mapData.keys.length; ++i) {
          callbackfn.call(thisArg, this._mapData.keys[i], this._mapData.values[i], m);
        }
      });

    // 15.14.5.5
    defineFunctionProperty(
      Map.prototype, 'get',
      function get(key) {
        var i = indexOf(this._mapComparator, this._mapData, key);
        return i < 0 ? undefined : this._mapData.values[i];
      });

    // 15.14.5.6
    defineFunctionProperty(
      Map.prototype, 'has',
      function has(key) {
        return indexOf(this._mapComparator, this._mapData, key) >= 0;
      });

    // 15.14.5.7
    defineFunctionProperty(
      Map.prototype, 'entries',
      function entries() {
        return CreateMapIterator(Object(this), 'key+value');
      });

    // 15.14.5.8
    defineFunctionProperty(
      Map.prototype, 'keys',
      function keys() {
        return CreateMapIterator(Object(this), 'key');
      });

    // 15.14.5.9
    defineFunctionProperty(
      Map.prototype, 'set',
      function set(key, val) {
        var i = indexOf(this._mapComparator, this._mapData, key);
        if (i < 0) { i = this._mapData.keys.length; }
        this._mapData.keys[i] = key;
        this._mapData.values[i] = val;
        return val;
      });

    // 15.14.5.10
    Object.defineProperty(
      Map.prototype, 'size', {
        get: function() {
          var entries = this._mapData;
          var count = 0;
          for (var i = 0; i < entries.keys.length; ++i) {
            if (entries.keys[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 15.14.5.11
    defineFunctionProperty(
      Map.prototype, 'values',
      function values() {
        return CreateMapIterator(Object(this), 'value');
      });

    // 15.14.5.12
    defineFunctionProperty(
      Map.prototype, $$iterator,
      function() {
        return CreateMapIterator(Object(this), 'key+value');
      });

    // 15.14.5.13
    Map.prototype[$$toStringTag] = 'Map';

    // 15.14.7 Properties of Map Instances

    // 15.14.7.1
    function CreateMapIterator(map, kind) {
      map = Object(map);
      return new MapIterator(map, 0, kind);
    }

    /** @constructor */
    function MapIterator(object, index, kind) {
      this._iterationObject = object;
      this._nextIndex = index;
      this._iterationKind = kind;
    }

    // 15.14.17.2
    MapIterator.prototype = {};

    // 15.14.17.2.2
    defineFunctionProperty(
      MapIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError(); }
        var m = this._iterationObject,
            index = this._nextIndex,
            itemKind = this._iterationKind,
            entries = m._mapData;
        while (index < entries.keys.length) {
          var e = {key: entries.keys[index], value: entries.values[index]};
          index = index += 1;
          this._nextIndex = index;
          if (e.key !== empty) {
            if (itemKind === 'key') {
              return abstractOperation.CreateItrResultObject(e.key, false);
            } else if (itemKind === 'value') {
              return abstractOperation.CreateItrResultObject(e.value, false);
            } else {
              return abstractOperation.CreateItrResultObject([e.key, e.value], false);
            }
          }
        }
        return abstractOperation.CreateItrResultObject(undefined, true);
      });

    // 15.14.17.2.3
    defineFunctionProperty(
      MapIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 15.14.17.2.4
    MapIterator.prototype[$$toStringTag] = 'Map Iterator';

    global.Map = global.Map || Map;
  }());

  //----------------------------------------
  // 15.15 WeakMap Objects
  //----------------------------------------

  // Inspired by https://gist.github.com/1638059
  /** @constructor */
  function EphemeronTable() {
    var secretKey = abstractOperation.ObjectCreate(null);

    function conceal(o) {
      var oValueOf = o.valueOf, secrets = abstractOperation.ObjectCreate(null);
      o.valueOf = (function(secretKey) {
        return function (k) {
          return (k === secretKey) ? secrets : oValueOf.apply(o, arguments);
        };
      }(secretKey));
      return secrets;
    }

    function reveal(o) {
      var v = o.valueOf(secretKey);
      return v === o ? null : v;
    }

    return {
      clear: function() {
        secretKey = abstractOperation.ObjectCreate(null);
      },
      remove: function(key) {
        var secrets = reveal(key);
        if (secrets) {
          delete secrets.value;
        }
      },
      get: function(key, defaultValue) {
        var secrets = reveal(key);
        return (secrets && abstractOperation.HasOwnProperty(secrets, 'value')) ? secrets.value : defaultValue;
      },
      has: function(key) {
        var secrets = reveal(key);
        return Boolean(secrets && abstractOperation.HasOwnProperty(secrets, 'value'));
      },
      set: function(key, value) {
        var secrets = reveal(key) || conceal(key);
        secrets.value = value;
      }
    };
  }

  (function() {
    // 15.15.1 Abstract Operations For WeakMap Objects
    function WeakMapInitialisation(obj, iterable) {
      if (typeof obj !== 'object') { throw new TypeError(); }
      if ('_table' in obj) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = iterable[$$iterator](); // or throw...
        var adder = obj['set'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      obj._table = new EphemeronTable;
      if (iterable === undefined) {
        return obj;
      }
      while (true) {
        var result = itr.next();
        if (abstractOperation.IteratorComplete(result))
          return obj;
        adder.call(obj, result.value[0], result.value[1]);
      }
    }

    // 15.15.3 The WeakMap Constructor

    /** @constructor */
    function WeakMap(iterable) {
      if (!(this instanceof WeakMap)) { return new WeakMap(iterable); }

      WeakMapInitialisation(this, iterable);

      return this;
    }

    WeakMap.prototype = {};

    // 15.15.5 Properties of the WeakMap Prototype Object

    // 15.15.5.2
    defineFunctionProperty(
      WeakMap.prototype, 'clear',
      function clear() {
        this._table.clear();
      });

    // 15.15.5.3
    defineFunctionProperty(
      WeakMap.prototype, 'delete',
      function deleteFunction(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.remove(key);
      });

    // 15.15.5.4
    defineFunctionProperty(
      WeakMap.prototype, 'get',
      function get(key, defaultValue) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.get(key, defaultValue);
      });

    // 15.15.5.5
    defineFunctionProperty(
      WeakMap.prototype, 'has',
      function has(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.has(key);
      });

    // 15.15.5.6
    defineFunctionProperty(
      WeakMap.prototype, 'set',
      function set(key, value) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.set(key, value);
        return value;
      });

    // 15.15.5.8
    WeakMap.prototype[$$toStringTag] = 'WeakMap';

    global.WeakMap = global.WeakMap || WeakMap;
  }());

  //----------------------------------------
  // 15.16 Set Objects
  //----------------------------------------

  (function() {

    // 15.16.1 Abstract Operations For Set Objects
    function SetInitialisation(obj, iterable, comparator) {
      if (typeof obj !== 'object') { throw new TypeError(); }
      if ('_setData' in obj) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = abstractOperation.HasProperty(iterable, 'values') ? iterable.values() : iterable[$$iterator](); // or throw...
        var adder = obj['add'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      obj._setData = [];
      if (comparator !== undefined && comparator !== "is") { throw new TypeError(); }
      obj._setComparator = (comparator === 'is') ? Object.is : Set.defaultComparator;
      if (iterable === undefined) {
        return obj;
      }
      while (true) {
        var result = itr.next();
        if (abstractOperation.IteratorComplete(result))
          return obj;
        adder.call(obj, result.value);
      }
    }

    // 15.16.3 The Set Constructor
    /** @constructor */
    function Set(iterable, comparator) {
      if (!(this instanceof Set)) { return new Set(iterable, comparator); }

      SetInitialisation(this, iterable, comparator);

      return this;
    }

    function indexOf(setComparator, setData, key) {
      var i;
      // NOTE: Assumed invariant over all supported comparators
      if (key === key && key !== 0) {
        return setData.indexOf(key);
      }
      // Slow case for NaN/+0/-0
      for (i = 0; i < setData.length; i += 1) {
        if (setComparator(setData[i], key)) { return i; }
      }
      return -1;
    }

    Set.defaultComparator = abstractOperation.SameValueZero;

    // 15.16.5 Properties of the Set Prototype Object

    Set.prototype = {};

    // 15.16.5.2
    defineFunctionProperty(
      Set.prototype, 'add',
      function add(key) {
        var i = indexOf(this._setComparator, this._setData, key);
        if (i < 0) { i = this._setData.length; }
        this._setData[i] = key;
        return key;
      });

    // 15.16.5.3
    defineFunctionProperty(
      Set.prototype, 'clear',
      function clear() {
        this._setData = [];
      });

    // 15.16.5.4
    defineFunctionProperty(
      Set.prototype, 'delete',
      function deleteFunction(key) {
        var i = indexOf(this._setComparator, this._setData, key);
        if (i < 0) { return false; }
        this._setData[i] = empty;
        return true;
      });

    // 15.16.5.5
    defineFunctionProperty(
      Set.prototype, 'forEach',
      function forEach(callbackfn/*, thisArg*/) {
        var thisArg = arguments[1];
        var s = Object(this);
        if (!abstractOperation.IsCallable(callbackfn)) {
          throw new TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < this._setData.length; ++i) {
          callbackfn.call(thisArg, this._setData[i], s);
        }
      });

    // 15.16.5.6
    defineFunctionProperty(
      Set.prototype, 'has',
      function has(key) {
        return indexOf(this._setComparator, this._setData, key) !== -1;
      });

    // 15.16.5.7
    Object.defineProperty(
      Set.prototype, 'size', {
        get: function() {
          var entries = this._setData;
          var count = 0;
          for (var i = 0; i < entries.length; ++i) {
            if (entries[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 15.16.5.8
    defineFunctionProperty(
      Set.prototype, 'values',
      function values() {
        return CreateSetIterator(Object(this));
      });

    // 15.16.5.9
    defineFunctionProperty(
      Set.prototype, $$iterator,
      function() {
        return CreateSetIterator(Object(this));
      });

    // 15.16.5.10
    Set.prototype[$$toStringTag] = 'Set';

    // 15.16.7 Set Iterator Object Structure

    function CreateSetIterator(set) {
      set = Object(set);
      return new SetIterator(set, 0);
    }

    /** @constructor */
    function SetIterator(set, index) {
      this.set = set;
      this.nextIndex = index;
    }
    SetIterator.prototype = {};

    // 15.16.7.2.2
    defineFunctionProperty(
      SetIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError; }
        var s = this.set,
            index = this.nextIndex,
            entries = s._setData;
        while (index < entries.length) {
          var e = entries[index];
          index = index += 1;
          this.nextIndex = index;
          if (e !== empty) {
            return abstractOperation.CreateItrResultObject(e, false);
          }
        }
        return abstractOperation.CreateItrResultObject(undefined, true);
      });

    // 15.16.7.2.3
    defineFunctionProperty(
      SetIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 15.16.7.2.4
    SetIterator.prototype[$$toStringTag] = 'Set Iterator';

    global.Set = global.Set || Set;
  }());

  // WeakSet
  (function() {

    function WeakSetInitialisation(obj, iterable) {
      if (typeof obj !== 'object') { throw new TypeError(); }
      if ('_table' in obj) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = abstractOperation.HasProperty(iterable, 'values') ? iterable.values() : iterable[$$iterator](); // or throw...
        var adder = obj['add'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      obj._table = new EphemeronTable;
      if (iterable === undefined) {
        return obj;
      }
      while (true) {
        var result = itr.next();
        if (abstractOperation.IteratorComplete(result))
          return obj;
        adder.call(obj, result.value);
      }
    }

    /** @constructor */
    function WeakSet(iterable) {
      if (!(this instanceof WeakSet)) { return new WeakSet(iterable); }

      WeakSetInitialisation(this, iterable);

      return this;
    }

    WeakSet.prototype = {};

    defineFunctionProperty(
      WeakSet.prototype, 'add',
      function add(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.set(key, true);
        return key;
      });

    defineFunctionProperty(
      WeakSet.prototype, 'clear',
      function clear() {
        this._table.clear();
      });

    defineFunctionProperty(
      WeakSet.prototype, 'delete',
      function deleteFunction(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.remove(key);
      });

    defineFunctionProperty(
      WeakSet.prototype, 'has',
      function has(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.has(key);
      });

    WeakSet.prototype[$$toStringTag] = 'WeakSet';

    global.WeakSet = global.WeakSet || WeakSet;
  }());

  //----------------------------------------
  // 15.17 The Reflect Module
  //----------------------------------------

  (function() {

    var Reflect = {};

    defineFunctionProperty(
      Reflect, 'getOwnPropertyDescriptor',
      Object.getOwnPropertyDescriptor);
    defineFunctionProperty(
      Reflect, 'defineProperty',
      Object.defineProperty);
    defineFunctionProperty(
      Reflect, 'getOwnPropertyNames',
      Object.getOwnPropertyNames);
    defineFunctionProperty(
      Reflect, 'getPrototypeOf',
      Object.getPrototypeOf);
    defineFunctionProperty(
      Reflect, 'setPrototypeOf',
      function(target, proto) {
        target.__proto__ = proto;
      });
    defineFunctionProperty(
      Reflect, 'deleteProperty',
      function(target,name) {
        delete target[name];
      });
    defineFunctionProperty(
      Reflect, 'enumerate',
      function(target) {
        target = Object(target);
        return new PropertyIterator(target);
      });
    defineFunctionProperty(
      Reflect, 'freeze',
      function(target) {
        try { Object.freeze(target); return true; } catch (e) { return false; }
      });
    defineFunctionProperty(
      Reflect, 'seal',
      function(target) {
        try { Object.seal(target); return true; } catch (e) { return false; }
      });
    defineFunctionProperty(
      Reflect, 'preventExtensions',
      function(target) {
        try { Object.preventExtensions(target); return true; } catch (e) { return false; }
      });
    defineFunctionProperty(
      Reflect, 'isFrozen',
      Object.isFrozen);
    defineFunctionProperty(
      Reflect, 'isSealed',
      Object.isSealed);
    defineFunctionProperty(
      Reflect, 'isExtensible',
      Object.isExtensible);
    defineFunctionProperty(
      Reflect, 'has',
      function(target,name) {
        return String(name) in Object(target);
      });
    defineFunctionProperty(
      Reflect, 'hasOwn',
      function(target,name) {
        return Object(target).hasOwnProperty(String(name));
      });
    defineFunctionProperty(
      Reflect, 'instanceOf',
      function(target, O) {
        return target instanceof O;
      });
    defineFunctionProperty(
      Reflect, 'keys',
      Object.keys);
    defineFunctionProperty(
      Reflect, 'get',
      function(target,name,receiver) {
        target = Object(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : Object(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('get' in desc) {
          return Function.prototype.call.call(desc['get'], receiver);
        }
        return target[name];
      });
    defineFunctionProperty(
      Reflect, 'set',
      function(target,name,value,receiver) {
        target = Object(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : Object(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('set' in desc) {
          return Function.prototype.call.call(desc['set'], receiver, value);
        }
        return target[name] = value;
      });
    defineFunctionProperty(
      Reflect, 'apply',
      function(target,thisArg,args) {
        return Function.prototype.apply.call(target, thisArg, args);
      });
    defineFunctionProperty(
      Reflect, 'construct',
      function(target, args) {
        var a = arguments;
        var s = 'new target';
        for (var i = 1; i < a.length; ++i) {
          s += ((i === 1) ? '(' : ',') + 'a[' + i + ']';
        }
        s += ')';
        return eval(s);
      });

    function Enumerate(obj, includePrototype, onlyEnumerable) {
      var proto = Object.getPrototypeOf(obj);
      var propList;
      if (!includePrototype || proto === null) {
        propList = [];
      } else {
        propList = Enumerate(proto, true, onlyEnumerable);
      }
      Object.keys(obj).forEach(function(name) {
        var desc = Object.getOwnPropertyDescriptor(obj, name);
        var index = propList.indexOf(name);
        if (index !== -1) {
          propList.splice(index, 1);
        }
        if (!onlyEnumerable || desc.enumerable) {
          propList.push(name);
        }
      });
      return propList;
    }

    function PropertyIterator(o) {
      this.o = o;
      this.nextIndex = 0;
      this.propList = Enumerate(o);
    }
    PropertyIterator.prototype = {};

    defineFunctionProperty(
      PropertyIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError; }
        var o = this.set,
            index = this.nextIndex,
            entries = this.propList;
        while (index < entries.length) {
          var e = entries[index];
          index = index += 1;
          this.nextIndex = index;
          if (e !== empty) {
            return abstractOperation.CreateItrResultObject(e, false);
          }
        }
        return abstractOperation.CreateItrResultObject(undefined, true);
      });

    defineFunctionProperty(
      PropertyIterator.prototype, $$iterator,
      function() {
        return this;
      });

    global.Reflect = global.Reflect || Reflect;
  }());

  //----------------------------------------
  // 15.19 The "std:iteration" Module
  //----------------------------------------

  // 15.19.4.3.4
  abstractOperation.CreateItrResultObject = function(value, done) {
    assert(Type(done) === 'boolean');
    var obj = {};
    obj["value"] = value;
    obj["done"] = done;
    return obj;
  };

  // 15.19.4.3.5
  abstractOperation.IteratorComplete = function(itrResult) {
    assert(Type(itrResult) === 'object');
    assert(Object(itrResult) === itrResult);
    return Boolean(itrResult.done);
  };

  //----------------------------------------------------------------------
  //
  // ECMAScript Strawman Proposals
  //
  //----------------------------------------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_compare
  defineFunctionProperty(
    Number, 'compare',
    function compare(first, second, tolerance) {
      var difference = first - second;
      return abs(difference) <= (tolerance || 0) ? 0 : difference < 0 ? -1 : 1;
    });

  // http://wiki.ecmascript.org/doku.php?id=harmony:extended_object_api
  defineFunctionProperty(
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
  defineFunctionProperty(
    Object, 'getPropertyNames',
    function getPropertyNames(o) {
      var names = abstractOperation.ObjectCreate(null);
      do {
        Object.getOwnPropertyNames(o).forEach(function(name) {
          names[name] = true;
        });
        o = Object.getPrototypeOf(o);
      } while (o);
      return Object.keys(names);
    });

  // http://wiki.ecmascript.org/doku.php?id=strawman:array.prototype.pushall
  defineFunctionProperty(
    Array.prototype, 'pushAll',
    function pushAll(other, start, end) {
      other = Object(other);
      if (start === undefined) {
        start = 0;
      }
      start = abstractOperation.ToUint32(start);
      var otherLength = abstractOperation.ToUint32(other.length);
      if (end === undefined) {
        end = otherLength;
      }
      end = abstractOperation.ToUint32(end);
      var self = Object(this);
      var length = abstractOperation.ToUint32(self.length);
      for (var i = 0, j = length; i < end; i++, j++) {
        self[j] = other[i];
      }
      self.length = j;
      return;
    });

  // es-discuss: DOMStringList replacement; may rename to 'has'
  defineFunctionProperty(
    Array.prototype, 'contains',
    function contains(target) {
      if (this === void 0 || this === null) { throw new TypeError(); }
      var t = Object(this),
          len = abstractOperation.ToUint32(t.length),
          i;
      for (i = 0; i < len; i += 1) {
        // eval('0 in [undefined]') == false in IE8-
        if (/*i in t &&*/ abstractOperation.SameValue(t[i], target)) {
          return true;
        }
      }
      return false;
    });


  // http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/index.html
  (function() {
    defineFunctionProperty(
      String.prototype, $$iterator,
      function entries() {
        return CreateStringIterator(this);
      });

    function CreateStringIterator(string) {
      return new StringIterator(string, 0);
    }

    /** @constructor */
    function StringIterator(object, nextIndex) {
      this.iteratedObject = object;
      this.nextIndex = nextIndex;
    }
    StringIterator.prototype = {};
    StringIterator.prototype[$$toStringTag] = 'String Iterator';
    defineFunctionProperty(
      StringIterator.prototype, 'next',
      function() {
        var s = String(this.iteratedObject),
            index = this.nextIndex,
            len = s.length;
        if (index >= len) {
          this.nextIndex = Infinity;
          return abstractOperation.CreateItrResultObject(undefined, true);
        }
        var cp = s.codePointAt(index);
        this.nextIndex += cp > 0xFFFF ? 2 : 1;
        return abstractOperation.CreateItrResultObject(String.fromCodePoint(cp), false);
      });
    defineFunctionProperty(
      StringIterator.prototype, $$iterator,
      function() {
        return this;
      });
  }());

  // module "@dict"
  // https://mail.mozilla.org/pipermail/es-discuss/2012-December/026810.html
  (function() {
    function dict(init) {
      var dict = abstractOperation.ObjectCreate(null);
      if (init) {
        for (var key in init) {
          if (Object.prototype.hasOwnProperty.call(init, key)) {
            dict[key] = init[key];
          }
        }
      }
      return dict;
    }

    defineFunctionProperty(
      global, 'keys',
      function keys(o) {
        return CreateDictIterator(o, 'key');
      });
    defineFunctionProperty(
      global, 'values',
      function values(o) {
        return CreateDictIterator(o, 'value');
      });
    defineFunctionProperty(
      global, 'entries',
      function entries(o) {
        return CreateDictIterator(o, 'key+value');
      });

    function CreateDictIterator(string, kind) {
      return new DictIterator(string, 0, kind);
    }

    /** @constructor */
    function DictIterator(object, nextIndex, kind) {
      this.iteratedObject = object;
      this.nextIndex = nextIndex;
      this.kind = kind;
      // TODO: Use Enumerate()
      this.propList = Object.keys(object);
    }
    DictIterator.prototype = {};
    DictIterator.prototype[$$toStringTag] = 'Dict Iterator';
    defineFunctionProperty(
      DictIterator.prototype, 'next',
      function() {
        var o = Object(this.iteratedObject),
            index = this.nextIndex,
            entries = this.propList,
            len = entries.length,
            itemKind = this.kind;
        while (index < len) {
          var e = {key: entries[index], value: o[entries[index]]};
          index = index += 1;
          this.nextIndex = index;
          if (e.key !== empty) {
            if (itemKind === 'key') {
              return abstractOperation.CreateItrResultObject(e.key, false);
            } else if (itemKind === 'value') {
              return abstractOperation.CreateItrResultObject(e.value, false);
            } else {
              return abstractOperation.CreateItrResultObject([e.key, e.value], false);
            }
          }
        }
        return abstractOperation.CreateItrResultObject(undefined, true);
      });
    defineFunctionProperty(
      DictIterator.prototype, $$iterator,
      function() {
        return this;
      });
    global.dict = global.dict || dict;
  }());

  // module "@symbol"
  // Not secure nor is obj[$symbol] hidden from Object.keys():
  function Symbol() {
    if (!(this instanceof Symbol)) return new Symbol;
    function pad8(n) { return ('00000000' + n).slice(-8); }
    function r() { return pad8((Math.random() * 0x100000000).toString(16)); }
    var __private__ = r() + '-' + r() + '-' + r() + '-' + r();
    this.toString = function() { return __private__; };
    return this;
  }
  global.Symbol = global.Symbol || Symbol;

  // NOTE: Since true iterators can't be polyfilled, this is a hack
  function forOf(o, func) {
    o = Object(o);
    var it = o[$$iterator]();
    while (true) {
      var result = it.next();
      if (abstractOperation.IteratorComplete(result)) {
        return;
      }
      func(result.value);
    }
  }
  global.forOf = forOf; // Since for( ... of ... ) can't be shimmed w/o a transpiler.

}(self));
