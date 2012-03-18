//----------------------------------------------------------------------
//
// ECMAScript "Harmony" Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  "use strict";

  // Approximations of internal ECMAScript functions
  var ECMAScript = (function () {
    var ophop = Object.prototype.hasOwnProperty,
        floor = Math.floor,
        abs = Math.abs;
    return {
      HasProperty: function (o, p) { return p in o; },
      HasOwnProperty: function (o, p) { return ophop.call(o, p); },
      IsCallable: function (o) { return typeof o === 'function'; },
      ToInteger: function (n) {
        n = Number(n);
        if (isNaN(n)) { return 0; }
        if (n === 0 || n === Infinity || n === -Infinity) { return n; }
        return ((n < 0) ? -1 : 1) * floor(abs(n));
      },
      ToInt32: function (v) { return v >> 0; },
      ToUint32: function (v) { return v >>> 0; },
      SameValue: function (x, y) {
        if (typeof x !== typeof y) {
          return false;
        }
        switch (typeof x) {
        case 'undefined':
          return true;
        case 'null':
          return true;
        case 'number':
          if (isNaN(x) && isNaN(y)) { return true; }
          if (x === 0 && y === 0) { return 1/x === 1/y; }
          return x === y;
        case 'boolean':
        case 'string':
        case 'object':
        default:
          return x === y;
        }
      }
    };
  }());


  //----------------------------------------------------------------------
  //
  // Tentatively approved proposals
  // http://wiki.ecmascript.org/doku.php?id=harmony:proposals
  //
  //----------------------------------------------------------------------

  //----------------------------------------
  // Identity Testing
  //----------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=harmony:egal
  if (!Object.is) {
    Object.defineProperty(
      Object,
      'is',
      {
        value: function (x, y) {
          return ECMAScript.SameValue(x, y);
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  if (!Object.isnt) {
    Object.defineProperty(
      Object,
      'isnt',
      {
        value: function isnt(x, y) {
          return !ECMAScript.SameValue(x, y);
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }


  //----------------------------------------
  // Number improvements
  //----------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isfinite
  if (!Number.isFinite) {
    (function () {
      var global_isFinite = global.isFinite;
      Object.defineProperty(
        Number,
        'isFinite',
        {
          value: function isFinite(value) {
            return typeof value === 'number' && global_isFinite(value);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isnan
  if (!Number.isNaN) {
    Object.defineProperty(
      Number,
      'isNaN',
      {
        value: function isNaN(value) {
          return typeof value === 'number' && value !== value;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:number.isinteger
  if (!Number.isInteger) {
    (function () {
      var isFinite = global.isFinite;

      Object.defineProperty(
        Number,
        'isInteger',
        {
          value: function isInteger(value) {
            return typeof value === 'number' && isFinite(value) && value === ECMAScript.ToInteger(value);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:number.tointeger
  if (!Number.toInteger) {
    Object.defineProperty(
      Number,
      'toInteger',
      {
        value: function toInteger(value) {
          return ECMAScript.ToInteger(value);
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }


  //----------------------------------------
  // String improvements
  //----------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=harmony:string.prototype.repeat
  if (!String.prototype.repeat) {

    Object.defineProperty(
      String.prototype,
      'repeat',
      {
        value: function (count) {
          // var string = '' + this;
          // count = ECMAScript.ToInteger(count);
          // var result = ';
          // while (--count >= 0) {
          //     result += string;
          // }
          // return result;
          count = ECMAScript.ToInteger(count);
          var a = [];
          a.length = count + 1;
          return a.join(String(this));
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  if (!String.prototype.startsWith) {
    Object.defineProperty(
      String.prototype,
      'startsWith',
      {
        value: function startsWith(s) {
          s = String(s);
          return String(this).substring(0, s.length) === s;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  if (!String.prototype.endsWith) {
    Object.defineProperty(
      String.prototype,
      'endsWith',
      {
        value: function endsWith(s) {
          s = String(s);
          var t = String(this);
          return t.substring(t.length - s.length) === s;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  if (!String.prototype.contains) {
    Object.defineProperty(
      String.prototype,
      'contains',
      {
        value: function contains(searchString, position) {
          return String(this).indexOf(searchString, position) !== -1;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:string_extras
  if (!String.prototype.toArray) {
    Object.defineProperty(
      String.prototype,
      'toArray',
      {
        value: function toArray() {
          return String(this).split('');
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }


  //----------------------------------------
  // Math improvements
  //----------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.log10) {
    (function () {
      var log = Math.log,
          LOG10E = Math.LOG10E;

      Object.defineProperty(
        Math,
        'log10',
        {
          value: function log10(x) {
            x = Number(x);
            return log(x) * LOG10E;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.log2) {
    (function () {
      var log = Math.log,
          LOG2E = Math.LOG2E;

      Object.defineProperty(
        Math,
        'log2',
        {
          value: function log2(x) {
            x = Number(x);
            return log(x) * LOG2E;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.log1p) {
    (function () {
      var log = Math.log,
          abs = Math.abs;

      Object.defineProperty(
        Math,
        'log1p',
        {
          value: function log1p(x) {
            x = Number(x);
            // from: http://www.johndcook.com/cpp_expm1.html
            if (x <= -1) {
              return -Infinity;
            } else if (ECMAScript.SameValue(x, -0)) {
              return -0;
            } else if (abs(x) > 1e-4) {
              return log(1 + x);
            } else {
              return (-0.5 * x + 1) * x;
            }
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.expm1) {
    (function () {
      var exp = Math.exp,
          abs = Math.abs;

      Object.defineProperty(
        Math,
        'expm1',
        {
          value: function expm1(x) {
            x = Number(x);
            // from: http://www.johndcook.com/cpp_log1p.html
            if (ECMAScript.SameValue(x, -0)) {
              return -0;
            } else if (x === -Infinity) {
              return 1;
            } else if (abs(x) < 1e-5) {
              return x + 0.5 * x * x; // two terms of Taylor expansion
            } else {
              return exp(x) - 1;
            }
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.cosh) {
    (function () {
      var pow = Math.pow,
          E = Math.E;

      Object.defineProperty(
        Math,
        'cosh',
        {
          value: function cosh(x) {
            x = Number(x);
            return (pow(E, x) + pow(E, -x)) / 2;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.sinh) {
    (function () {
      var pow = Math.pow,
          E = Math.E;

      Object.defineProperty(
        Math,
        'sinh',
        {
          value: function sinh(x) {
            x = Number(x);
            return ECMAScript.SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.tanh) {
    (function () {
      var pow = Math.pow,
          E = Math.E;

      Object.defineProperty(
        Math,
        'tanh',
        {
          value: function tanh(x) {
            x = Number(x);
            var n = pow(E, 2 * x) - 1,
                d = pow(E, 2 * x) + 1;
            return (n === d) ? 1 : n / d; // Handle Infinity/Infinity
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.acosh) {
    (function () {
      var log = Math.log,
          sqrt = Math.sqrt;

      Object.defineProperty(
        Math,
        'acosh',
        {
          value: function acosh(x) {
            x = Number(x);
            return log(x + sqrt(x * x - 1));
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.asinh) {
    (function () {
      var log = Math.log,
          sqrt = Math.sqrt;

      Object.defineProperty(
        Math,
        'asinh',
        {
          value: function asinh(x) {
            x = Number(x);
            if (ECMAScript.SameValue(x, -0)) {
              return x;
            }
            var s = sqrt(x * x + 1);
            return (s === -x) ? log(0) : log(x + s);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.atanh) {
    (function () {
      var log = Math.log;

      Object.defineProperty(
        Math,
        'atanh',
        {
          value: function atanh(x) {
            x = Number(x);
            return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.hypot) {
    (function () {
      var sqrt = Math.sqrt,
          abs = Math.abs,
          max = Math.max;

      Object.defineProperty(
        Math,
        'hypot',
        {
          value: function hypot(x, y /*...*/) {
            var tmp, m, i, as = [], s = 0, len = arguments.length;
            for (i = 0; i < len; ++i) {
              as[i] = abs(arguments[i]);
              if (as[i] === Infinity)
                return Infinity;
            }
            m = max.apply(null, as);
            if (isNaN(m) || m === 0) {
              return m;
            }
            for (i = 0; i < len; ++i) {
              tmp = as[i] / m;
              s += tmp * tmp;
            }
            return m * sqrt(s);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.hypot2) {
    (function () {
      var sqrt = Math.sqrt,
          abs = Math.abs,
          max = Math.max;

      Object.defineProperty(
        Math,
        'hypot2',
        {
          value: function hypot2(x, y /*...*/) {
            var t, s = 0, i, len = arguments.length;
            for (i = 0; i < len; ++i) {
              t = abs(arguments[i]);
              if (t === Infinity)
                return Infinity;
              s += t * t;
            }
            return s;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.trunc) {
    (function () {
      var ceil = Math.ceil,
          floor = Math.floor;
      Object.defineProperty(
        Math,
        'trunc',
        {
          value: function trunc(x) {
            x = Number(x);
            return isNaN(x) ? NaN :
              x < 0 ? ceil(x) : floor(x);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=harmony:more_math_functions
  if (!Math.sign) {
    (function () {
      Object.defineProperty(
        Math,
        'sign',
        {
          value: function sign(x) {
            x = Number(x);
            return x < 0 ? -1 : x > 0 ? 1 : x;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }


  //----------------------------------------
  // Collections: Maps, Sets, and WeakMaps
  //----------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets
  /** @constructor */
  global.Map = global.Map || function Map() {
    if (!(this instanceof Map)) { return new Map(); }
    var keys = [], vals = [];
    function indexOfIdentical(keys, key) {
      var i;
      for (i = 0; i < keys.length; i += 1) {
        if (ECMAScript.SameValue(keys[i], key)) { return i; }
      }
      return -1;
    }
    Object.defineProperties(
      this,
      {
        'get': {
          value: function get(key) {
            var i = indexOfIdentical(keys, key);
            return i < 0 ? undefined : vals[i];
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'has': {
          value: function has(key) {
            return indexOfIdentical(keys, key) >= 0;
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'set': {
          value: function set(key, val) {
            var i = indexOfIdentical(keys, key);
            if (i < 0) { i = keys.length; }
            keys[i] = key;
            vals[i] = val;
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'delete': {
          value: function deleteFunction(key) {
            var i = indexOfIdentical(keys, key);
            if (i < 0) { return false; }
            keys.splice(i, 1);
            vals.splice(i, 1);
            return true;
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'clear': {
          value: function clear() {
            keys.length = 0;
            vals.length = 0;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      }
    );
    return this;
  };

  /** @constructor */
  global.Set = global.Set || function Set() {
    if (!(this instanceof Set)) { return new Set(); }
    var map = new global.Map();

    Object.defineProperties(
      this,
      {
        'has': {
          value: function has(key) { return map.has(key); },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'add': {
          value: function add(key) { map.set(key, true); },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'delete': {
          // es-discuss is waffling on remove vs. delete
          value: function remove(key) { return map['delete'](key); },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'clear': {
          value: function clear() { map.clear(); },
          configurable: true,
          enumerable: false,
          writable: true
        }
      }
    );
    return this;
  };

  // Inspired by https://gist.github.com/1638059
  // http://wiki.ecmascript.org/doku.php?id=harmony:weak_maps
  /** @constructor */
  global.WeakMap = global.WeakMap || function WeakMap() {
    if (!(this instanceof WeakMap)) { return new WeakMap(); }

    var unique = {};

    function conceal(o) {
      var oValueOf = o.valueOf, secrets = {};
      o.valueOf = function (k) {
        return (k === unique) ? secrets : oValueOf.apply(o, arguments);
      };
      return secrets;
    }

    function reveal(o) {
      var v = o.valueOf(unique);
      return v === o ? null : v;
    }

    Object.defineProperties(
      this,
      {
        'get': {
          value: function get(key, defaultValue) {
            key = Object(key);
            var secrets = reveal(key);
            return (secrets && ECMAScript.HasOwnProperty(secrets, 'value')) ? secrets.value : defaultValue;
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'set': {
          value: function set(key, value) {
            key = Object(key);
            var secrets = reveal(key) || conceal(key);
            secrets.value = value;
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'has': {
          value: function has(key) {
            key = Object(key);
            var secrets = reveal(key);
            return Boolean(secrets && ECMAScript.HasOwnProperty(secrets, 'value'));
          },
          configurable: true,
          enumerable: false,
          writable: true
        },
        'delete': {
          value: function deleteFunction(key) {
            key = Object(key);
            var secrets = reveal(key);
            if (secrets) {
              delete secrets.value;
            }
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      });
    return this;
  };


  //----------------------------------------------------------------------
  //
  // ECMAScript Strawman Proposals
  //
  //----------------------------------------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_compare
  if (!Number.prototype.compare) {
    (function () {
      var abs = Math.abs;
      Object.defineProperty(
        Number,
        'compare',
        {
          value: function compare(first, second, tolerance) {
            var difference = first - second;
            return abs(difference) <= (tolerance || 0) ? 0 : difference < 0 ? -1 : 1;
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_epsilon
  if (!Number.EPSILON) {
    Object.defineProperty(
      Number,
      'EPSILON',
      {
        value: (function () {
          var next, result;
          for (next = 1; 1 + next !== 1; next = next / 2) {
            result = next;
          }
          return result;
        }()),
        configurable: false,
        enumerable: false,
        writable: false
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_max_integer
  if (!Number.MAX_INTEGER) {
    Object.defineProperty(
      Number,
      'MAX_INTEGER',
      {
        // TODO: Some debate about 2^53 vs. 2^53 - 1
        value: 9007199254740992, // 2^53
        configurable: false,
        enumerable: false,
        writable: false
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  if (!Array.of) {
    Object.defineProperty(
      Array,
      'of',
      {
        value: function of() {
          return Array.from(arguments);
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=strawman:array_extras
  if (!Array.from) {
    Object.defineProperty(
      Array,
      'from',
      {
        value: function from(o) {
          o = Object(o);
          var i, length = ECMAScript.ToUint32(o.length), result = [];
          for (i = 0; i < length; i += 1) {
            result[i] = o[i];
          }
          return result;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://wiki.ecmascript.org/doku.php?id=strawman:array.prototype.pushall
  if (!Array.prototype.pushAll) {
    Object.defineProperty(
      Array.prototype,
      'pushAll', {
        value: function pushAll(other, start, end) {
          other = Object(other);
          if (typeof start === 'undefined') {
            start = 0;
          }
          start = ECMAScript.ToUint32(start);
          var otherLength = ECMAScript.ToUint32(other.length);
          if (typeof end === 'undefined') {
            end = otherLength;
          }
          end = ECMAScript.ToUint32(end);
          var self = Object(this);
          var length = ECMAScript.ToUint32(self.length);
          for (var i = 0, j = length; i < end; i++, j++) {
            self[j] = other[i];
          }
          self.length = j;
          return;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // es-discuss: DOMStringList replacement
  if (!Array.prototype.contains) {
    Object.defineProperty(
      Array.prototype,
      'contains', {
        value: function (target) {
          if (this === void 0 || this === null) { throw new TypeError(); }
          var t = Object(this),
              len = ECMAScript.ToUint32(t.length),
              i;
          for (i = 0; i < len; i += 1) {
            if (i in t && ECMAScript.SameValue(t[i], target)) {
              return true;
            }
          }
          return false;
        },
        configurable: true,
        enumerable: false,
        writable: true
      }
    );
  }

  // http://norbertlindenberg.com/2012/03/ecmascript-supplementary-characters/index.html
  if (!String.fromCodePoint) {
    (function () {
      var floor = Math.floor;
      Object.defineProperty(
        String,
        'fromCodePoint', {
          value: function () {
            var chars = [], i;
            for (i = 0; i < arguments.length; i++) {
              var c = Number(arguments[i]);
              if (!isFinite(c) || c < 0 || c > 0x10FFFF || floor(c) !== c) {
                throw new RangeError("Invalid code point " + c);
              }
              if (c < 0x10000) {
                chars.push(c);
              } else {
                c -= 0x10000;
                chars.push((c >> 10) + 0xD800);
                chars.push((c % 0x400) + 0xDC00);
              }
            }
            return String.fromCharCode.apply(undefined, chars);
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

  // http://norbertlindenberg.com/2012/03/ecmascript-supplementary-characters/index.html
  if (!String.prototype.codePointAt) {
    Object.defineProperty(
      String.prototype,
      'codePointAt', {
        value: function (index) {
          var str = String(this);
          var first = str.charCodeAt(index);
          if (first >= 0xD800 && first <= 0xDBFF && str.length > index + 1) {
            var second = str.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF) {
              return ((first - 0xD800) << 10) + (second - 0xDC00) + 0x10000;
            }
          }
          return first;
        }
      }
    );
  }

    // https://mail.mozilla.org/pipermail/es-discuss/2012-March/021196.html
  if (!Math.cbrt) {
    (function () {
      var pow = Math.pow,
          abs = Math.abs;

      Object.defineProperty(
        Math,
        'cbrt',
        {
          value: function sign(x) {
            x = Number(x);
            if (isNaN(x/x)) {
              return x;
            }
            var r = pow( abs(x), 1/3 );
            var t = x/r/r;
            return r + (r * (t-r) / (2*r + t));
          },
          configurable: true,
          enumerable: false,
          writable: true
        }
      );
    }());
  }

}(self));
