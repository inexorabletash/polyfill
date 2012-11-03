//----------------------------------------------------------------------
//
// ECMAScript "Harmony" Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  "use strict";

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

  // Approximations of internal ECMAScript functions
  var ECMAScript = (function () {
    var ophop = Object.prototype.hasOwnProperty;
    return {
      HasProperty: function (o, p) { return p in o; },
      HasOwnProperty: function (o, p) { return ophop.call(o, p); },
      IsCallable: function (o) { return typeof o === 'function'; },
      IsConstructor: function (o) { return typeof o === 'function'; }, // TODO: Define
      ToInteger: function (n) {
        n = Number(n);
        if (global_isNaN(n)) { return 0; }
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
          if (global_isNaN(x) && global_isNaN(y)) { return true; }
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

  // Helpers

  function hook(o, p, f) {
    var op = o[p];
    if (typeof op !== 'function') { throw new TypeError("Not a function"); }
    o[p] = function() {
      var r = f.apply(this, arguments);
      return r !== (void 0) ? r : op.apply(this, arguments);
    };
  }

  function brand(t, s) {
    hook(Object.prototype, 'toString', function() {
      return (this instanceof t) ? '[object ' + s + ']' : (void 0);
    });
  }

  function defineFunction(o, p, f) {
    if (!(p in o)) {
      Object.defineProperty(o, p, {
        value: f,
        configurable: true,
        enumerable: false,
        writable: true
      });
    }
  }

  function defineConstant(o, p, c) {
    if (!(p in o)) {
      Object.defineProperty(o, p, {
        value: c,
        configurable: false,
        enumerable: false,
        writable: false
      });
    }
  }


  //----------------------------------------------------------------------
  //
  // ECMAScript 6 Draft
  // http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
  //
  //----------------------------------------------------------------------

  // NOTE: Since true iterators can't be polyfilled, this is a hack
  global.StopIteration = global.StopIteration || (function () {
    function StopIterationClass() {}
    brand(StopIterationClass, 'StopIteration');
    return new StopIterationClass;
  }());


  //----------------------------------------
  // Properties of the Object Constructor
  //----------------------------------------

  // TODO: Make sure these get added as functions, not just operators.
  defineFunction(
    Object, 'is',
    function is(x, y) {
      return ECMAScript.SameValue(x, y);
    });

  // TODO: Make sure these get added as functions, not just operators.
  defineFunction(
    Object, 'isnt',
    function isnt(x, y) {
      return !ECMAScript.SameValue(x, y);
    });

  defineFunction(
    Object, 'assign',
    function assign(target, source) {
      target = Object(target);
      source = Object(source);
      Object.keys(source).forEach(function(key) {
        target[key] = source[key];
      });
      return target;
    });

  // Removed from latest ES6 drafts
  if (false) {
    defineFunction(
      Object, 'isObject',
      function isObject(o) {
        var t = typeof o;
        return t !== 'undefined' && t !== 'boolean' && t !== 'number' && t !== 'string' && o !== null;
      });
  }

  //----------------------------------------
  // Properties of the Number Constructor
  //----------------------------------------

  defineConstant(
    Number, 'EPSILON',
    (function () {
      var next, result;
      for (next = 1; 1 + next !== 1; next = next / 2) {
        result = next;
      }
      return result;
    }()));

  defineConstant(
    Number, 'MAX_INTEGER',
    9007199254740991); // 2^53 - 1

  defineFunction(
    Number, 'parseFloat',
    function parseFloat(string) {
      return global_parseFloat(string);
    });

  defineFunction(
    Number,
    'parseInt',
    function parseInt(string) {
      return global_parseInt(string);
    });

  defineFunction(
    Number, 'isFinite',
    function isFinite(value) {
      return typeof value === 'number' && global_isFinite(value);
    });

  defineFunction(
    Number, 'isNaN',
    function isNaN(value) {
      return typeof value === 'number' && global_isNaN(value);
    });

  defineFunction(
    Number, 'isInteger',
    function isInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      var integer = ECMAScript.ToInteger(number);
      if (integer !== number) {
        return false;
      }
      return true;
    });

  defineFunction(
    Number, 'toInt',
    function toInt(value) {
      return ECMAScript.ToInteger(value);
    });


  //----------------------------------------
  // Properties of the Number Prototype Object
  //----------------------------------------

  defineFunction(
    Number.prototype, 'clz',
    function clz() {

      function clz8(x) {
        return (x & 0xf0) ? (x & 0x80 ? 0 : x & 0x40 ? 1 : x & 0x20 ? 2 : 3) :
        (x & 0x08 ? 4 : x & 0x04 ? 5 : x & 0x02 ? 6 : x & 0x01 ? 7 : 8);
      }

      var x = Number(this);
      x = ECMAScript.ToUint32(x);
      return x & 0xff000000 ? clz8(x >> 24) :
        x & 0xff0000 ? clz8(x >> 16) + 8 :
        x & 0xff00 ? clz8(x >> 8) + 16 : clz8(x) + 24;
    });


  //----------------------------------------
  // Properties of the String Prototype Object
  //----------------------------------------

  defineFunction(
    String.prototype, 'repeat',
    function repeat(count) {
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
    });

  defineFunction(
    String.prototype, 'startsWith',
    function startsWith(s) {
      s = String(s);
      return String(this).substring(0, s.length) === s;
    });

  defineFunction(
    String.prototype, 'endsWith',
    function endsWith(s) {
      s = String(s);
      var t = String(this);
      return t.substring(t.length - s.length) === s;
    });

  defineFunction(
    String.prototype, 'contains',
    function contains(searchString, position) {
      return String(this).indexOf(searchString, position) !== -1;
    });


  //----------------------------------------
  // Function Properties of the Math Object
  //----------------------------------------

  defineFunction(
    Math, 'log10',
    function log10(x) {
      x = Number(x);
      return log(x) * LOG10E;
    });

  defineFunction(
    Math, 'log2',
    function log2(x) {
      x = Number(x);
      return log(x) * LOG2E;
    });

  defineFunction(
    Math, 'log1p',
    function log1p(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_expm1.html
      if (x < -1) {
        return NaN;
      } else if (ECMAScript.SameValue(x, -0)) {
        return -0;
      } else if (abs(x) > 1e-4) {
        return log(1 + x);
      } else {
        return (-0.5 * x + 1) * x;
      }
    });

  defineFunction(
    Math, 'expm1',
    function expm1(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_log1p.html
      if (ECMAScript.SameValue(x, -0)) {
        return -0;
      } else if (abs(x) < 1e-5) {
        return x + 0.5 * x * x; // two terms of Taylor expansion
      } else {
        return exp(x) - 1;
      }
    });

  defineFunction(
    Math, 'cosh',
    function cosh(x) {
      x = Number(x);
      return (pow(E, x) + pow(E, -x)) / 2;
    });

  defineFunction(
    Math, 'sinh',
    function sinh(x) {
      x = Number(x);
      return ECMAScript.SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
    });

  defineFunction(
    Math, 'tanh',
    function tanh(x) {
      x = Number(x);
      var n = pow(E, 2 * x) - 1,
          d = pow(E, 2 * x) + 1;
      return ECMAScript.SameValue(x, -0) ? x : (n === d) ? 1 : n / d; // Handle Infinity/Infinity
    });

  defineFunction(
    Math, 'acosh',
    function acosh(x) {
      x = Number(x);
      return log(x + sqrt(x * x - 1));
    });

  defineFunction(
    Math, 'asinh',
    function asinh(x) {
      x = Number(x);
      if (ECMAScript.SameValue(x, -0)) {
        return x;
      }
      var s = sqrt(x * x + 1);
      return (s === -x) ? log(0) : log(x + s);
    });

  defineFunction(
    Math, 'atanh',
    function atanh(x) {
      x = Number(x);
      return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
    });

  defineFunction(
    Math, 'hypot',
    function hypot(x, y, z) {
      function isInfinite(x) { return x === Infinity || x === -Infinity; }
      if (arguments.length < 3) {
        x = Number(x);
        y = Number(y);
        if (isInfinite(x) || isInfinite(y)) {
          return Infinity;
        }
        if (global_isNaN(x) || global_isNaN(y)) {
          return NaN;
        }
        return sqrt(x*x + y*y);
      } else {
        x = Number(x);
        y = Number(y);
        z = Number(z);
        if (isInfinite(x) || isInfinite(y) || isInfinite(z)) {
          return Infinity;
        }
        if (global_isNaN(x) || global_isNaN(y) || global_isNaN(z)) {
          return NaN;
        }
        return sqrt(x*x + y*y + z*z);
      }
    });

  defineFunction(
    Math, 'trunc',
    function trunc(x) {
      x = Number(x);
      return global_isNaN(x) ? NaN :
        x < 0 ? ceil(x) : floor(x);
    });

  defineFunction(
    Math, 'sign',
    function sign(x) {
      x = Number(x);
      return x < 0 ? -1 : x > 0 ? 1 : x;
    });

  defineFunction(
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


  //----------------------------------------
  // Properties of the Array Constructor
  //----------------------------------------

  defineFunction(
    Array, 'of',
    function of() {
      var items = arguments;
      var lenValue = items.length;
      var len = ECMAScript.ToUint32(lenValue);
      var c = this, a;
      if (ECMAScript.IsConstructor(c)) {
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

  defineFunction(
    Array, 'from',
    function from(arrayLike) {
      var items = Object(arrayLike);
      var lenValue = items.length;
      var len = ECMAScript.ToUint32(lenValue);
      var c = this, a;
      if (ECMAScript.IsConstructor(c)) {
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
    });

  //----------------------------------------
  // Properties of the Array Prototype Object
  //----------------------------------------

  (function() {
    defineFunction(
      Array.prototype, 'items',
      function items() {
        return CreateArrayIterator(this, "key+value");
      });
    defineFunction(
      Array.prototype, 'keys',
      function keys() {
        return CreateArrayIterator(this, "key");
      });
    defineFunction(
      Array.prototype, 'values',
      function values() {
        return CreateArrayIterator(this, "value");
      });
    defineFunction(
      Array.prototype, '__iterator',
      Array.prototype.items
    );

    function CreateArrayIterator(array, kind) {
      return new ArrayIterator(array, 0, kind);
    }

    function ArrayIterator(object, nextIndex, kind) {
      this.iteratedObject = object;
      this.nextIndex = nextIndex;
      this.iterationKind = kind;
    }
    ArrayIterator.prototype = {};
    defineFunction(
      ArrayIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError; }
        var a = this.iteratedObject,
            index = this.nextIndex,
            itemKind = this.iterationKind,
            lenValue = a.length,
            len = ECMAScript.ToUint32(lenValue),
            elementKey,
            elementValue;
        if (itemKind.indexOf("sparse") !== -1) {
          var found = false;
          while (!found && index < len) {
            elementKey = String(index);
            found = ECMAScript.HasProperty(a, elementKey);
            if (!found) {
              index += 1;
            }
          }
        }
        if (index >= len) {
          this.nextIndex = Infinity;
          throw global.StopIteration;
        }
        elementKey = String(index);
        this.nextIndex = index + 1;
        if (itemKind.indexOf("value") !== -1) {
          elementValue = a[elementKey];
        }
        if (itemKind.indexOf("key+value") !== -1) {
          return [elementKey, elementValue];
        } else if (itemKind.indexOf("key") !== -1) {
          return elementKey;
        } else if (itemKind === "value") {
          return elementValue;
        }
        throw new Error("Internal error");
      });
    defineFunction(
      ArrayIterator.prototype, '__iterator',
      function() {
        return this;
      });
  }());


  //----------------------------------------
  // Collections: Maps, Sets, and WeakMaps
  //----------------------------------------

  /** @constructor */
  global.Map = global.Map || function Map(iterable) {
    if (!(this instanceof Map)) { return new Map(iterable); }

    var mapData = { keys: [], values: [] };

    function indexOf(key) {
      var i;
      if (key === key && key !== 0) {
        return mapData.keys.indexOf(key);
      }
      // Slow case for NaN/+0/-0
      for (i = 0; i < mapData.keys.length; i += 1) {
        if (ECMAScript.SameValue(mapData.keys[i], key)) { return i; }
      }
      return -1;
    }

    Object.defineProperties(
      this,
      {
        'clear': {
          value: function clear() {
            mapData.keys.length = 0;
            mapData.values.length = 0;
            if (this.size !== mapData.keys.length) { this.size = mapData.keys.length; }
          },
          configurable: true, enumerable: false, writable: true
        },
        'delete': {
          value: function deleteFunction(key) {
            var i = indexOf(key);
            if (i < 0) { return false; }
            mapData.keys.splice(i, 1);
            mapData.values.splice(i, 1);
            if (this.size !== mapData.keys.length) { this.size = mapData.keys.length; }
            return true;
          },
          configurable: true, enumerable: false, writable: true
        },
        'forEach': {
          value: function forEach(callbackfn /*, thisArg*/) {
            var thisArg = arguments[1];
            var m = Object(this);
            if (!ECMAScript.IsCallable(callbackfn)) {
              throw new TypeError("First argument to forEach is not callable.");
            }
            for (var i = 0; i < mapData.keys.length; ++i) {
              callbackfn.call(thisArg, mapData.keys[i], mapData.values[i], m);
            }
          },
          configurable: true, enumerable: false, writable: true
        },
        'get': {
          value: function get(key) {
            var i = indexOf(key);
            return i < 0 ? undefined : mapData.values[i];
          },
          configurable: true, enumerable: false, writable: true
        },
        'has': {
          value: function has(key) {
            return indexOf(key) >= 0;
          },
          configurable: true, enumerable: false, writable: true
        },
        'items': {
          value: function items() {
            return CreateMapIterator(Object(this), "key+value");
          },
          configurable: true, enumerable: false, writable: true
        },
        'keys': {
          value: function keys() {
            return CreateMapIterator(Object(this), "key");
          },
          configurable: true, enumerable: false, writable: true
        },
        'set': {
          value: function set(key, val) {
            var i = indexOf(key);
            if (i < 0) { i = mapData.keys.length; }
            mapData.keys[i] = key;
            mapData.values[i] = val;
            if (this.size !== mapData.keys.length) { this.size = mapData.keys.length; }
          },
          configurable: true, enumerable: false, writable: true
        },
        'size': {
          get: function() {
            return mapData.keys.length;
          }
        },
        'values': {
          value: function values() {
            return CreateMapIterator(Object(this), "value");
          },
          configurable: true, enumerable: false, writable: true
        },
        '__iterator': {
          value: function() {
            return CreateMapIterator(Object(this), "key+value");
          },
          configurable: true, enumerable: false, writable: true
        }
      }
    );

    function CreateMapIterator(map, kind) {
      map = Object(map);
      return new MapIterator(map, 0, kind);
    }

    function MapIterator(map, index, kind) {
      this.map = map;
      this.nextIndex = index;
      this.iterationKind = kind;
    }
    MapIterator.prototype = {};
    defineFunction(
      MapIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError(); }
        var m = this.map,
            index = this.nextIndex,
            itemKind = this.iterationKind,
            entries = mapData; // NOTE: closure over this particular Map instance
        while (index < entries.keys.length) {
          var e = {key: entries.keys[index], value: entries.values[index]};
          index = index += 1;
          this.nextIndex = index;
          if (e.key !== undefined) { // |empty| ?
            if (itemKind === "key") {
              return e.key;
            } else if (itemKind === "value") {
              return e.value;
            } else {
              return [e.key, e.value];
            }
          }
        }
        throw global.StopIteration;
      });
    defineFunction(
      MapIterator.prototype, '__iterator',
      function() {
        return this;
      });

    if (iterable) {
      iterable = Object(iterable);
      var it = iterable.__iterator(); // or throw...
      try {
        while (true) {
          var next = it.next();
          this.set(next[0], next[1]);
        }
      } catch (ex) {
        if (ex !== global.StopIteration) {
          throw ex;
        }
      }
    }

    return this;
  };

  /** @constructor */
  global.Set = global.Set || function Set(iterable) {
    if (!(this instanceof Set)) { return new Set(iterable); }

    var setData = [];

    function indexOf(key) {
      var i;
      // Slow case for NaN/+0/-0
      if (key !== key || key === 0) {
        for (i = 0; i < setData.length; i += 1) {
          if (ECMAScript.SameValue(setData[i], key)) { return i; }
        }
        return -1;
      }
      // Fast case
      return setData.indexOf(key);
    }

    Object.defineProperties(
      this,
      {
        'add': {
          value: function add(key) {
            var i = indexOf(key);
            if (i < 0) { i = setData.length; }
            setData[i] = key;
            if (this.size !== setData.length) { this.size = setData.length; }
          },
          configurable: true, enumerable: false, writable: true
        },
        'clear': {
          value: function clear() {
            setData = [];
            if (this.size !== setData.length) { this.size = setData.length; }
          },
          configurable: true, enumerable: false, writable: true
        },
        'delete': {
          value: function deleteFunction(key) {
            var i = indexOf(key);
            if (i < 0) { return false; }
            setData.splice(i, 1);
            if (this.size !== setData.length) { this.size = setData.length; }
            return true;
          },
          configurable: true, enumerable: false, writable: true
        },
        'forEach': {
          value: function forEach(callbackfn/*, thisArg*/) {
            var thisArg = arguments[1];
            var s = Object(this);
            if (!ECMAScript.IsCallable(callbackfn)) {
              throw new TypeError("First argument to forEach is not callable.");
            }
            for (var i = 0; i < setData.length; ++i) {
              callbackfn.call(thisArg, setData[i], s);
            }
          },
          configurable: true, enumerable: false, writable: true
        },
        'has': {
          value: function has(key) {
            return indexOf(key) !== -1;
          },
          configurable: true, enumerable: false, writable: true
        },
        'size': {
          get: function() {
            return setData.length;
          }
        },
        'values': {
          value: function values() {
            return CreateSetIterator(Object(this));
          },
          configurable: true, enumerable: false, writable: true
        },
        '__iterator': {
          value: function() {
            return CreateSetIterator(Object(this));
          },
          configurable: true, enumerable: false, writable: true
        }
      }
    );

    function CreateSetIterator(set) {
      set = Object(set);
      return new SetIterator(set, 0);
    }

    function SetIterator(set, index) {
      this.set = set;
      this.nextIndex = index;
    }
    SetIterator.prototype = {};
    defineFunction(
      SetIterator.prototype, 'next',
      function() {
        if (typeof this !== 'object') { throw new TypeError; }
        var s = this.set,
            index = this.nextIndex,
            entries = setData; // NOTE: closure over this particular Set instance
        while (index < entries.length) {
          var e = entries[index];
          index = index += 1;
          this.nextIndex = index;
          if (e !== undefined) { // |empty| ?
            return e;
          }
        }
        throw global.StopIteration;
      });
    defineFunction(
      SetIterator.prototype, '__iterator',
      function() {
        return this;
      });

    if (iterable) {
      iterable = Object(iterable);
      var it = ECMAScript.HasProperty(iterable, "values") ? iterable.values() : iterable.__iterator(); // or throw...
      try {
        while (true) {
          var next = it.next();
          // Spec has next = ToObject(next) here
          this.add(next);
        }
      } catch (ex) {
        if (ex !== global.StopIteration) {
          throw ex;
        }
      }
    }

    return this;
  };

  // Inspired by https://gist.github.com/1638059
  /** @constructor */
  global.WeakMap = global.WeakMap || function WeakMap(iterable) {
    if (!(this instanceof WeakMap)) { return new WeakMap(iterable); }

    var secretKey = {};

    function conceal(o) {
      var oValueOf = o.valueOf, secrets = {};
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

    Object.defineProperties(
      this,
      {
        'clear': {
          value: function clear() {
            secretKey = {};
          },
          configurable: true, enumerable: false, writable: true
        },
        'delete': {
          value: function deleteFunction(key) {
            key = Object(key);
            var secrets = reveal(key);
            if (secrets) {
              delete secrets.value;
            }
          },
          configurable: true, enumerable: false, writable: true
        },
        'get': {
          value: function get(key, defaultValue) {
            key = Object(key);
            var secrets = reveal(key);
            return (secrets && ECMAScript.HasOwnProperty(secrets, 'value')) ? secrets.value : defaultValue;
          },
          configurable: true, enumerable: false, writable: true
        },
        'has': {
          value: function has(key) {
            key = Object(key);
            var secrets = reveal(key);
            return Boolean(secrets && ECMAScript.HasOwnProperty(secrets, 'value'));
          },
          configurable: true, enumerable: false, writable: true
        },
        'set': {
          value: function set(key, value) {
            key = Object(key);
            var secrets = reveal(key) || conceal(key);
            secrets.value = value;
          },
          configurable: true, enumerable: false, writable: true
        }
      });

    if (iterable) {
      iterable = Object(iterable);
      var it = iterable.__iterator(); // or throw...
      try {
        while (true) {
          var next = it.next();
          this.set(next[0], next[1]);
        }
      } catch (ex) {
        if (ex !== global.StopIteration) {
          throw ex;
        }
      }
    }


    return this;
  };


  //----------------------------------------------------------------------
  //
  // ECMAScript Strawman Proposals
  //
  //----------------------------------------------------------------------

  // http://wiki.ecmascript.org/doku.php?id=strawman:number_compare
  defineFunction(
    Number, 'compare',
    function compare(first, second, tolerance) {
      var difference = first - second;
      return abs(difference) <= (tolerance || 0) ? 0 : difference < 0 ? -1 : 1;
    });


  // http://wiki.ecmascript.org/doku.php?id=strawman:array.prototype.pushall
  defineFunction(
    Array.prototype, 'pushAll',
    function pushAll(other, start, end) {
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
    });

  // es-discuss: DOMStringList replacement
  defineFunction(
    Array.prototype, 'contains',
    function contains(target) {
      if (this === void 0 || this === null) { throw new TypeError(); }
      var t = Object(this),
          len = ECMAScript.ToUint32(t.length),
          i;
      for (i = 0; i < len; i += 1) {
        // eval("0 in [undefined]") == false in IE8-
        if (/*i in t &&*/ ECMAScript.SameValue(t[i], target)) {
          return true;
        }
      }
      return false;
    });

  // http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/index.html
  defineFunction(
    String, 'fromCodePoint',
    function fromCodePoint() {
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
    });

  // http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/index.html
  defineFunction(
    String.prototype, 'codePointAt',
    function codePointAt(index) {
      var str = String(this);
      if (index < 0 || index >= str.length) {
        return undefined;
      }
      var first = str.charCodeAt(index);
      if (first >= 0xD800 && first <= 0xDBFF && str.length > index + 1) {
        var second = str.charCodeAt(index + 1);
        if (second >= 0xDC00 && second <= 0xDFFF) {
          return ((first - 0xD800) << 10) + (second - 0xDC00) + 0x10000;
        }
      }
      return first;
    });

  // http://norbertlindenberg.com/2012/05/ecmascript-supplementary-characters/index.html
  defineFunction(
    String.prototype, '__iterator',
    function () {
      var s = this;
      return {
        index: 0,
        'next': function () {
          if (this.index >= s.length) {
            throw global.StopIteration;
          }
          var cp = s.codePointAt(this.index);
          this.index += cp > 0xFFFF ? 2 : 1;
          return String.fromCodePoint(cp);
        },
        '__iterator': function() {
          return this;
        }
      };
    });

}(self));
