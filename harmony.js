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
    // Sanity check that functions are appropriately named (where possible)
    if ('name' in f && !(p instanceof Symbol) && f.name !== p && f.name !== p + "Function")
      throw new Error(f.name + " !== " + p);
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
      max = Math.max,
      min = Math.min,
      pow = Math.pow,
      sqrt = Math.sqrt;

  // These are used for implementing the polyfills, but not exported.

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

  var empty = Object.create(null);

  var abstractOperation = {};

  //----------------------------------------------------------------------
  //
  // ECMAScript 6 Draft
  // http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
  //
  //----------------------------------------------------------------------

  //----------------------------------------
  // 6 ECMAScript Data Types and Values
  //----------------------------------------

  // "Type(x)" is used as shorthand for "the type of x"...
  function Type(v) { return v === null ? 'null' : typeof v; };

  // 6.1.6.4 Well-Known Symbols and Intrinsics

  var $$toStringTag = Symbol(),
      $$iterator = Symbol();

  //----------------------------------------
  // 7 Abstract Operations
  //----------------------------------------

  //----------------------------------------
  // 7.1 Type Conversion and Testing
  //----------------------------------------

  // 7.1.1 ToPrimitive - just use valueOf()
  // 7.1.2 ToBoolean - just use Boolean()
  // 7.1.3 ToNumber - just use Number()

  // 7.1.4
  abstractOperation.ToInteger = function (n) {
    n = Number(n);
    if (global_isNaN(n)) { return 0; }
    if (n === 0 || n === Infinity || n === -Infinity) { return n; }
    return ((n < 0) ? -1 : 1) * floor(abs(n));
  };

  // 7.1.5
  abstractOperation.ToInt32 = function (v) { return v >> 0; };

  // 7.1.6
  abstractOperation.ToUint32 = function (v) { return v >>> 0; };

  // 7.1.7
  abstractOperation.ToUint16 = function (v) { return (v >>> 0) & 0xFFFF; };

  // 7.1.8 ToString - just use String()
  // 7.1.9 ToObject - just use Object()

  // 7.1.10 ToPropertyKey - TODO: consider for Symbol polyfill

  // 7.1.11
  abstractOperation.ToLength = function(v) {
    var len = abstractOperation.ToInteger(v);
    if (len <= 0) {
      return 0;
    }
    return min(len, 0x20000000000000 - 1); // 2^53-1
  };

  //----------------------------------------
  // 7.2 Testing and Comparison Operations
  //----------------------------------------

  // 7.2.1 CheckObjectCoercible - TODO: needed?

  // 7.2.2
  abstractOperation.IsCallable = function (o) { return typeof o === 'function'; };

  // 7.2.3
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

  // 7.2.4
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

  // 7.2.5
  abstractOperation.IsConstructor = function (o) { return typeof o === 'function'; };

  // 7.2.6 IsPropertyKey - TODO: Consider for Symbol() polyfill

  //----------------------------------------
  // 7.3 Operations on Object
  //----------------------------------------

  // 7.3.1 Get - just use o.p or o[p]
  // 7.3.2 Put - just use o.p = v or o[p] = v

  // 7.3.6
  abstractOperation.HasProperty = function (o, p) { return p in o; };

  //----------------------------------------
  // 9 ECMAScript Ordinary and Exotic Objects Behaviors
  //----------------------------------------

  // 9.1.5
  abstractOperation.HasOwnProperty = (function() {
    var ophop = Object.prototype.hasOwnProperty;
    return function (o, p) { return ophop.call(o, p); };
  }());

  // 9.1.15
  abstractOperation.ObjectCreate = (function() {
    var oc = Object.create;
    return function(p, idl) { return oc(p, idl); };
  }());

  // ---------------------------------------
  // 19 Fundamental Objects
  // ---------------------------------------

  // ---------------------------------------
  // 19.1 Object Objects
  // ---------------------------------------

  // 19.1.1 The Object Constructor Called as a Function
  // 19.1.1.1 Object ( [ value ] )
  // 19.1.2 The Object Constructor
  // 19.1.2.1 new Object ( [ value ] )
  // 19.1.3 Properties of the Object Constructor

  // 19.1.3.1 Object.assign ( target, source )
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

  // 19.1.3.2 Object.create ( O [, Properties] )
  // 19.1.3.3 Object.defineProperties ( O, Properties )
  // 19.1.3.4 Object.defineProperty ( O, P, Attributes )
  // 19.1.3.5 Object.freeze ( O )
  // 19.1.3.6 Object.getOwnPropertyDescriptor ( O, P )

  // 19.1.3.7 Object.getOwnPropertyKeys ( O )
  defineFunctionProperty(
    Object, 'getOwnPropertyKeys',
    function getOwnPropertyKeys(o) { return Object.keys(o); }
  );

  // 19.1.3.8 Object.getOwnPropertyNames ( O )
  // 19.1.3.9 Object.getPrototypeOf ( O )

  // 19.1.3.10 Object.is ( value1, value2 )
  defineFunctionProperty(
    Object, 'is',
    function is(value1, value2) {
      return abstractOperation.SameValue(value1, value2);
    });

  // 19.1.3.11 Object.isExtensible ( O )
  // 19.1.3.12 Object.isFrozen ( O )
  // 19.1.3.13 Object.isSealed ( O )
  // 19.1.3.14 Object.keys ( O )

  // 19.1.3.15 Object.mixin ( target, source )
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

  // 19.1.3.16 Object.preventExtensions ( O )
  // 19.1.3.17 Object.prototype
  // 19.1.3.18 Object.seal ( O )

  // 19.1.3.19 Object.setPrototypeOf ( O, proto )
  defineFunctionProperty(
    Object, 'setPrototypeOf',
    function setPrototypeOf(o, proto) {
      if (Type(o) !== 'object') { throw new TypeError(); }
      if (Type(proto) !== 'object' && Type(proto) !== 'null') { throw new TypeError(); }
      o.__proto__ = proto;
      return o;
    }
  );

  // 19.1.4 Properties of the Object Prototype Object
  // 19.1.4.1 Object.prototype.constructor
  // 19.1.4.2 Object.prototype.hasOwnProperty (V)
  // 19.1.4.3 Object.prototype.isPrototypeOf (V)
  // 19.1.4.4 Object.prototype.propertyIsEnumerable (V)
  // 19.1.4.5 Object.prototype.toLocaleString ( )

  // 19.1.4.6 Object.prototype.toString ( )
  hook(Object.prototype, 'toString',
       function() {
         if (this instanceof Symbol) {
           return '[object Symbol';
         }
         if (this === Object(this) && $$toStringTag in this) {
           return '[object ' + this[$$toStringTag] + ']';
         }
         return undefined;
       });

  // 19.1.4.7 Object.prototype.valueOf ( )
  // 19.1.5 Properties of Object Instances

  // ---------------------------------------
  // 19.2 Function Objects
  // ---------------------------------------

  // 19.2.1 The Function Constructor
  // 19.2.1.1 Function (p1, p2, … , pn, body)
  // 19.2.1.2 new Function ( ... argumentsList)
  // 19.2.2 Properties of the Function Constructor
  // 19.2.2.1 Function.length
  // 19.2.2.2 Function.prototype
  // 19.2.2.3 Function[ @@create ] ( )
  // 19.2.3 Properties of the Function Prototype Object
  // 19.2.3.1 Function.prototype.apply (thisArg, argArray)
  // 19.2.3.2 Function.prototype.bind (thisArg [, arg1 [, arg2, …]])
  // 19.2.3.3 Function.prototype.call (thisArg [ , arg1 [ , arg2, … ] ] )
  // 19.2.3.4 Function.prototype.constructor
  // 19.2.3.5 Function.prototype.toString ( )
  // 19.2.3.6 Function.prototype[ @@create ] ( )
  // 19.2.3.7 Function.prototype[@@hasInstance] (V)
  // 19.2.4 Function Instances
  // 19.2.4.1 length
  // 19.2.4.2 prototype

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 19.3 Boolean Objects
  // ---------------------------------------

  // 19.3.1 The Boolean Constructor
  // 19.3.1.1 Boolean (value)
  // 19.3.1.2 new Boolean (... argumentsList)
  // 19.3.2 Properties of the Boolean Constructor
  // 19.3.2.1 Boolean.prototype
  // 19.3.2.2 Boolean[ @@create ] ( )
  // 19.3.3 Properties of the Boolean Prototype Object
  // 19.3.3.1 Boolean.prototype.constructor
  // 19.3.3.2 Boolean.prototype.toString ( )
  // 19.3.3.3 Boolean.prototype.valueOf ( )
  // 19.3.4 Properties of Boolean Instances

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 19.4 Error Objects
  // ---------------------------------------

  // 19.4.1 The Error Constructor
  // 19.4.1.1 Error (message)
  // 19.4.1.2 new Error(... argumentsList)
  // 19.4.2 Properties of the Error Constructor
  // 19.4.2.1 Error.prototype
  // 19.4.2.2 Error[ @@create ] ( )
  // 19.4.3 Properties of the Error Prototype Object
  // 19.4.3.1 Error.prototype.constructor
  // 19.4.3.2 Error.prototype.message
  // 19.4.3.3 Error.prototype.name
  // 19.4.3.4 Error.prototype.toString ( )
  // 19.4.4 Properties of Error Instances
  // 19.4.5 Native Error Types Used in This Standard
  // 19.4.5.1 EvalError
  // 19.4.5.2 RangeError
  // 19.4.5.3 ReferenceError
  // 19.4.5.4 SyntaxError
  // 19.4.5.5 TypeError
  // 19.4.5.6 URIError
  // 19.4.6 NativeError Object Structure
  // 19.4.6.1 NativeError Constructors
  // 19.4.6.1.1 NativeError (message)
  // 19.4.6.1.2 new NativeError (... argumentsList )
  // 19.4.6.2 Properties of the NativeError Constructors
  // 19.4.6.2.1 NativeError.prototype
  // 19.4.6.2.2 NativeError [ @@create ] ( )
  // 19.4.6.3 Properties of the NativeError Prototype Objects
  // 19.4.6.3.1 NativeError.prototype.constructor
  // 19.4.6.3.2 NativeError.prototype.message
  // 19.4.6.3.3 NativeError.prototype.name
  // 19.4.6.4 Properties of NativeError Instances

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 20 Numbers and Dates
  // ---------------------------------------

  // ---------------------------------------
  // 20.1 Number Objects
  // ---------------------------------------

  // 20.1.1 The Number Constructor
  // 20.1.1.1 Number ( [ value ] )
  // 20.1.1.2 new Number ( ...argumentsList)
  // 20.1.2 Properties of the Number Constructor

  // 20.1.2.1 Number.EPSILON
  defineValueProperty(
    Number, 'EPSILON',
    (function () {
      var next, result;
      for (next = 1; 1 + next !== 1; next = next / 2) {
        result = next;
      }
      return result;
    }()));

  // 20.1.2.2 Number.isFinite (number)
  defineFunctionProperty(
    Number, 'isFinite',
    function isFinite(value) {
      return typeof value === 'number' && global_isFinite(value);
    });

  // 20.1.2.3 Number.isInteger (number)
  defineFunctionProperty(
    Number, 'isInteger',
    function isInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      if (global_isNaN(number) || number === +Infinity || number === -Infinity) {
        return false;
      }
      var integer = abstractOperation.ToInteger(number);
      if (integer !== number) {
        return false;
      }
      return true;
    });

  // 20.1.2.4 Number.isNaN (number)
  defineFunctionProperty(
    Number, 'isNaN',
    function isNaN(value) {
      return typeof value === 'number' && global_isNaN(value);
    });

  // 20.1.2.5 Number.isSafeInteger (number)
  defineFunctionProperty(
    Number, 'isSafeInteger',
    function isSafeInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      if (number !== number || number === +Infinity || number === -Infinity) {
        return false;
      }
      var integer = abstractOperation.ToInteger(number);
      if (integer !== number) {
        return false;
      }
      if (abs(integer) <= (0x20000000000000 - 1)) { // 2^53-1
        return true;
      }
      return false;
    });

  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  defineValueProperty(
    Number, 'MAX_SAFE_INTEGER',
    0x20000000000000 - 1); // 2^53-1

  // 20.1.2.7 Number.MAX_VALUE
  // 20.1.2.8 Number.NaN
  // 20.1.2.9 Number.NEGATIVE_INFINITY

  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  defineValueProperty(
    Number, 'MIN_SAFE_INTEGER',
    -0x20000000000000 + 1); // -2^53+1

  // 20.1.2.11 Number.MIN_VALUE
  // 20.1.2.12 Number.parseFloat (string)
  defineFunctionProperty(
    Number, 'parseFloat',
    function parseFloat(string) {
      return global_parseFloat(string);
    });

  // 20.1.2.13 Number.parseInt (string, radix)
  defineFunctionProperty(
    Number,
    'parseInt',
    function parseInt(string) {
      return global_parseInt(string);
    });

  // 20.1.2.14 Number.POSITIVE_INFINITY
  // 20.1.2.15 Number.prototype
  // 20.1.2.16 Number[ @@create ] ( )
  // 20.1.3 Properties of the Number Prototype Object

  // 20.1.3.1 Number.prototype.clz ()
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

  // 20.1.3.2 Number.prototype.constructor
  // 20.1.3.3 Number.prototype.toExponential (fractionDigits)
  // 20.1.3.4 Number.prototype.toFixed (fractionDigits)
  // 20.1.3.5 Number.prototype.toLocaleString()
  // 20.1.3.6 Number.prototype.toPrecision (precision)
  // 20.1.3.7 Number.prototype.toString ( [ radix ] )
  // 20.1.3.8 Number.prototype.valueOf ( )
  // 20.1.4 Properties of Number Instances

  // ---------------------------------------
  // 20.2 The Math Object
  // ---------------------------------------

  // 20.2.1 Value Properties of the Math Object
  // 20.2.1.1 Math.E
  // 20.2.1.2 Math.LN10
  // 20.2.1.3 Math.LOG10E
  // 20.2.1.4 Math.LN2
  // 20.2.1.5 Math.LOG2E
  // 20.2.1.6 Math.PI
  // 20.2.1.7 Math.SQRT1_2
  // 20.2.1.8 Math.SQRT2
  // 20.2.2 Function Properties of the Math Object
  // 20.2.2.1 Math.abs (x)
  // 20.2.2.2 Math.acos (x)

  // 20.2.2.3 Math.acosh(x)
  defineFunctionProperty(
    Math, 'acosh',
    function acosh(x) {
      x = Number(x);
      return log(x + sqrt(x * x - 1));
    });

  // 20.2.2.4 Math.asin (x)

  // 20.2.2.5 Math.asinh(x)
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

  // 20.2.2.6 Math.atan (x)

  // 20.2.2.7 Math.atanh(x)
  defineFunctionProperty(
    Math, 'atanh',
    function atanh(x) {
      x = Number(x);
      return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
    });

  // 20.2.2.8 Math.atan2 (y, x)

  // 20.2.2.9 Math.cbrt(x)
  defineFunctionProperty(
    Math, 'cbrt',
    function cbrt(x) {
      x = Number(x);
      if (global_isNaN(x/x)) {
        return x;
      }
      var r = pow( abs(x), 1/3 );
      var t = x/r/r;
      return r + (r * (t-r) / (2*r + t));
    });

  // 20.2.2.10 Math.ceil (x)
  // 20.2.2.11 Math.cos (x)

  // 20.2.2.12 Math.cosh(x)
  defineFunctionProperty(
    Math, 'cosh',
    function cosh(x) {
      x = Number(x);
      return (pow(E, x) + pow(E, -x)) / 2;
    });

  // 20.2.2.13 Math.exp (x)

  // 20.2.2.14 Math.expm1 (x)
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

  // 20.2.2.15 Math.floor (x)

  // 20.2.2.16 Math.hypot( value1 , value2, value3 = 0 )
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

  // 20.2.2.17 Math.imul(x, y)
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

  // 20.2.2.18 Math.log (x)

  // 20.2.2.19 Math.log1p (x)
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

  // 20.2.2.20 Math.log10 (x)
  defineFunctionProperty(
    Math, 'log10',
    function log10(x) {
      x = Number(x);
      return log(x) * LOG10E;
    });

  // 20.2.2.21 Math.log2 (x)
  defineFunctionProperty(
    Math, 'log2',
    function log2(x) {
      x = Number(x);
      return log(x) * LOG2E;
    });

  // 20.2.2.22 Math.max ( [ value1 [ , value2 [ , … ] ] ] )
  // 20.2.2.23 Math.min ( [ value1 [ , value2 [ , … ] ] ] )
  // 20.2.2.24 Math.pow (x, y)
  // 20.2.2.25 Math.random ( )
  // 20.2.2.26 Math.round (x)

  // 20.2.2.27 Math.roundFloat32 (x )
  defineFunctionProperty(
    Math, 'roundFloat32',
    function roundFloat32(x) {
      if (global_isNaN(x)) {
        return NaN;
      }
      if (1/x === +Infinity || 1/x === -Infinity || x === +Infinity || x === -Infinity) {
        return x;
      }
      return (new Float32Array([x]))[0];
    });

  // 20.2.2.28 Math.sign(x)
  defineFunctionProperty(
    Math, 'sign',
    function sign(x) {
      x = Number(x);
      return x < 0 ? -1 : x > 0 ? 1 : x;
    });

  // 20.2.2.29 Math.sin (x)

  // 20.2.2.30 Math.sinh(x)
  defineFunctionProperty(
    Math, 'sinh',
    function sinh(x) {
      x = Number(x);
      return abstractOperation.SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
    });

  // 20.2.2.31 Math.sqrt (x)
  // 20.2.2.32 Math.tan (x)

  // 20.2.2.33 Math.tanh(x)
  defineFunctionProperty(
    Math, 'tanh',
    function tanh(x) {
      x = Number(x);
      var n = pow(E, 2 * x) - 1,
          d = pow(E, 2 * x) + 1;
      if (abstractOperation.SameValue(x, -0))
        return x;
      return (n === d) ? 1 : n / d; // Handle Infinity/Infinity
    });

  // 20.2.2.34 Math.trunc(x)
  defineFunctionProperty(
    Math, 'trunc',
    function trunc(x) {
      x = Number(x);
      return global_isNaN(x) ? NaN :
        x < 0 ? ceil(x) : floor(x);
    });

  // ---------------------------------------
  // 20.3 Date Objects
  // ---------------------------------------

  // 20.3.1 Overview of Date Objects and Definitions of Abstract Operations
  // 20.3.1.1 Time Values and Time Range
  // 20.3.1.2 Day Number and Time within Day
  // 20.3.1.3 Year Number
  // 20.3.1.4 Month Number
  // 20.3.1.5 Date Number
  // 20.3.1.6 Week Day
  // 20.3.1.7 Local Time Zone Adjustment
  // 20.3.1.8 Daylight Saving Time Adjustment
  // 20.3.1.9 Local Time
  // 20.3.1.10 Hours, Minutes, Second, and Milliseconds
  // 20.3.1.11 MakeTime (hour, min, sec, ms)
  // 20.3.1.12 MakeDay (year, month, date)
  // 20.3.1.13 MakeDate (day, time)
  // 20.3.1.14 TimeClip (time)
  // 20.3.1.15 Date Time String Format
  // 20.3.1.15.1 Extended years
  // 20.3.2 The Date Constructor
  // 20.3.2.1 Date (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] )
  // 20.3.2.2 Date (value)
  // 20.3.2.3 Date ( )
  // 20.3.2.4 new Date ( ... argumentsList)
  // 20.3.3 Properties of the Date Constructor
  // 20.3.3.1 Date.now ( )
  // 20.3.3.2 Date.parse (string)
  // 20.3.3.3 Date.prototype
  // 20.3.3.4 Date.UTC (year, month [, date [, hours [, minutes [, seconds [, ms ] ] ] ] ] )
  // 20.3.3.5 Date[ @@create ] ( )
  // 20.3.4 Properties of the Date Prototype Object
  // 20.3.4.1 Date.prototype.constructor
  // 20.3.4.2 Date.prototype.getDate ( )
  // 20.3.4.3 Date.prototype.getDay ( )
  // 20.3.4.4 Date.prototype.getFullYear ( )
  // 20.3.4.5 Date.prototype.getHours ( )
  // 20.3.4.6 Date.prototype.getMilliseconds ( )
  // 20.3.4.7 Date.prototype.getMinutes ( )
  // 20.3.4.8 Date.prototype.getMonth ( )
  // 20.3.4.9 Date.prototype.getSeconds ( )
  // 20.3.4.10 Date.prototype.getTime ( )
  // 20.3.4.11 Date.prototype.getTimezoneOffset ( )
  // 20.3.4.12 Date.prototype.getUTCDate ( )
  // 20.3.4.13 Date.prototype.getUTCDay ( )
  // 20.3.4.14 Date.prototype.getUTCFullYear ( )
  // 20.3.4.15 Date.prototype.getUTCHours ( )
  // 20.3.4.16 Date.prototype.getUTCMilliseconds ( )
  // 20.3.4.17 Date.prototype.getUTCMinutes ( )
  // 20.3.4.18 Date.prototype.getUTCMonth ( )
  // 20.3.4.19 Date.prototype.getUTCSeconds ( )
  // 20.3.4.20 Date.prototype.setDate (date)
  // 20.3.4.21 Date.prototype.setFullYear (year [, month [, date ] ] )
  // 20.3.4.22 Date.prototype.setHours (hour [, min [, sec [, ms ] ] ] )
  // 20.3.4.23 Date.prototype.setMilliseconds (ms)
  // 20.3.4.24 Date.prototype.setMinutes (min [, sec [, ms ] ] )
  // 20.3.4.25 Date.prototype.setMonth (month [, date ] )
  // 20.3.4.26 Date.prototype.setSeconds (sec [, ms ] )
  // 20.3.4.27 Date.prototype.setTime (time)
  // 20.3.4.28 Date.prototype.setUTCDate (date)
  // 20.3.4.29 Date.prototype.setUTCFullYear (year [, month [, date ] ] )
  // 20.3.4.30 Date.prototype.setUTCHours (hour [, min [, sec [, ms ] ] ] )
  // 20.3.4.31 Date.prototype.setUTCMilliseconds (ms)
  // 20.3.4.32 Date.prototype.setUTCMinutes (min [, sec [, ms ] ] )
  // 20.3.4.33 Date.prototype.setUTCMonth (month [, date ] )
  // 20.3.4.34 Date.prototype.setUTCSeconds (sec [, ms ] )
  // 20.3.4.35 Date.prototype.toDateString ( )
  // 20.3.4.36 Date.prototype.toISOString ( )
  // 20.3.4.37 Date.prototype.toJSON ( key )
  // 20.3.4.38 Date.prototype.toLocaleDateString ( )
  // 20.3.4.39 Date.prototype.toLocaleString ( )
  // 20.3.4.40 Date.prototype.toLocaleTimeString ( )
  // 20.3.4.41 Date.prototype.toString ( )
  // 20.3.4.42 Date.prototype.toTimeString ( )
  // 20.3.4.43 Date.prototype.toUTCString ( )
  // 20.3.4.44 Date.prototype.valueOf ( )
  // 20.3.4.45 Date.prototype [ @@ToPrimitive ] ( hint )
  // 20.3.5 Properties of Date Instances

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 21 Text Processing
  // ---------------------------------------

  // 21.1 String Objects
  // 21.1.1 The String Constructor
  // 21.1.1.1 String ( [ value ] )
  // 21.1.1.2 new String ( ... argumentsList )
  // 21.1.2 Properties of the String Constructor
  // 21.1.2.1 String.fromCharCode ( ...codeUnits)

  // 21.1.2.2 String.fromCodePoint ( ...codePoints)
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

  // 21.1.2.3 String.prototype
  // 21.1.2.4 String.raw ( callSite, ...substitutions)

  // TODO (see Tagged Template String 12.2.6)

  // 21.1.2.5 String[ @@create ] ( )
  // 21.1.3 Properties of the String Prototype Object
  // 21.1.3.1 String.prototype.charAt (pos)
  // 21.1.3.2 String.prototype.charCodeAt (pos)

  // 21.1.3.3 String.prototype.codePointAt (pos)
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

  // 21.1.3.4 String.prototype.concat ( ...args )
  // 21.1.3.5 String.prototype.constructor
  // 21.1.3.6 String.prototype.contains (searchString, position = 0 )
  defineFunctionProperty(
    String.prototype, 'contains',
    function contains(searchString, position) {
      return String(this).indexOf(searchString, position) !== -1;
    });

  // 21.1.3.7 String.prototype.endsWith (searchString [, endPosition] )
  defineFunctionProperty(
    String.prototype, 'endsWith',
    function endsWith(s) {
      s = String(s);
      var t = String(this);
      return t.substring(t.length - s.length) === s;
    });

  // 21.1.3.8 String.prototype.indexOf (searchString, position)
  // 21.1.3.9 String.prototype.lastIndexOf (searchString, position)
  // 21.1.3.10 String.prototype.localeCompare (that)
  // 21.1.3.11 String.prototype.match (regexp)
  // 21.1.3.12 String.prototype.normalize ( form = "NFC" )

  // TODO

  // 21.1.3.13 String.prototype.repeat (count)
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

  // 21.1.3.14 String.prototype.replace (searchValue, replaceValue)
  // 21.1.3.15 String.prototype.search (regexp)
  // 21.1.3.16 String.prototype.slice (start, end)
  // 21.1.3.17 String.prototype.split (separator, limit)

  // 21.1.3.18 String.prototype.startsWith (searchString [, position ] )
  defineFunctionProperty(
    String.prototype, 'startsWith',
    function startsWith(s) {
      s = String(s);
      return String(this).substring(0, s.length) === s;
    });

  // 21.1.3.19 String.prototype.substring (start, end)
  // 21.1.3.20 String.prototype.toLocaleLowerCase ( )
  // 21.1.3.21 String.prototype.toLocaleUpperCase ( )
  // 21.1.3.22 String.prototype.toLowerCase ( )
  // 21.1.3.23 String.prototype.toString ( )
  // 21.1.3.24 String.prototype.toUpperCase ( )
  // 21.1.3.25 String.prototype.trim ( )
  // 21.1.3.26 String.prototype.valueOf ( )
  // 21.1.4 Properties of String Instances
  // 21.1.4.1 length

  // ---------------------------------------
  // 21.2 RegExp (Regular Expression) Objects
  // ---------------------------------------

  // 21.2.1 Patterns
  // 21.2.2 Pattern Semantics
  // 21.2.2.1 Notation
  // 21.2.2.2 Pattern
  // 21.2.2.3 Disjunction
  // 21.2.2.4 Alternative
  // 21.2.2.5 Term
  // 21.2.2.6 Assertion
  // 21.2.2.7 Quantifier
  // 21.2.2.8 Atom
  // 21.2.2.9 AtomEscape
  // 21.2.2.10 CharacterEscape
  // 21.2.2.11 DecimalEscape
  // 21.2.2.12 CharacterClassEscape
  // 21.2.2.13 CharacterClass
  // 21.2.2.14 ClassRanges
  // 21.2.2.15 NonemptyClassRanges
  // 21.2.2.16 NonemptyClassRangesNoDash
  // 21.2.2.17 ClassAtom
  // 21.2.2.18 ClassAtomNoDash
  // 21.2.2.19 ClassEscape
  // 21.2.3 The RegExp Constructor
  // 21.2.3.1 RegExp(pattern, flags)
  // 21.2.3.2 new RegExp(...argumentsList)
  // 21.2.3.3 Abstract Operations for the RegExp Constructor
  // 21.2.4 Properties of the RegExp Constructor
  // 21.2.4.1 RegExp.prototype
  // 21.2.4.2 RegExp[ @@create ] ( )
  // 21.2.5 Properties of the RegExp Prototype Object
  // 21.2.5.1 RegExp.prototype.constructor
  // 21.2.5.2 RegExp.prototype.exec(string)
  // 21.2.5.3 get RegExp.prototype.global
  // 21.2.5.4 get RegExp.prototype.ignoreCase
  // 21.2.5.5 RegExp.prototype.match (string)
  // 21.2.5.6 get RegExp.prototype.multiline
  // 21.2.5.7 RegExp.prototype.replace (S, replaceValue)
  // 21.2.5.8 RegExp.prototype.search (S)
  // 21.2.5.9 get RegExp.prototype.source
  // 21.2.5.10 RegExp.prototype.split (string, limit)
  // 21.2.5.11 get RegExp.prototype.sticky
  // 21.2.5.12 RegExp.prototype.test(string)
  // 21.2.5.13 RegExp.prototype.toString()
  // 21.2.5.14 get RegExp.prototype.unicode
  // 21.2.5.15 RegExp.prototype [ @@isRegExp ]
  // 21.2.6 Properties of RegExp Instances
  // 21.2.6.1 lastIndex

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 22 Indexed Collections
  // ---------------------------------------

  // ---------------------------------------
  // 22.1 Array Objects
  // ---------------------------------------

  // 22.1.1 The Array Constructor
  // 22.1.1.1 Array ( [ item1 [ , item2 [ , … ] ] ] )
  // 22.1.1.2 Array (len)
  // 22.1.1.3 new Array ( ... argumentsList)
  // 22.1.2 Properties of the Array Constructor

  // 22.1.2.1 Array.from ( arrayLike , mapfn=undefined, thisArg=undefined )
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

  // 22.1.2.2 Array.isArray ( arg )

  // 22.1.2.3 Array.of ( ...items )
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

  // 22.1.2.4 Array.prototype
  // 22.1.2.5 Array[ @@create ] ( )
  // 22.1.3 Properties of the Array Prototype Object
  // 22.1.3.1 Array.prototype.concat ( [ item1 [ , item2 [ , … ] ] ] )
  // 22.1.3.1.1 IsConcatSpreadable ( O ) Abstract Operation
  // 22.1.3.2 Array.prototype.constructor
  // 22.1.3.3 Array.prototype.copyWith (target, start, end = this.length)
  defineFunctionProperty(
    Array.prototype, 'copyWithin',
    function copyWithin(target, start/*, end*/) {
      var end = arguments[2];

      var o = Object(this);
      var lenVal = o["length"];
      var len = abstractOperation.ToLength(lenVal);
      len = max(len, 0);
      var relativeTarget = abstractOperation.ToInteger(target);
      var to;
      if (relativeTarget < 0)
        to = max(len + relativeTarget, 0);
      else
        to = min(relativeTarget, len);
      var relativeStart = abstractOperation.ToInteger(start);
      var from;
      if (relativeStart < 0)
        from = max(len + relativeStart, 0);
      else
        from = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = abstractOperation.ToInteger(end);
      var final;
      if (relativeEnd < 0)
        final = max(len + relativeEnd, 0);
      else
        final = min(relativeEnd, len);
      var count = min(final - from, len - to);
      var direction;
      if (from < to && to < from + count) {
        direction = -1;
        from = from + count - 1;
        to = to + count - 1;
      } else {
        direction = 1;
      }
      while (count > 0) {
        var fromKey = String(from);
        var toKey = String(to);
        var fromPresent = abstractOperation.HasProperty(o, fromKey);
        if (fromPresent) {
          var fromVal = o[fromKey];
          o[toKey] = fromVal;
        } else {
          delete o[toKey];
        }
        from = from + direction;
        to = to + direction;
        count = count - 1;
      }
      return o;
    });

  // 22.1.3.4 Array.prototype.entries ( )
  defineFunctionProperty(
    Array.prototype, 'entries',
    function entries() {
      return CreateArrayIterator(this, 'key+value');
    });

  // 22.1.3.5 Array.prototype.every ( callbackfn [ , thisArg ] )

  // 22.1.3.6 Array.prototype.fill (value, start = 0, end = this.length)
  defineFunctionProperty(
    Array.prototype, 'fill',
    function fill(value/*, start, end*/) {
      var start = arguments[1],
          end = arguments[2];

      var o = Object(this);
      var lenVal = o["length"];
      var len = abstractOperation.ToLength(lenVal);
      len = max(len, 0);
      var relativeStart = abstractOperation.ToInteger(start);
      var k;
      if (relativeStart < 0)
        k = max((len + relativeStart), 0);
      else
        k = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = abstractOperation.ToInteger(end);
      var final;
      if (relativeEnd < 0)
        final = max((len + relativeEnd), 0);
      else
        final = min(relativeEnd, len);
      while (k < final) {
        var pk = String(k);
        o[pk] = value;
        k += 1;
      }
      return o;
    });

  // 22.1.3.7 Array.prototype.filter ( callbackfn [ , thisArg ] )

  // 22.1.3.8 Array.prototype.find ( predicate , thisArg = undefined )
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

  // 22.1.3.9 Array.prototype.findIndex ( predicate , thisArg = undefined )
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

  // 22.1.3.10 Array.prototype.forEach ( callbackfn [ , thisArg ] )
  // 22.1.3.11 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
  // 22.1.3.12 Array.prototype.join (separator)

  // 22.1.3.13 Array.prototype.keys ( )
  defineFunctionProperty(
    Array.prototype, 'keys',
    function keys() {
      return CreateArrayIterator(this, 'key');
    });

  // 22.1.3.14 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
  // 22.1.3.15 Array.prototype.map ( callbackfn [ , thisArg ] )
  // 22.1.3.16 Array.prototype.pop ( )
  // 22.1.3.17 Array.prototype.push ( [ item1 [ , item2 [ , … ] ] ] )
  // 22.1.3.18 Array.prototype.reduce ( callbackfn [ , initialValue ] )
  // 22.1.3.19 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
  // 22.1.3.20 Array.prototype.reverse ( )
  // 22.1.3.21 Array.prototype.shift ( )
  // 22.1.3.22 Array.prototype.slice (start, end)
  // 22.1.3.23 Array.prototype.some ( callbackfn [ , thisArg ] )
  // 22.1.3.24 Array.prototype.sort (comparefn)
  // 22.1.3.25 Array.prototype.splice (start, deleteCount [ , item1 [ , item2 [ , … ] ] ] )
  // 22.1.3.26 Array.prototype.toLocaleString ( )
  // 22.1.3.27 Array.prototype.toString ( )
  // 22.1.3.28 Array.prototype.unshift ( [ item1 [ , item2 [ , … ] ] ] )

  // 22.1.3.29 Array.prototype.values ( )
  defineFunctionProperty(
    Array.prototype, 'values',
    function values() {
      return CreateArrayIterator(this, 'value');
    });

  // 22.1.3.30 Array.prototype [ @@iterator ] ( )
  defineFunctionProperty(
    Array.prototype, $$iterator,
    Array.prototype.entries
    );

  // 22.1.3.31 Array.prototype [ @@unscopables ]
  // 22.1.4 Properties of Array Instances
  // 22.1.4.1 length

  // 22.1.5 Array Iterator Object Structure
  function ArrayIterator(object, nextIndex, kind) {
    this.iteratedObject = object;
    this.nextIndex = nextIndex;
    this.iterationKind = kind;
  }

  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function CreateArrayIterator(array, kind) {
    return new ArrayIterator(array, 0, kind);
  }

  // 22.1.5.2 The Array Iterator Prototype
  ArrayIterator.prototype = {};

  // 22.1.5.2.1 ArrayIterator.prototype.constructor
  // 22.1.5.2.2 ArrayIterator.prototype.next( )
  defineFunctionProperty(
    ArrayIterator.prototype, 'next',
    function next() {
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

  // 22.1.5.2.3 ArrayIterator.prototype.@@iterator ( )
  defineFunctionProperty(
    ArrayIterator.prototype, $$iterator,
    function() {
      return this;
    });

  // 22.1.5.2.4 ArrayIterator.prototype.@@toStringTag
  ArrayIterator.prototype[$$toStringTag] = 'Array Iterator';

  // 22.1.5.3 Properties of Array Iterator Instances


  // ---------------------------------------
  // 22.2 TypedArray Objects
  // ---------------------------------------

  // 22.2.1 The %TypedArray% Intrinsic Object
  // 22.2.1.1 %TypedArray% ( length )
  // 22.2.1.2 %TypedArray% ( typedArray )
  // 22.2.1.3 %TypedArray% ( array )
  // 22.2.1.4 %TypedArray% ( buffer, byteOffset=0, length=undefined )
  // 22.2.1.5 %TypedArray% ( all other argument combinations )
  // 22.2.2 Properties of the %TypedArray% Intrinsic Object
  // 22.2.2.1 %TypedArray%.from ( source , mapfn=undefined, thisArg=undefined )
  // 22.2.2.2 %TypedArray%.of ( ...items )
  // 22.2.2.3 %TypedArray%.prototype
  // 22.2.2.4 %TypedArray% [ @@create ] ( )
  // 22.2.3 Properties of the %TypedArrayPrototype% Object
  // 22.2.3.1 get %TypedArray%.prototype.buffer
  // 22.2.3.2 get %TypedArray%.prototype.byteLength
  // 22.2.3.3 get %TypedArray%.prototype.byteOffset
  // 22.2.3.4 %TypedArray%.prototype.constructor
  // 22.2.3.5 %TypedArray%.prototype.copyWithin (target, start, end = this.length )
  // 22.2.3.6 %TypedArray%.prototype.entries ( )
  // 22.2.3.7 %TypedArray%.prototype.every ( callbackfn, thisArg = undefined )
  // 22.2.3.8 %TypedArray%.prototype.fill (value, start = 0, end = this.length )
  // 22.2.3.9 %TypedArray%.prototype.filter ( callbackfn, thisArg = undefined )
  // 22.2.3.10 %TypedArray%.prototype.find (predicate, thisArg = undefined)
  // 22.2.3.11 %TypedArray%.prototype.findIndex ( predicate, thisArg = undefined )
  // 22.2.3.12 %TypedArray%.prototype.forEach ( callbackfn, thisArg = undefined )
  // 22.2.3.13 %TypedArray%.prototype.indexOf (searchElement, fromIndex = 0 )
  // 22.2.3.14 %TypedArray%.prototype.join ( separator )
  // 22.2.3.15 %TypedArray%.prototype.keys ( )
  // 22.2.3.16 %TypedArray%.prototype.lastIndexOf ( searchElement, fromIndex = this.length-1 )
  // 22.2.3.17 get %TypedArray%.prototype.length
  // 22.2.3.18 %TypedArray%.prototype.map ( callbackfn, thisArg = undefined )
  // 22.2.3.19 %TypedArray%.prototype.reduce ( callbackfn [, initialValue] )
  // 22.2.3.20 %TypedArray%.prototype.reduceRight ( callbackfn [, initialValue] )
  // 22.2.3.21 %TypedArray%.prototype.reverse ( )
  // 22.2.3.22 %TypedArray%.prototype.set(array, offset = 0 )
  // 22.2.3.23 %TypedArray%.prototype.set(typedArray, offset = 0 )
  // 22.2.3.24 %TypedArray%.prototype.slice ( start, end )
  // 22.2.3.25 %TypedArray%.prototype.some ( callbackfn, thisArg = undefined )
  // 22.2.3.26 %TypedArray%.prototype.sort ( comparefn )
  // 22.2.3.27 %TypedArray%.prototype.subarray(begin = 0, end = this.length )
  // 22.2.3.28 %TypedArray%.prototype.toLocaleString ( )
  // 22.2.3.29 %TypedArray%.prototype.toString ( )
  // 22.2.3.30 %TypedArray%.prototype.values ( )
  // 22.2.3.31 %TypedArray%.prototype [ @@iterator ] ( )
  // 22.2.3.32 get %TypedArray%.prototype [ @@toStringTag ]
  // 22.2.4 The TypedArray Constructors
  // 22.2.4.1 new TypedArray( ... argumentsList)
  // 22.2.4.2 new TypedArray( ... argumentsList)
  // 22.2.5 Properties of the TypedArray Constructors
  // 22.2.5.1 TypedArray.BYTES_PER_ELEMENT
  // 22.2.5.2 TypedArray.prototype
  // 22.2.6 Properties of TypedArray Prototype Objects
  // 22.2.6.1 TypedArray.prototype.BYTES_PER_ELEMENT
  // 22.2.6.2 TypedArray.prototype.constructor
  // 22.2.7 Properties of TypedArray Instances

  // See typedarray.js for TypedArray polyfill

  // TODO: ES6 extensions to TypedArrays

  // ---------------------------------------
  // 23 Keyed Collection
  // ---------------------------------------

  // ---------------------------------------
  // 23.1 Map Objects
  // ---------------------------------------

  (function() {

    // 23.1.1 The Map Constructor

    // 23.1.1.1 Map (iterable = undefined , comparator = undefined )
    /** @constructor */
    function Map(iterable, comparator) {
      var map = this;

      if (typeof map !== 'object') { throw new TypeError(); }
      if ('__MapData__' in map) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = iterable[$$iterator](); // or throw...
        var adder = map['set'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      map.__MapData__ = { keys: [], values: [] };
      if (comparator !== undefined && comparator !== "is") { throw new TypeError(); }
      map._mapComparator = comparator;

      if (iterable === undefined) {
        return map;
      }
      while (true) {
        var next = abstractOperation.IteratorNext(itr);
        var done = abstractOperation.IteratorComplete(next);
        if (done)
          return map;
        var nextItem = abstractOperation.IteratorValue(next);
        if (typeof nextItem !== 'object') { throw new TypeError(); }
        var k = nextItem[0];
        var v = nextItem[1];
        adder.call(map, k, v);
      }

      return map;
    }

    function indexOf(same, mapData, key) {
      var i;
      // NOTE: Assumed invariant over all supported comparators
      if (key === key && key !== 0) {
        return mapData.keys.indexOf(key);
      }
      // Slow case for NaN/+0/-0
      for (i = 0; i < mapData.keys.length; i += 1) {
        if (same(mapData.keys[i], key)) { return i; }
      }
      return -1;
    }

    // 23.1.1.2 new Map ( ... argumentsList )
    // 23.1.2 Properties of the Map Constructor
    // 23.1.2.1 Map.prototype
    Map.prototype = {};

    // 23.1.2.2 Map[ @@create ] ( )
    // 23.1.3 Properties of the Map Prototype Object
    // 23.1.3.1 Map.prototype.clear ()
    defineFunctionProperty(
      Map.prototype, 'clear',
      function clear() {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;
        entries.keys.length = 0;
        entries.values.length = 0;
      });

    // 23.1.3.2 Map.prototype.constructor

    // 23.1.3.3 Map.prototype.delete ( key )
    defineFunctionProperty(
      Map.prototype, 'delete',
      function deleteFunction(key) {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;
        var same = (m._mapComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        var i = indexOf(same, entries, key);
        if (i < 0) { return false; }
        entries.keys[i] = empty;
        entries.values[i] = empty;
        return true;
      });

    // 23.1.3.4 Map.prototype.entries ( )
     defineFunctionProperty(
      Map.prototype, 'entries',
      function entries() {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.5 Map.prototype.forEach ( callbackfn , thisArg = undefined )
    defineFunctionProperty(
      Map.prototype, 'forEach',
      function forEach(callbackfn /*, thisArg*/) {
        var thisArg = arguments[1];

        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;

        if (!abstractOperation.IsCallable(callbackfn)) {
          throw new TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.keys.length; ++i) {
          callbackfn.call(thisArg, entries.keys[i], entries.values[i], m);
        }
      });

    // 23.1.3.6 Map.prototype.get ( key )
    defineFunctionProperty(
      Map.prototype, 'get',
      function get(key) {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;
        var same = (m._mapComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        var i = indexOf(same, entries, key);
        return i < 0 ? undefined : entries.values[i];
      });

    // 23.1.3.7 Map.prototype.has ( key )
    defineFunctionProperty(
      Map.prototype, 'has',
      function has(key) {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;
        var same = (m._mapComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        return indexOf(same, entries, key) >= 0;
      });

    // 23.1.3.8 Map.prototype.keys ( )
    defineFunctionProperty(
      Map.prototype, 'keys',
      function keys() {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        return CreateMapIterator(m, 'key');
      });

    // 23.1.3.9 Map.prototype.set ( key , value )
    defineFunctionProperty(
      Map.prototype, 'set',
      function set(key, val) {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        if (!('__MapData__' in m)) throw new TypeError();
        if (m.__MapData__ === undefined) throw new TypeError();
        var entries = m.__MapData__;
        var same = (m._mapComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        var i = indexOf(same, entries, key);
        if (i < 0) { i = entries.keys.length; }
        entries.keys[i] = key;
        entries.values[i] = val;
        return m;
      });

    // 23.1.3.10 get Map.prototype.size
    Object.defineProperty(
      Map.prototype, 'size', {
        get: function() {
          var m = this;
          if (Type(m) !== 'object') throw new TypeError();
          if (!('__MapData__' in m)) throw new TypeError();
          if (m.__MapData__ === undefined) throw new TypeError();
          var entries = m.__MapData__;
          var count = 0;
          for (var i = 0; i < entries.keys.length; ++i) {
            if (entries.keys[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.1.3.11 Map.prototype.values ( )
    defineFunctionProperty(
      Map.prototype, 'values',
      function values() {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        return CreateMapIterator(m, 'value');
      });

    // 23.1.3.12 Map.prototype.@@iterator ( )
    defineFunctionProperty(
      Map.prototype, $$iterator,
      function() {
        var m = this;
        if (Type(m) !== 'object') throw new TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.13 Map.prototype [ @@toStringTag ]
    Map.prototype[$$toStringTag] = 'Map';

    // 23.1.4 Properties of Map Instances
    // 23.1.5 Map Iterator Object Structure
    /** @constructor */
    function MapIterator(object, index, kind) {
      this._iterationObject = object;
      this._nextIndex = index;
      this._iterationKind = kind;
    }

    // 23.1.5.1 CreateMapIterator Abstract Operation
    function CreateMapIterator(map, kind) {
      map = Object(map);
      return new MapIterator(map, 0, kind);
    }

    // 23.1.5.2 The Map Iterator Prototype
    MapIterator.prototype = {};

    // 23.1.5.2.1 MapIterator.prototype.constructor
    // 23.1.5.2.2 MapIterator.prototype.next( )
    defineFunctionProperty(
      MapIterator.prototype, 'next',
      function next() {
        if (typeof this !== 'object') { throw new TypeError(); }
        var m = this._iterationObject,
            index = this._nextIndex,
            itemKind = this._iterationKind,
            entries = m.__MapData__;
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

    // 23.1.5.2.3 MapIterator.prototype [ @@iterator ] ( )
    defineFunctionProperty(
      MapIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 23.1.5.2.4 MapIterator.prototype [ @@toStringTag ]
    MapIterator.prototype[$$toStringTag] = 'Map Iterator';

    // 23.1.5.3 Properties of Map Iterator Instances
    global.Map = global.Map || Map;
  }());

  // ---------------------------------------
  // 23.2 Set Objects
  // ---------------------------------------

  (function() {

    // 23.2.1 The Set Constructor
    // 23.2.1.1 Set (iterable = undefined, comparator = undefined )

    /** @constructor */
    function Set(iterable, comparator) {
      var set = this;

      if (typeof set !== 'object') { throw new TypeError(); }
      if ('__SetData__' in set) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = abstractOperation.HasProperty(iterable, 'values') ? iterable.values() : iterable[$$iterator](); // or throw...
        var adder = set['add'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      set.__SetData__ = [];
      if (comparator !== undefined && comparator !== "is") { throw new TypeError(); }
      set._setComparator = comparator;
      if (iterable === undefined) {
        return set;
      }
      while (true) {
        var next = abstractOperation.IteratorNext(itr);
        var done = abstractOperation.IteratorComplete(next);
        if (done)
          return set;
        var nextValue = abstractOperation.IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    function indexOf(same, setData, key) {
      var i;
      // NOTE: Assumed invariant over all supported comparators
      if (key === key && key !== 0) {
        return setData.indexOf(key);
      }
      // Slow case for NaN/+0/-0
      for (i = 0; i < setData.length; i += 1) {
        if (same(setData[i], key)) { return i; }
      }
      return -1;
    }

    // 23.2.1.2 new Set ( ... argumentsList )
    // 23.2.2 Properties of the Set Constructor

    // 23.2.2.1 Set.prototype
    Set.prototype = {};

    // 23.2.2.2 Set[ @@create ] ( )
    // 23.2.3 Properties of the Set Prototype Object

    // 23.2.3.1 Set.prototype.add (value )
    defineFunctionProperty(
      Set.prototype, 'add',
      function add(value) {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        if (!('__SetData__' in s)) throw new TypeError();
        if (s.__SetData__ === undefined) throw new TypeError();
        var entries = s.__SetData__;
        var same = (s._setComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        var i = indexOf(same, entries, value);
        if (i < 0) { i = this.__SetData__.length; }
        this.__SetData__[i] = value;

        return s;
      });

    // 23.2.3.2 Set.prototype.clear ()
    defineFunctionProperty(
      Set.prototype, 'clear',
      function clear() {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        if (!('__SetData__' in s)) throw new TypeError();
        if (s.__SetData__ === undefined) throw new TypeError();
        var entries = s.__SetData__;
        entries.length = 0;
        return undefined;
      });

    // 23.2.3.3 Set.prototype.constructor
    // 23.2.3.4 Set.prototype.delete ( value )
    defineFunctionProperty(
      Set.prototype, 'delete',
      function deleteFunction(value) {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        if (!('__SetData__' in s)) throw new TypeError();
        if (s.__SetData__ === undefined) throw new TypeError();
        var entries = s.__SetData__;
        var same = (s._setComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        var i = indexOf(same, entries, value);
        if (i < 0) { return false; }
        entries[i] = empty;
        return true;
      });

    // 23.2.3.5 Set.prototype.entries ( )
    defineFunctionProperty(
      Set.prototype, 'entries',
      function entries() {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        return CreateSetIterator(s, 'key+value');
      });

    // 23.2.3.6 Set.prototype.forEach ( callbackfn , thisArg = undefined )
    defineFunctionProperty(
      Set.prototype, 'forEach',
      function forEach(callbackfn/*, thisArg*/) {
        var thisArg = arguments[1];

        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        if (!('__SetData__' in s)) throw new TypeError();
        if (s.__SetData__ === undefined) throw new TypeError();
        var entries = s.__SetData__;

        if (!abstractOperation.IsCallable(callbackfn)) {
          throw new TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.length; ++i) {
          callbackfn.call(thisArg, entries[i], s);
        }
      });

    // 23.2.3.7 Set.prototype.has ( value )
    defineFunctionProperty(
      Set.prototype, 'has',
      function has(key) {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        if (!('__SetData__' in s)) throw new TypeError();
        if (s.__SetData__ === undefined) throw new TypeError();
        var entries = s.__SetData__;
        var same = (s._setComparator === undefined) ?
              abstractOperation.SameValueZero : abstractOperation.SameValue;
        return indexOf(same, entries, key) !== -1;
      });

    // 23.2.3.8 Set.prototype.keys ( )
    // 23.2.3.9 get Set.prototype.size
    Object.defineProperty(
      Set.prototype, 'size', {
        get: function() {
          var s = this;
          if (Type(s) !== 'object') throw new TypeError();
          if (!('__SetData__' in s)) throw new TypeError();
          if (s.__SetData__ === undefined) throw new TypeError();
          var entries = s.__SetData__;
          var count = 0;
          for (var i = 0; i < entries.length; ++i) {
            if (entries[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.2.3.10 Set.prototype.values ( )
    defineFunctionProperty(
      Set.prototype, 'values',
      function values() {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        return CreateSetIterator(s);
      });

    // 23.2.3.11 Set.prototype [@@iterator ] ( )
    defineFunctionProperty(
      Set.prototype, $$iterator,
      function() {
        var s = this;
        if (Type(s) !== 'object') throw new TypeError();
        return CreateSetIterator(s);
      });

    // 23.2.3.12 Set.prototype [ @@toStringTag ]
    Set.prototype[$$toStringTag] = 'Set';

    // 23.2.4 Properties of Set Instances
    // 23.2.5 Set Iterator Object Structure
    /** @constructor */
    function SetIterator(set, index) {
      this.set = set;
      this.nextIndex = index;
    }

    // 23.2.5.1 CreateSetIterator Abstract Operation
    function CreateSetIterator(set) {
      set = Object(set);
      return new SetIterator(set, 0);
    }

    // 23.2.5.2 The Set Iterator Prototype
    SetIterator.prototype = {};

    // 23.2.5.2.1 SetIterator.prototype.constructor
    // 23.2.5.2.2 SetIterator.prototype.next( )
    defineFunctionProperty(
      SetIterator.prototype, 'next',
      function next() {
        if (typeof this !== 'object') { throw new TypeError; }
        var s = this.set,
            index = this.nextIndex,
            entries = s.__SetData__;
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

    // 23.2.5.2.3 SetIterator.prototype.@@iterator ( )
    defineFunctionProperty(
      SetIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 23.2.5.2.4 SetIterator.prototype.@@toStringTag
    SetIterator.prototype[$$toStringTag] = 'Set Iterator';

    // 23.2.5.3 Properties of Set Iterator Instances

    global.Set = global.Set || Set;
  }());



  // ---------------------------------------
  // 23.3 WeakMap Objects
  // ---------------------------------------

  (function() {

    // 23.3.1 The WeakMap Constructor
    // 23.3.1.1 WeakMap (iterable = undefined )
   /** @constructor */
    function WeakMap(iterable) {
      var map = this;

     if (typeof map !== 'object') { throw new TypeError(); }
      if ('_table' in map) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = iterable[$$iterator](); // or throw...
        var adder = map['set'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      map._table = new EphemeronTable;
      if (iterable === undefined) {
        return map;
      }
      while (true) {
        var next = abstractOperation.IteratorNext(itr);
        var done = abstractOperation.IteratorComplete(next);
        if (done)
          return map;
        var nextValue = abstractOperation.IteratorValue(next);
        if (typeof nextValue !== 'object') { throw new TypeError(); }
        var k = nextValue[0];
        var vk = nextValue[1];
        adder.call(map, k, v);
      }

      return map;
    }

    // 23.3.1.2 new WeakMap ( ... argumentsList )
    // 23.3.2 Properties of the WeakMap Constructor
    // 23.3.2.1 WeakMap.prototype
    WeakMap.prototype = {};

    // 23.3.2.2 WeakMap[ @@create ] ( )
    // 23.3.3 Properties of the WeakMap Prototype Object

    // 23.3.3.1 WeakMap.prototype.clear ()
    defineFunctionProperty(
      WeakMap.prototype, 'clear',
      function clear() {
        this._table.clear();
      });

    // 23.3.3.2 WeakMap.prototype.constructor

    // 23.3.3.3 WeakMap.prototype.delete ( key )
    defineFunctionProperty(
      WeakMap.prototype, 'delete',
      function deleteFunction(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.remove(key);
      });

    // 23.3.3.4 WeakMap.prototype.get ( key )
    defineFunctionProperty(
      WeakMap.prototype, 'get',
      function get(key, defaultValue) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.get(key, defaultValue);
      });

    // 23.3.3.5 WeakMap.prototype.has ( key )
    defineFunctionProperty(
      WeakMap.prototype, 'has',
      function has(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.has(key);
      });

    // 23.3.3.6 WeakMap.prototype.set ( key , value )
    defineFunctionProperty(
      WeakMap.prototype, 'set',
      function set(key, value) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        this._table.set(key, value);
        return value;
      });

    // 23.3.3.7 WeakMap.prototype [ @@toStringTag ]
    WeakMap.prototype[$$toStringTag] = 'WeakMap';

    // 23.3.4 Properties of WeakMap Instances

    global.WeakMap = global.WeakMap || WeakMap;
  }());


  // ---------------------------------------
  // 23.4 WeakSet Objects
  // ---------------------------------------

  (function() {

    // 23.4.1 The WeakSet Constructor
    // 23.4.1.1 WeakSet (iterable = undefined)
    /** @constructor */
    function WeakSet(iterable) {
      var set = this;

      if (typeof set !== 'object') { throw new TypeError(); }
      if ('_table' in set) { throw new TypeError(); }

      if (iterable !== undefined) {
        iterable = Object(iterable);
        var itr = abstractOperation.HasProperty(iterable, 'values') ? iterable.values() : iterable[$$iterator](); // or throw...
        var adder = set['add'];
        if (!abstractOperation.IsCallable(adder)) { throw new TypeError(); }
      }
      set._table = new EphemeronTable;
      if (iterable === undefined) {
        return set;
      }
      while (true) {
        var next = abstractOperation.IteratorNext(itr);
        var done = abstractOperation.IteratorComplete(next);
        if (done)
          return set;
        var nextValue = abstractOperation.IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    // 23.4.1.2 new WeakSet ( ... argumentsList)
    // 23.4.2 Properties of the WeakSet Constructor
    // 23.4.2.1 WeakSet.prototype
    WeakSet.prototype = {};

    // 23.4.2.2 WeakSet [ @@create ] ( )
    // 23.4.3 Properties of the WeakSet Prototype Object
    // 23.4.3.1 WeakSet.prototype.add (value )
    defineFunctionProperty(
      WeakSet.prototype, 'add',
      function add(value) {
        if (value !== Object(value)) { throw new TypeError('Expected object'); }
        this._table.set(value, true);
        return value;
      });

    // 23.4.3.2 WeakSet.prototype.clear ()
    defineFunctionProperty(
      WeakSet.prototype, 'clear',
      function clear() {
        this._table.clear();
      });

    // 23.4.3.3 WeakSet.prototype.constructor
    // 23.4.3.4 WeakSet.prototype.delete ( value )
    defineFunctionProperty(
      WeakSet.prototype, 'delete',
      function deleteFunction(value) {
        if (value !== Object(value)) { throw new TypeError('Expected object'); }
        this._table.remove(value);
      });

    // 23.4.3.5 WeakSet.prototype.has ( value )
    defineFunctionProperty(
      WeakSet.prototype, 'has',
      function has(key) {
        if (key !== Object(key)) { throw new TypeError('Expected object'); }
        return this._table.has(key);
      });

    // 23.4.3.6 WeakSet.prototype [ @@toStringTag ]
    WeakSet.prototype[$$toStringTag] = 'WeakSet';

    // 23.4.4 Properties of WeakSet Instances

    global.WeakSet = global.WeakSet || WeakSet;
  }());

  // ---------------------------------------
  // 24 Structured Data
  // ---------------------------------------

  // ---------------------------------------
  // 24.1 ArrayBuffer Objects
  // ---------------------------------------

  // 24.1.1 Abstract Operations For ArrayBuffer Objects
  // 24.1.1.1 AllocateArrayBuffer(constructor)
  // 24.1.1.2 SetArrayBufferData(arrayBuffer, bytes)
  // 24.1.1.3 CloneArrayBuffer(srcBuffer, srcByteOffset, srcType,cloneElementType, srcLength).
  // 24.1.1.4 GetValueFromBuffer (arrayBuffer, byteIndex, type, isLittleEndian)
  // 24.1.1.5 SetValueInBuffer (arrayBuffer, byteIndex, type, value, isLittleEndian)
  // 24.1.2 The ArrayBuffer Constructor
  // 24.1.2.1 ArrayBuffer(length)
  // 24.1.2.2 new ArrayBuffer( ... argumentsList)
  // 24.1.3 Properties of the ArrayBuffer Constructor
  // 24.1.3.1 ArrayBuffer.isView ( arg )
  // 24.1.3.2 ArrayBuffer.prototype
  // 24.1.3.3 ArrayBuffer[ @@create ] ( )
  // 24.1.4 Properties of the ArrayBuffer Prototype Object
  // 24.1.4.1 get ArrayBuffer.prototype.byteLength
  // 24.1.4.2 ArrayBuffer.prototype.constructor
  // 24.1.4.3 ArrayBuffer.prototype.slice ( start , end)
  // 24.1.4.4 ArrayBuffer.prototype [ @@toStringTag ]
  ArrayBuffer.prototype[$$toStringTag] = 'ArrayBuffer';

  // 24.1.5 Properties of the ArrayBuffer Instances

  // See typedarray.js for TypedArray polyfill

  // TODO: ES6 extensions to TypedArrays

  // ---------------------------------------
  // 24.2 DataView Objects
  // ---------------------------------------

  // 24.2.1 Abstract Operations For DataView Objects
  // 24.2.1.1 GetViewValue(view, requestIndex, isLittleEndian, type)
  // 24.2.1.2 SetViewValue(view, requestIndex, isLittleEndian, type, value)
  // 24.2.2 The DataView Constructor
  // 24.2.2.1 DataView(buffer, byteOffset=0, byteLength=undefined)
  // 24.2.2.2 new DataView( ... argumentsList)
  // 24.2.3 Properties of the DataView Constructor
  // 24.2.3.1 DataView.prototype
  // 24.2.3.2 DataView [ @@create ] ( )
  // 24.2.4 Properties of the DataView Prototype Object
  // 24.2.4.1 get DataView.prototype.buffer
  // 24.2.4.2 get DataView.prototype.byteLength
  // 24.2.4.3 get DataView.prototype.byteOffset
  // 24.2.4.4 DataView.prototype.constructor
  // 24.2.4.5 DataView.prototype.getFloat32(byteOffset, littleEndian=false)
  // 24.2.4.6 DataView.prototype.getFloat64(byteOffset, littleEndian=false)
  // 24.2.4.7 DataView.prototype.getInt8(byteOffset)
  // 24.2.4.8 DataView.prototype.getInt16(byteOffset, littleEndian=false)
  // 24.2.4.9 DataView.prototype.getInt32(byteOffset, littleEndian=false)
  // 24.2.4.10 DataView.prototype.getUint8(byteOffset)
  // 24.2.4.11 DataView.prototype.getUint16(byteOffset, littleEndian=false)
  // 24.2.4.12 DataView.prototype.getUint32(byteOffset, littleEndian=false)
  // 24.2.4.13 DataView.prototype.setFloat32(byteOffset, value, littleEndian=false)
  // 24.2.4.14 DataView.prototype.setFloat64(byteOffset, value, littleEndian=false)
  // 24.2.4.15 DataView.prototype.setInt8(byteOffset, value)
  // 24.2.4.16 DataView.prototype.setInt16(byteOffset, value, littleEndian=false)
  // 24.2.4.17 DataView.prototype.setInt32(byteOffset, value, littleEndian=false)
  // 24.2.4.18 DataView.prototype.setUint8(byteOffset, value)
  // 24.2.4.19 DataView.prototype.setUint16(byteOffset, value, littleEndian=false)
  // 24.2.4.20 DataView.prototype.setUint32(byteOffset, value, littleEndian=false)
  // 24.2.4.21 DataView.prototype[ @@toStringTag ]
  DataView.prototype[$$toStringTag] = 'DataView';
  // 24.2.5 Properties of DataView Instances

  // See typedarray.js for TypedArray polyfill

  // TODO: ES6 extensions to TypedArrays

  // ---------------------------------------
  // 24.3 The JSON Object
  // ---------------------------------------

  // 24.3.1 The JSON Grammar
  // 24.3.1.1 The JSON Lexical Grammar
  // 24.3.1.2 The JSON Syntactic Grammar
  // 24.3.2 JSON.parse ( text [ , reviver ] )
  // 24.3.3 JSON.stringify ( value [ , replacer [ , space ] ] )

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 25 The "std:iteration" Module
  // ---------------------------------------

  // 25.1 Common Iteration Interfaces
  // 25.1.1 The Iterable Iterface
  // 25.1.2 The Iterator Iterface
  // 25.1.3 The ItrResult Iterface

  // ---------------------------------------
  // 25.2 "std:iteration" Exports
  // ---------------------------------------

  // ---------------------------------------
  // 25.3 GeneratorFunction Objects
  // ---------------------------------------

  // 25.3.1 The GeneratorFunction Constructor
  // 25.3.1.1 GeneratorFunction (p1, p2, … , pn, body)
  // 25.3.1.2 new GeneratorFunction ( ... argumentsList)
  // 25.3.2 Properties of the GeneratorFunction Constructor
  // 25.3.2.1 GeneratorFunction.length
  // 25.3.2.2 GeneratorFunction.prototype
  // 25.3.2.3 GeneratorFunction[ @@create ] ( )
  // 25.3.3 Properties of the GeneratorFunction Prototype Object
  // 25.3.3.1 GeneratorFunction.prototype.constructor
  // 25.3.3.2 GeneratorFunction.prototype.prototype
  // 25.3.3.3 GeneratorFunction.prototype [ @@toStringTag ]
  // 25.3.3.4 GeneratorFunction.prototype [ @@create ] ( )
  // 25.3.4 GeneratorFunction Instances
  // 25.3.4.1 length
  // 25.3.4.2 prototype

  // ---------------------------------------
  // 25.4 Generator Objects
  // ---------------------------------------

  // 25.4.1 Properties of Generator Prototype
  // 25.4.1.1 Generator.prototype.constructor
  // 25.4.1.2 Generator.prototype.next ( value )
  // 25.4.1.3 Generator.prototype.throw ( exception )
  // 25.4.1.4 Generator.prototype [ @@iterator ] ( )
  // 25.4.1.5 Generator.prototype [ @@toStringTag ]
  // 25.4.2 Properties of Generator Instances
  // 25.4.3 Iteration Related Abstract Operations
  // 25.4.3.1 GeneratorStart (generator, generatorBody)
  // 25.4.3.2 GeneratorResume ( generator, value )
  // 25.4.3.3 GeneratorYield ( itrNextObj )

  // 25.4.3.4 CreateItrResultObject (value, done)
  abstractOperation.CreateItrResultObject = function(value, done) {
    assert(Type(done) === 'boolean');
    var obj = {};
    obj["value"] = value;
    obj["done"] = done;
    return obj;
  };

  // 25.4.3.5 GetIterator ( obj )
  abstractOperation.GetIterator = function(obj) {
    var iterator = obj[$$iterator]();
    if (Type(iterator) !== object) throw new TypeError();
    return iterator;
  };

  // 25.4.3.6 IteratorNext ( iterator, value )
  abstractOperation.IteratorNext = function(iterator, value) {
    var result = iterator.next(value);
    if (Type(result) !== 'object') throw new TypeError();
    return result;
  };

  // 25.4.3.7 IteratorComplete ( itrResult )
  abstractOperation.IteratorComplete = function(itrResult) {
    assert(Type(itrResult) === 'object');
    return Boolean(itrResult.done);
  };

  // 25.4.3.8 IteratorValue ( itrResult )
  abstractOperation.IteratorValue = function(itrResult) {
    assert(Type(itrResult) === 'object');
    return itrResult.value;
  };

  // 25.4.3.9 CreateEmptyIterator ( )

  // ---------------------------------------
  // 26 The Reflect Module
  // ---------------------------------------

  // 26.1 Exported Function Properties Reflecting the Essentional Internal Methods

  (function() {

    var Reflect = {};

    // 26.1.1 Reflect.defineProperty(target, propertyKey, attributes)
    defineFunctionProperty(
      Reflect, 'defineProperty',
      Object.defineProperty);

    // 26.1.2 Reflect.deleteProperty (target, propertyKey)
    defineFunctionProperty(
      Reflect, 'deleteProperty',
      function deleteProperty(target,name) {
        delete target[name];
      });

    // 26.1.3 Reflect.enumerate (target)
    defineFunctionProperty(
      Reflect, 'enumerate',
      function enumerate(target) {
        target = Object(target);
        return new PropertyIterator(target);
      });

    // 26.1.4 Reflect.get (target, propertyKey, receiver=target)
    defineFunctionProperty(
      Reflect, 'get',
      function get(target,name,receiver) {
        target = Object(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : Object(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('get' in desc) {
          return Function.prototype.call.call(desc['get'], receiver);
        }
        return target[name];
      });

    // 26.1.5 Reflect.getOwnPropertyDescriptor(target, propertyKey)
    defineFunctionProperty(
      Reflect, 'getOwnPropertyDescriptor',
      Object.getOwnPropertyDescriptor);

    // 26.1.6 Reflect.getPrototypeOf (target)
    defineFunctionProperty(
      Reflect, 'getPrototypeOf',
      Object.getPrototypeOf);

    // 26.1.7 Reflect.has (target, propertyKey)
    defineFunctionProperty(
      Reflect, 'has',
      function has(target,name) {
        return String(name) in Object(target);
      });

    // 26.1.8 Reflect.hasOwn (target, propertyKey)
    defineFunctionProperty(
      Reflect, 'hasOwn',
      function hasOwn(target,name) {
        return Object(target).hasOwnProperty(String(name));
      });

    // 26.1.9 Reflect.isExtensible (target)
    defineFunctionProperty(
      Reflect, 'isExtensible',
      Object.isExtensible);

    // 26.1.10 Reflect.invoke (target, propertyKey, argumentsList, receiver=target)

    // TODO: Implement

    // 26.1.11 Reflect.ownKeys (target)

    // TODO: Implement

    // 26.1.12 Reflect.preventExtensions (target)
    defineFunctionProperty(
      Reflect, 'preventExtensions',
      function preventExtensions(target) {
        try { Object.preventExtensions(target); return true; } catch (e) { return false; }
      });

    // 26.1.13 Reflect.set (target, propertyKey, V, receiver=target)
    defineFunctionProperty(
      Reflect, 'set',
      function set(target,name,value,receiver) {
        target = Object(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : Object(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('set' in desc) {
          return Function.prototype.call.call(desc['set'], receiver, value);
        }
        return target[name] = value;
      });

    // 26.1.14 Reflect.setPrototypeOf (target, proto)
    defineFunctionProperty(
      Reflect, 'setPrototypeOf',
      function setPrototypeOf(target, proto) {
        target.__proto__ = proto;
      });



    // TODO: What happened to these? (Removed in 9/5/13 draft or earlier)

    defineFunctionProperty(
      Reflect, 'getOwnPropertyNames',
      Object.getOwnPropertyNames);
    defineFunctionProperty(
      Reflect, 'freeze',
      function freeze(target) {
        try { Object.freeze(target); return true; } catch (e) { return false; }
      });
    defineFunctionProperty(
      Reflect, 'seal',
      function seal(target) {
        try { Object.seal(target); return true; } catch (e) { return false; }
      });
    defineFunctionProperty(
      Reflect, 'isFrozen',
      Object.isFrozen);
    defineFunctionProperty(
      Reflect, 'isSealed',
      Object.isSealed);
    defineFunctionProperty(
      Reflect, 'instanceOf',
      function instanceOf(target, O) {
        return target instanceof O;
      });
    defineFunctionProperty(
      Reflect, 'keys',
      Object.keys);
    defineFunctionProperty(
      Reflect, 'apply',
      function apply(target,thisArg,args) {
        return Function.prototype.apply.call(target, thisArg, args);
      });
    defineFunctionProperty(
      Reflect, 'construct',
      function construct(target, args) {
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
      function next() {
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

  // ---------------------------------------
  // 26.2 Proxy Objects
  // ---------------------------------------

  // Not polyfillable.

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
      if (this === undefined || this === null) { throw new TypeError(); }
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
      function next() {
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
      function next() {
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
      func(abstractOperation.IteratorValue(result));
    }
  }
  global.forOf = forOf; // Since for( ... of ... ) can't be shimmed w/o a transpiler.

}(self));
