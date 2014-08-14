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

  function isSymbol(s) {
    return (typeof s === 'symbol') || ('Symbol' in global && s instanceof global.Symbol);
  }

  function define(o, p, v, override) {
    if (p in o && !override)
      return;

    if (typeof v === 'function') {
      // Sanity check that functions are appropriately named (where possible)
      assert(isSymbol(p) || !('name' in v) || v.name === p || v.name === p + '_', 'Expected function name "' + p.toString() + '", was "' + v.name + '"');
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
      random = Math.random,
      sqrt = Math.sqrt;

  // These are used for implementing the polyfills, but not exported.

  // Inspired by https://gist.github.com/1638059
  /** @constructor */
  function EphemeronTable() {
    var secretKey = ObjectCreate(null);

    function conceal(o) {
      var oValueOf = o.valueOf, secrets = ObjectCreate(null);
      Object.defineProperty(o, 'valueOf', {
          value: (function(secretKey) {
            return function (k) {
              return (k === secretKey) ? secrets : oValueOf.apply(o, arguments);
            };
          }(secretKey)),
        configurable: true,
        writeable: true,
        enumerable: false
        });
      return secrets;
    }

    function reveal(o) {
      var v = typeof o.valueOf === 'function' && o.valueOf(secretKey);
      return v === o ? null : v;
    }

    return {
      clear: function() {
        secretKey = ObjectCreate(null);
      },
      remove: function(key) {
        var secrets = reveal(key);
        if (secrets && HasOwnProperty(secrets, 'value')) {
          delete secrets.value;
          return true;
        }
        return false;
      },
      get: function(key, defaultValue) {
        var secrets = reveal(key);
        return (secrets && HasOwnProperty(secrets, 'value')) ? secrets.value : defaultValue;
      },
      has: function(key) {
        var secrets = reveal(key);
        return Boolean(secrets && HasOwnProperty(secrets, 'value'));
      },
      set: function(key, value) {
        var secrets = reveal(key) || conceal(key);
        secrets.value = value;
      }
    };
  }

  var empty = Object.create(null);

  //----------------------------------------------------------------------
  //
  // ECMAScript 6 Draft
  // http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
  //
  //----------------------------------------------------------------------

  // ---------------------------------------
  // 19.4 Symbol Objects
  // ---------------------------------------

  // NOTE: Symbols are defined here - out of spec order - since we need the
  // properties and prototype to be populated for other polyfills.

  // NOTE: Not secure, nor is obj[$$symbol] hidden from Object.keys()

  // 19.4.1 The Symbol Constructor
  // 19.4.1.1 Symbol ( description=undefined )
  // 19.4.1.2 new Symbol ( ...argumentsList )

  var symbolForKey;
  (function() {
    var secret = Object.create(null);
    var symbolMap = {};
    symbolForKey = function(k) {
      return symbolMap[k];
    };

    var GlobalSymbolRegistry = [];

    function uuid() {
      // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (random() * 16) | 0, v = (c === 'x') ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    function Symbol(description) {
      if (!(this instanceof Symbol)) return new Symbol(description, secret);
      if (this instanceof Symbol && arguments[1] !== secret) throw TypeError();

      var descString = description === undefined ? undefined : String(description);

      set_internal(this, '[[SymbolData]]', uuid());
      set_internal(this, '[[Description]]', descString);

      symbolMap[this] = this;
      return this;
    }

    // 19.4.2 Properties of the Symbol Constructor
    // 19.4.2.1 Symbol.create

    // 19.4.2.2 Symbol.for (key)
    define(Symbol, 'for', function for_(key) {
      var stringKey = String(key);
      for (var i = 0; i < GlobalSymbolRegistry.length; ++i) {
        var e = GlobalSymbolRegistry[i];
        if (SameValue(e['[[key]]'], stringKey)) return e['[[symbol]]'];
      }
      var newSymbol = Symbol(key);
      GlobalSymbolRegistry.push({'[[key]]': stringKey, '[[symbol]]': newSymbol});
      return newSymbol;
    });

    // 19.4.2.3 Symbol.hasInstance
    // 19.4.2.4 Symbol.isConcatSpreadable
    // 19.4.2.5 Symbol.isRegExp

    // 19.4.2.6 Symbol.iterator
    define(Symbol, 'iterator', Symbol('Symbol.iterator'));

    // 19.4.2.7 Symbol.keyFor (sym)
    define(Symbol, 'keyFor', function keyFor(sym) {
      if (!(sym instanceof Symbol)) throw TypeError();
      for (var i = 0; i < GlobalSymbolRegistry.length; ++i) {
        var e = GlobalSymbolRegistry[i];
        if (SameValue(e['[[symbol]]'], sym)) return e['[[key]]'];
      }
      return undefined;
    });

    // 19.4.2.8 Symbol.prototype
    // 19.4.2.9 Symbol.toPrimitive

    // 19.4.2.10 Symbol.toStringTag
    define(Symbol, 'toStringTag', Symbol('Symbol.toStringTag'));

    // 19.4.2.11 Symbol.unscopables
    // 19.4.2.12 Symbol [ @@create ] ()

    // 19.4.3 Properties of the Symbol Prototype Object
    // 19.4.3.1 Symbol.prototype.constructor

    // 19.4.3.2 Symbol.prototype.toString ( )
    Object.defineProperty(Symbol.prototype, 'toString', {
      value: function toString() {
        var s = strict(this);
        var desc = s['[[Description]]'] + '/' + s['[[SymbolData]]'];
        return 'Symbol(' + desc + ')';
      },
      configurable: true, writeable: true, enumerable: false });

    // 19.4.3.3 Symbol.prototype.valueOf ( )
    Object.defineProperty(Symbol.prototype, 'valueOf', {
      value: function valueOf() {
        var s = strict(this);
        var sym = s['[[SymbolData]]'];
      },
      configurable: true, writeable: true, enumerable: false });

    // 19.4.3.4 Symbol.prototype [ @@toStringTag ]
    // (Done later to polyfill partial implementations)

    // 19.4.4 Properties of Symbol Instances

    global.Symbol = global.Symbol || Symbol;
  }());

  assert(typeof global.Symbol() === 'symbol' || symbolForKey(String(global.Symbol('x'))));

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

  // 6.1.5.1 Well-Known Symbols
  var $$iterator = global.Symbol.iterator,
      $$toStringTag = global.Symbol.toStringTag;

  //----------------------------------------
  // 7 Abstract Operations
  //----------------------------------------

  //----------------------------------------
  // 7.1 Type Conversion and Testing
  //----------------------------------------

  // 7.1.1 ToPrimitive ( input [, Preferred Type] )
  // just use valueOf()

  // 7.1.2 ToBoolean ( argument )
  // just use Boolean()

  // 7.1.3 ToNumber ( argument )
  // just use Number()

  // 7.1.4 ToInteger ( argument )
  function ToInteger(n) {
    n = Number(n);
    if ($isNaN(n)) return 0;
    if (n === 0 || n === Infinity || n === -Infinity) return n;
    return ((n < 0) ? -1 : 1) * floor(abs(n));
  }

  // 7.1.5 ToInt32 ( argument ) — Signed 32 Bit Integer
  function ToInt32(v) { return v >> 0; }

  // 7.1.6 ToUint32 ( argument ) — Unsigned 32 Bit Integer
  function ToUint32(v) { return v >>> 0; }

  // 7.1.8 ToUint16 ( argument ) — Unsigned 16 Bit Integer
  function ToUint16(v) { return (v >>> 0) & 0xFFFF; }

  // 7.1.12 ToString ( argument )
  // just use String()

  // 7.1.13 ToObject ( argument )
  function ToObject(v) {
    if (v === null || v === undefined) throw TypeError();
    return Object(v);
  }

  // 7.1.14 ToPropertyKey ( argument )
  function ToPropertyKey(v) {
    return String(v);
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

  // 7.2.2 IsCallable ( argument )
  function IsCallable(o) { return typeof o === 'function'; }

  // 7.2.3 SameValue(x, y)
  function SameValue(x, y) {
    if (typeof x !== typeof y) return false;
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'number':
      if (x !== x && y !== y) return true;
      if (x === 0 && y === 0) return 1/x === 1/y;
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  }

  // 7.2.4 SameValueZero(x, y)
  function SameValueZero(x, y) {
    if (typeof x !== typeof y) return false;
    switch (typeof x) {
    case 'undefined':
      return true;
    case 'number':
      if (x !== x && y !== y) return true;
      return x === y;
    case 'boolean':
    case 'string':
    case 'object':
    default:
      return x === y;
    }
  }

  // 7.2.5 IsConstructor ( argument )
  function IsConstructor(o) {
    // Hack for Safari 7 TypedArray XXXConstructor objects
    if (/Constructor/.test(Object.prototype.toString.call(o))) return true;
    // TODO: Can this be improved on?
    return typeof o === 'function';
  }

  // 7.2.6 IsPropertyKey ( argument )
  function IsPropertyKey(argument) {
    if (Type(argument) === 'string') return true;
    if (Type(argument) === 'symbol') return true;
    return false;
  }

  //----------------------------------------
  // 7.3 Operations on Objects
  //----------------------------------------

  // 7.3.1 Get (O, P)
  // - just use o.p or o[p]

  // 7.3.2 Put (O, P, V, Throw)
  // - just use o.p = v or o[p] = v

  // 7.3.8 HasProperty (O, P)
  function HasProperty(o, p) { return p in o; }

  // 7.3.9 HasOwnProperty (O, P)
  function HasOwnProperty(o, p) { return Object.prototype.hasOwnProperty.call(o, p); }

  //----------------------------------------
  // 7.4 Operations on Iterator Objects
  //----------------------------------------

  // 7.4.1 CheckIterable ( obj )
  function CheckIterable(obj) {
    if (Type(obj) !== 'object') return undefined;
    return obj[$$iterator];
  }

  // 7.4.2 GetIterator ( obj, method )
  function GetIterator(obj, method) {
    if (arguments.length < 2) method = CheckIterable(obj);
    if (!IsCallable(method)) throw TypeError();
    var iterator = method.call(obj);
    return iterator;
  }

  // 7.4.3 IteratorNext ( iterator, value )
  function IteratorNext(iterator, value) {
    var result = iterator.next(value);
    if (Type(result) !== 'object') throw TypeError();
    return result;
  }

  // 7.4.4 IteratorComplete ( iterResult )
  function IteratorComplete(iterResult) {
    assert(Type(iterResult) === 'object');
    return Boolean(iterResult.done);
  }

  // 7.4.5 IteratorValue ( iterResult )
  function IteratorValue(iterResult) {
    assert(Type(iterResult) === 'object');
    return iterResult.value;
  }

  // 7.4.6 IteratorStep ( iterator )
  function IteratorStep( iterator, value ) {
    var result = IteratorNext(iterator, value);
    var done = result['done'];
    if (Boolean(done) === true) return false;
    return result;
  }

  // 7.4.7 CreateIterResultObject (value, done)
  function CreateIterResultObject(value, done) {
    assert(Type(done) === 'boolean');
    var obj = {};
    obj["value"] = value;
    obj["done"] = done;
    return obj;
  }

  // 7.4.8 CreateListIterator (list)
  // 7.4.8.1 ListIterator next( )
  // 7.4.9 CreateEmptyIterator ( )
  // 7.4.10 CreateCompoundIterator ( iterator1, iterator2 )
  // 7.4.10.1 CompoundIterator next( )

  // TODO: Refactor Promise implementation
  // 7.5 Operations on Promise Objects
  // 7.5.1 PromiseNew ( executor ) Abstract Operation
  // 7.5.2 PromiseBuiltinCapability () Abstract Operation
  // 7.5.3 PromiseOf (value) Abstract Operation
  // 7.5.4 PromiseAll (promiseList) Abstract Operation
  // 7.5.5 PromiseCatch (promise, rejectedAction) Abstract Operation
  // 7.5.6 PromiseThen (promise, resolvedAction, rejectedAction) Abstract Operation

  //----------------------------------------
  // 9 Ordinary and Exotic Objects Behaviors
  //----------------------------------------

  // 9.1.11 [[Enumerate]] ()
  function Enumerate(obj) {
    var e = [];
    if (Object(obj) !== obj) return e;
    var visited = new Set;
    while (obj !== null) {
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        if (!visited.has(name)) {
          var desc = Object.getOwnPropertyDescriptor(obj, name);
          if (desc) {
            visited.add(name);
            if (desc.enumerable) e.push(name);
          }
        }
      });
      obj = Object.getPrototypeOf(obj);
    }
    return e[$$iterator]();
  }

  // 9.1.12 [[OwnPropertyKeys]] ()
  function OwnPropertyKeys(o) {
    return Object.getOwnPropertyNames(o)[$$iterator]();
  }

  // 9.1.13 ObjectCreate(proto, internalDataList)
  function ObjectCreate(proto, internalDataList) {
    return Object.create(proto, internalDataList);
  }

  // ---------------------------------------
  // 19 Fundamental Objects
  // ---------------------------------------

  // ---------------------------------------
  // 19.1 Object Objects
  // ---------------------------------------

  // 19.1.1 The Object Constructor
  // 19.1.1.1 Object ( [ value ] )
  // 19.1.1.2 new Object ( ...argumentsList )
  // 19.1.2 Properties of the Object Constructor
  // 19.1.2.1 Object.assign ( target, ...sources )
  define(
    Object, 'assign',
    function assign(target, /*...*/sources) {
      sources = [].slice.call(arguments, 1);
      while (sources.length) {
        var nextSource = sources.shift();
        var to = ToObject(target);
        var from = ToObject(nextSource);
        var keys = OwnPropertyKeys(from);
        var gotAllNames = false;
        var pendingException = undefined;
        while (!gotAllNames) {
          var next = IteratorStep(keys);
          if (next === false) {
            gotAllNames = true;
          } else {
            var nextKey = IteratorValue(next);
            try {
              var desc = Object.getOwnPropertyDescriptor(from, nextKey);
            } catch (desc) {
              if (pendingException === undefined)
                pendingException = desc;
              continue;
            }
            if (desc !== undefined && desc.enumerable === true) {
              try {
                var propValue = from[nextKey];
              } catch (propValue) {
                if (pendingException === undefined)
                  pendingException = propValue;
                continue;
              }
              try {
                to[nextKey] = propValue;
              } catch (status) {
                if (pendingException === undefined)
                  pendingException = status;
              }
            }
          }
        }
      }
      if (pendingException !== undefined)
        throw pendingException;
      return to;
    });

  // 19.1.2.2 Object.create ( O [ , Properties ] )
  // 19.1.2.3 Object.defineProperties ( O, Properties )
  // 19.1.2.4 Object.defineProperty ( O, P, Attributes )
  // 19.1.2.5 Object.freeze ( O )
  // 19.1.2.6 Object.getOwnPropertyDescriptor ( O, P )

  (function() {
    var nativeSymbols = (typeof global.Symbol() === 'symbol'),
        $getOwnPropertyNames = Object.getOwnPropertyNames,
        $keys = Object.keys;

    function isStringKey(k) { return !symbolForKey(k); }

    // 19.1.2.7 Object.getOwnPropertyNames ( O )
    define(
      Object, 'getOwnPropertyNames',
      function getOwnPropertyNames(o) {
        return $getOwnPropertyNames(o).filter(isStringKey);
      }, !nativeSymbols);

    // 19.1.2.8 Object.getOwnPropertySymbols ( O )
    define(
      Object, 'getOwnPropertySymbols',
      function getOwnPropertySymbols(o) {
        return $getOwnPropertyNames(o).filter(symbolForKey).map(symbolForKey);
      }, !nativeSymbols);

    // 19.1.2.14 Object.keys ( O )
    define(
      Object, 'keys',
      function keys(o) {
        return $keys(o).filter(isStringKey);
      }, !nativeSymbols);
  }());

  // 19.1.2.9 Object.getPrototypeOf ( O )
  // 19.1.2.10 Object.is ( value1, value2 )
  define(
    Object, 'is',
    function is(value1, value2) {
      return SameValue(value1, value2);
    });

  // 19.1.2.11 Object.isExtensible ( O )
  // 19.1.2.12 Object.isFrozen ( O )
  // 19.1.2.13 Object.isSealed ( O )

  // 19.1.2.14 Object.keys ( O )
  // see above

  // 19.1.2.15 Object.preventExtensions ( O )
  // 19.1.2.16 Object.prototype
  // 19.1.2.17 Object.seal ( O )

  // 19.1.2.18 Object.setPrototypeOf ( O, proto )
  define(
    Object, 'setPrototypeOf',
    function setPrototypeOf(o, proto) {
      if (Type(o) !== 'object') throw TypeError();
      if (Type(proto) !== 'object' && Type(proto) !== 'null') throw TypeError();
      o.__proto__ = proto;
      return o;
    }
  );

  // 19.1.3 Properties of the Object Prototype Object
  // 19.1.3.1 Object.prototype.constructor
  // 19.1.3.2 Object.prototype.hasOwnProperty ( V )
  // 19.1.3.3 Object.prototype.isPrototypeOf ( V )
  // 19.1.3.4 Object.prototype.propertyIsEnumerable ( V )
  // 19.1.3.5 Object.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  // 19.1.3.6 Object.prototype.toString ( )
  hook(Object.prototype, 'toString',
       function() {
         var o = strict(this);
         if (o === Object(o) && $$toStringTag in o) {
           return '[object ' + o[$$toStringTag] + ']';
         }
         return undefined;
       });

  // 19.1.3.7 Object.prototype.valueOf ( )
  // 19.1.4 Properties of Object Instances

  // ---------------------------------------
  // 19.2 Function Objects
  // ---------------------------------------

  // 19.2.1 The Function Constructor
  // 19.2.1.1 Function ( p1, p2, … , pn, body )
  // 19.2.1.2 new Function ( ...argumentsList )
  // 19.2.2 Properties of the Function Constructor
  // 19.2.2.1 Function.length
  // 19.2.2.2 Function.prototype
  // 19.2.2.3 Function[ @@create ] ( )
  // 19.2.3 Properties of the Function Prototype Object
  // 19.2.3.1 Function.prototype.apply ( thisArg, argArray )
  // 19.2.3.2 Function.prototype.bind ( thisArg , ...args)
  // 19.2.3.3 Function.prototype.call (thisArg , ...args)
  // 19.2.3.4 Function.prototype.constructor
  // 19.2.3.5 .Function.prototype.toMethod (newHome [ , methodName ] )
  // 19.2.3.6 Function.prototype.toString ( )
  // 19.2.3.7 Function.prototype[ @@create ] ( )
  // 19.2.3.8 Function.prototype[@@hasInstance] ( V )
  // 19.2.4 Function Instances
  // 19.2.4.1 length
  // 19.2.4.2 name
  // 19.2.4.3 prototype

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 19.3 Boolean Objects
  // ---------------------------------------

  // 19.3.1 The Boolean Constructor
  // 19.3.1.1 Boolean ( value )
  // 19.3.1.2 new Boolean ( ...argumentsList )
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
  // 19.4 Symbol Objects
  // ---------------------------------------

  // Moved earlier in this script, so that other polyfills can depend on them.

  // 19.4.3.4 Symbol.prototype [ @@toStringTag ]
  define(global.Symbol.prototype, global.Symbol.toStringTag, 'Symbol');

  // ---------------------------------------
  // 19.5 Error Objects
  // ---------------------------------------

  // 19.5.1 The Error Constructor
  // 19.5.1.1 Error ( message )
  // 19.5.1.2 new Error( ...argumentsList )
  // 19.5.2 Properties of the Error Constructor
  // 19.5.2.1 Error.prototype
  // 19.5.2.2 Error[ @@create ] ( )
  // 19.5.3 Properties of the Error Prototype Object
  // 19.5.3.1 Error.prototype.constructor
  // 19.5.3.2 Error.prototype.message
  // 19.5.3.3 Error.prototype.name
  // 19.5.3.4 Error.prototype.toString ( )
  // 19.5.4 Properties of Error Instances
  // 19.5.5 Native Error Types Used in This Standard
  // 19.5.5.1 EvalError
  // 19.5.5.2 RangeError
  // 19.5.5.3 ReferenceError
  // 19.5.5.4 SyntaxError
  // 19.5.5.5 TypeError
  // 19.5.5.6 URIError
  // 19.5.6 NativeError Object Structure
  // 19.5.6.1 NativeError Constructors
  // 19.5.6.1.1 NativeError ( message )
  // 19.5.6.1.2 new NativeError ( ...argumentsList )
  // 19.5.6.2 Properties of the NativeError Constructors
  // 19.5.6.2.1 NativeError.prototype
  // 19.5.6.3 Properties of the NativeError Prototype Objects
  // 19.5.6.4 Properties of NativeError Instances

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 20 Numbers and Dates
  // ---------------------------------------

  // ---------------------------------------
  // 20.1 Number Objects
  // ---------------------------------------

  // 20.1.1 The Number Constructor
  // 20.1.1.1 Number ( [ value ] )
  // 20.1.1.2 new Number ( ...argumentsList )
  // 20.1.2 Properties of the Number Constructor

  // 20.1.2.1 Number.EPSILON
  define(
    Number, 'EPSILON',
    (function () {
      var next, result;
      for (next = 1; 1 + next !== 1; next = next / 2) {
        result = next;
      }
      return result;
    }()));

  // 20.1.2.2 Number.isFinite ( number )
  define(
    Number, 'isFinite',
    function isFinite(value) {
      return typeof value === 'number' && $isFinite(value);
    });

  // 20.1.2.3 Number.isInteger ( number )
  define(
    Number, 'isInteger',
    function isInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      if ($isNaN(number) || number === +Infinity || number === -Infinity) {
        return false;
      }
      var integer = ToInteger(number);
      if (integer !== number) {
        return false;
      }
      return true;
    });

  // 20.1.2.4 Number.isNaN ( number )
  define(
    Number, 'isNaN',
    function isNaN(value) {
      return typeof value === 'number' && $isNaN(value);
    });

  // 20.1.2.5 Number.isSafeInteger ( number )
  define(
    Number, 'isSafeInteger',
    function isSafeInteger(number) {
      if (typeof number !== 'number') {
        return false;
      }
      if (number !== number || number === +Infinity || number === -Infinity) {
        return false;
      }
      var integer = ToInteger(number);
      if (integer !== number) {
        return false;
      }
      if (abs(integer) <= (0x20000000000000 - 1)) { // 2^53-1
        return true;
      }
      return false;
    });

  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  define(
    Number, 'MAX_SAFE_INTEGER',
    0x20000000000000 - 1); // 2^53-1

  // 20.1.2.7 Number.MAX_VALUE
  // 20.1.2.8 Number.NaN
  // 20.1.2.9 Number.NEGATIVE_INFINITY

  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  define(
    Number, 'MIN_SAFE_INTEGER',
    -0x20000000000000 + 1); // -2^53+1

  // 20.1.2.11 Number.MIN_VALUE
  // 20.1.2.12 Number.parseFloat ( string )
  define(
    Number, 'parseFloat',
    function parseFloat(string) {
      return $parseFloat(string);
    });

  // 20.1.2.13 Number.parseInt ( string, radix )
  define(
    Number, 'parseInt',
    function parseInt(string) {
      return $parseInt(string);
    });

  // 20.1.2.14 Number.POSITIVE_INFINITY
  // 20.1.2.15 Number.prototype
  // 20.1.2.16 Number[ @@create ] ( )

  // 20.1.3 Properties of the Number Prototype Object
  // 20.1.3.1 Number.prototype.constructor
  // 20.1.3.2 Number.prototype.toExponential ( fractionDigits )
  // 20.1.3.3 Number.prototype.toFixed ( fractionDigits )
  // 20.1.3.4 Number.prototype.toLocaleString( [ reserved1 [ , reserved2 ] ])
  // 20.1.3.5 Number.prototype.toPrecision ( precision )
  // 20.1.3.6 Number.prototype.toString ( [ radix ] )
  // 20.1.3.7 Number.prototype.valueOf ( )
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

  // 20.2.1.9 Math [ @@toStringTag ]
  define(Math, $$toStringTag, 'Math');

  // 20.2.2 Function Properties of the Math Object
  // 20.2.2.1 Math.abs ( x )
  // 20.2.2.2 Math.acos ( x )

  // 20.2.2.3 Math.acosh(x)
  define(
    Math, 'acosh',
    function acosh(x) {
      x = Number(x);
      return log(x + sqrt(x * x - 1));
    });

  // 20.2.2.4 Math.asin ( x )

  // 20.2.2.5 Math.asinh( x )
  define(
    Math, 'asinh',
    function asinh(x) {
      x = Number(x);
      if (SameValue(x, -0)) {
        return x;
      }
      var s = sqrt(x * x + 1);
      return (s === -x) ? log(0) : log(x + s);
    });

  // 20.2.2.6 Math.atan ( x )

  // 20.2.2.7 Math.atanh( x )
  define(
    Math, 'atanh',
    function atanh(x) {
      x = Number(x);
      return (x === 0) ? x : log((1 + x) / (1 - x)) / 2;
    });

  // 20.2.2.8 Math.atan2 ( y, x )

  // 20.2.2.9 Math.cbrt ( x )
  define(
    Math, 'cbrt',
    function cbrt(x) {
      x = Number(x);
      if ($isNaN(x/x)) {
        return x;
      }
      var r = pow(abs(x), 1/3);
      var t = x/r/r;
      return r + (r * (t-r) / (2*r + t));
    });

  // 20.2.2.10 Math.ceil ( x )

  // 20.2.2.11 Math.clz32 ( x )
  define(
    Math, 'clz32',
    function clz32(x) {
      function clz8(x) {
        return (x & 0xf0) ? (x & 0x80 ? 0 : x & 0x40 ? 1 : x & 0x20 ? 2 : 3) :
        (x & 0x08 ? 4 : x & 0x04 ? 5 : x & 0x02 ? 6 : x & 0x01 ? 7 : 8);
      }
      x = ToUint32(x);
      return x & 0xff000000 ? clz8(x >> 24) :
        x & 0xff0000 ? clz8(x >> 16) + 8 :
        x & 0xff00 ? clz8(x >> 8) + 16 : clz8(x) + 24;
    });



  // 20.2.2.12 Math.cos ( x )

  // 20.2.2.13 Math.cosh ( x )
  define(
    Math, 'cosh',
    function cosh(x) {
      x = Number(x);
      return (pow(E, x) + pow(E, -x)) / 2;
    });

  // 20.2.2.14 Math.exp ( x )

  // 20.2.2.15 Math.expm1 ( x )
  define(
    Math, 'expm1',
    function expm1(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_log1p.html
      if (SameValue(x, -0)) {
        return -0;
      } else if (abs(x) < 1e-5) {
        return x + 0.5 * x * x; // two terms of Taylor expansion
      } else {
        return exp(x) - 1;
      }
    });

  // 20.2.2.16 Math.floor ( x )

  // 20.2.2.17 Math.fround ( x )
  define(
    Math, 'fround',
    function fround(x) {
      if ($isNaN(x)) {
        return NaN;
      }
      if (1/x === +Infinity || 1/x === -Infinity || x === +Infinity || x === -Infinity) {
        return x;
      }
      return (new Float32Array([x]))[0];
    });

  // 20.2.2.18 Math.hypot ( value1 [, value2 [ ... ] ] )
  define(
    Math, 'hypot',
    function hypot() {
      var values = [];
      var m = 0, sawNaN = false;
      for (var i = 0; i < arguments.length; ++i) {
        var n = abs(Number(arguments[i]));
        if (n === Infinity) return n;
        if (n !== n) sawNaN = true;
        if (n > m) m = n;
        values[i] = n;
      }
      if (sawNaN) return NaN;
      if (m === 0) return +0;
      var sum = +0;
      for (i = 0; i < values.length; ++i) {
        var r = values[i] / m;
        sum = sum + r * r;
      }
      return m * sqrt(sum);
    });

  // 20.2.2.19 Math.imul ( x, y )
  define(
    Math, 'imul',
    function imul(x, y) {
      var a = ToUint32(x);
      var b = ToUint32(y);
      // (slow but accurate)
      var ah  = (a >>> 16) & 0xffff;
      var al = a & 0xffff;
      var bh  = (b >>> 16) & 0xffff;
      var bl = b & 0xffff;
      return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }, ('imul' in Math && Math.imul(1, 0x80000000) === 0) // Safari 7 bug
  );

  // 20.2.2.20 Math.log ( x )

  // 20.2.2.21 Math.log1p ( x )
  define(
    Math, 'log1p',
    function log1p(x) {
      x = Number(x);
      // from: http://www.johndcook.com/cpp_expm1.html
      if (x < -1) {
        return NaN;
      } else if (SameValue(x, -0)) {
        return -0;
      } else if (abs(x) > 1e-4) {
        return log(1 + x);
      } else {
        return (-0.5 * x + 1) * x;
      }
    });

  // 20.2.2.22 Math.log10 ( x )
  define(
    Math, 'log10',
    function log10(x) {
      x = Number(x);
      return log(x) * LOG10E;
    });

  // 20.2.2.23 Math.log2 ( x )
  define(
    Math, 'log2',
    function log2(x) {
      x = Number(x);
      return log(x) * LOG2E;
    });

  // 20.2.2.24 Math.max ( value1, value2 , ...values )
  // 20.2.2.25 Math.min ( value1, value2 , ...values )
  // 20.2.2.26 Math.pow ( x, y )
  // 20.2.2.27 Math.random ( )
  // 20.2.2.28 Math.round ( x )

  // 20.2.2.29 Math.sign(x)
  define(
    Math, 'sign',
    function sign(x) {
      x = Number(x);
      return x < 0 ? -1 : x > 0 ? 1 : x;
    });

  // 20.2.2.30 Math.sin ( x )

  // 20.2.2.31 Math.sinh( x )
  define(
    Math, 'sinh',
    function sinh(x) {
      x = Number(x);
      return SameValue(x, -0) ? x : (pow(E, x) - pow(E, -x)) / 2;
    });

  // 20.2.2.32 Math.sqrt ( x )
  // 20.2.2.33 Math.tan ( x )

  // 20.2.2.34 Math.tanh ( x )
  define(
    Math, 'tanh',
    function tanh(x) {
      x = Number(x);
      var n = pow(E, 2 * x) - 1,
          d = pow(E, 2 * x) + 1;
      if (SameValue(x, -0))
        return x;
      return (n === d) ? 1 : n / d; // Handle Infinity/Infinity
    });

  // 20.2.2.35 Math.trunc ( x )
  define(
    Math, 'trunc',
    function trunc(x) {
      x = Number(x);
      return $isNaN(x) ? NaN :
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
  // 20.3.2.1 Date ( year, month [, date [ , hours [ , minutes [ , seconds [ , ms ] ] ] ] ] )
  // 20.3.2.2 Date ( value )
  // 20.3.2.3 Date ( )
  // 20.3.2.4 new Date ( ...argumentsList )
  // 20.3.3 Properties of the Date Constructor
  // 20.3.3.1 Date.now ( )
  // 20.3.3.2 Date.parse (string)
  // 20.3.3.3 Date.prototype
  // 20.3.3.4 Date.UTC ( year, month [ , date [ , hours [ , minutes [ , seconds [ , ms ] ] ] ] ] )
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
  // 20.3.4.20 Date.prototype.setDate ( date )
  // 20.3.4.21 Date.prototype.setFullYear ( year [ , month [ , date ] ] )
  // 20.3.4.22 Date.prototype.setHours ( hour [ , min [ , sec [ , ms ] ] ] )
  // 20.3.4.23 Date.prototype.setMilliseconds ( ms )
  // 20.3.4.24 Date.prototype.setMinutes ( min [ , sec [ , ms ] ] )
  // 20.3.4.25 Date.prototype.setMonth ( month [ , date ] )
  // 20.3.4.26 Date.prototype.setSeconds ( sec [ , ms ] )
  // 20.3.4.27 Date.prototype.setTime ( time )
  // 20.3.4.28 Date.prototype.setUTCDate ( date )
  // 20.3.4.29 Date.prototype.setUTCFullYear ( year [ , month [ , date ] ] )
  // 20.3.4.30 Date.prototype.setUTCHours ( hour [ , min [ , sec [ , ms ] ] ] )
  // 20.3.4.31 Date.prototype.setUTCMilliseconds ( ms )
  // 20.3.4.32 Date.prototype.setUTCMinutes ( min [ , sec [, ms ] ] )
  // 20.3.4.33 Date.prototype.setUTCMonth ( month [ , date ] )
  // 20.3.4.34 Date.prototype.setUTCSeconds ( sec [ , ms ] )
  // 20.3.4.35 Date.prototype.toDateString ( )
  // 20.3.4.36 Date.prototype.toISOString ( )
  // 20.3.4.37 Date.prototype.toJSON ( key )
  // 20.3.4.38 Date.prototype.toLocaleDateString ( [ reserved1 [ , reserved2 ] ] )
  // 20.3.4.39 Date.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  // 20.3.4.40 Date.prototype.toLocaleTimeString ( [ reserved1 [ , reserved2 ] ] )
  // 20.3.4.41 Date.prototype.toString ( )
  // 20.3.4.42 Date.prototype.toTimeString ( )
  // 20.3.4.43 Date.prototype.toUTCString ( )
  // 20.3.4.44 Date.prototype.valueOf ( )
  // 20.3.4.45 Date.prototype [ @@toPrimitive ] ( hint )
  // 20.3.5 Properties of Date Instances

  // (No polyfillable changes from ES5)

  // ---------------------------------------
  // 21 Text Processing
  // ---------------------------------------

  // 21.1 String Objects
  // 21.1.1 The String Constructor
  // 21.1.1.1 String ( value )
  // 21.1.1.2 new String ( ...argumentsList )
  // 21.1.2 Properties of the String Constructor
  // 21.1.2.1 String.fromCharCode ( ...codeUnits )

  // 21.1.2.2 String.fromCodePoint ( ...codePoints )
  define(
    String, 'fromCodePoint',
    function fromCodePoint(/*...codePoints*/) {
      var codePoints = arguments,
          length = codePoints.length,
          elements = [],
          nextIndex = 0;
      while (nextIndex < length) {
        var next = codePoints[nextIndex];
        var nextCP = Number(next);
        if (!SameValue(nextCP, ToInteger(nextCP)) ||
            nextCP < 0 || nextCP > 0x10FFFF) {
          throw RangeError('Invalid code point ' + nextCP);
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

  // 21.1.2.4 String.raw ( callSite , ...substitutions )
  define(
    String, 'raw',
    function raw(callSite /*, ...substitutions*/) {
      var substitutions = [].slice.call(arguments, 1);

      var cooked = Object(callSite);
      var rawValue = cooked['raw'];
      var raw = Object(rawValue);
      var len = raw['length'];
      var literalSegments = ToLength(len);
      if (literalSegments <= 0) return '';
      var stringElements = [];
      var nextIndex = 0;
      while (true) {
        var next = raw[nextIndex];
        var nextSeg = String(next);
        stringElements.push(nextSeg);
        if (nextIndex + 1 === literalSegments)
          return stringElements.join('');
        next = substitutions[nextIndex];
        var nextSub = String(next);
        stringElements.push(nextSub);
        nextIndex = nextIndex + 1;
      }
    });

  // See https://githib.com/inexorabletash/uate for a more useful version.

  // 21.1.2.5 String[ @@create ] ( )
  // 21.1.3 Properties of the String Prototype Object
  // 21.1.3.1 String.prototype.charAt ( pos )
  // 21.1.3.2 String.prototype.charCodeAt ( pos )

  // 21.1.3.3 String.prototype.codePointAt ( pos )
  define(
    String.prototype, 'codePointAt',
    function codePointAt(pos) {
      var s = String(this),
          position = ToInteger(pos),
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
  // 21.1.3.6 String.prototype.contains ( searchString [ , position ] )
  define(
    String.prototype, 'contains',
    function contains(searchString) {
      var position = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var pos = ToInteger(position);
      var len = s.length;
      var start = min(max(pos, 0), len);
      return s.indexOf(searchStr, pos) !== -1;
    });

  // 21.1.3.7 String.prototype.endsWith ( searchString [ , endPosition] )
  define(
    String.prototype, 'endsWith',
    function endsWith(searchString) {
      var endPosition = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var len = s.length;
      var pos = (endPosition === undefined) ? len : ToInteger(endPosition);
      var end = min(max(pos, 0), len);
      var searchLength = searchStr.length;
      var start = end - searchLength;
      if (start < 0) return false;
      if (s.substring(start, start + searchLength) === searchStr) return true;
      return false;
    });

  // 21.1.3.8 String.prototype.indexOf ( searchString [ , position ] )
  // 21.1.3.9 String.prototype.lastIndexOf ( searchString [ , position ] )
  // 21.1.3.10 String.prototype.localeCompare ( that [, reserved1 [ , reserved2 ] ] )
  // 21.1.3.11 String.prototype.match ( regexp )
  // 21.1.3.12 String.prototype.normalize ( [ form ] )

  // TODO - probably not practical due to table sizes.

  // 21.1.3.13 String.prototype.repeat ( count )
  define(
    String.prototype, 'repeat',
    function repeat(count) {
      var o = strict(this);
      var s = String(o);
      var n = ToInteger(count);
      if (n < 0) throw RangeError();
      if (n === Infinity) throw RangeError();
      var t = new Array(n + 1).join(s);
      return t;
    });

  // 21.1.3.14 String.prototype.replace (searchValue, replaceValue )
  // 21.1.3.15 String.prototype.search ( regexp )
  // 21.1.3.16 String.prototype.slice ( start, end )
  // 21.1.3.17 String.prototype.split ( separator, limit )

  // 21.1.3.18 String.prototype.startsWith ( searchString [, position ] )
  define(
    String.prototype, 'startsWith',
    function startsWith(searchString) {
      var position = arguments[1];

      var o = strict(this);
      var s = String(o);
      var searchStr = String(searchString);
      var pos = ToInteger(position);
      var len = s.length;
      var start = min(max(pos, 0), len);
      var searchLength = searchStr.length;
      if (searchLength + start > len) return false;
      if (s.substring(start, start + searchLength) === searchStr) return true;
      return false;
    });

  // 21.1.3.19 String.prototype.substring ( start, end )
  // 21.1.3.20 String.prototype.toLocaleLowerCase ( )
  // 21.1.3.21 String.prototype.toLocaleUpperCase ( )
  // 21.1.3.22 String.prototype.toLowerCase ( )
  // 21.1.3.23 String.prototype.toString ( )
  // 21.1.3.24 String.prototype.toUpperCase ( )
  // 21.1.3.25 String.prototype.trim ( )
  // 21.1.3.26 String.prototype.valueOf ( )

  // 21.1.3.27 String.prototype [ @@iterator ]( )
  define(
    String.prototype, $$iterator,
    function entries() {
      return CreateStringIterator(this, 'value');
    });

  // 21.1.4 Properties of String Instances
  // 21.1.4.1 length

  // 21.1.5 String Iterator Objects
  /** @constructor */
  function StringIterator() {}

  // 21.1.5.1 CreateStringIterator Abstract Operation
  function CreateStringIterator(string, kind) {
    var s = String(string);
    var iterator = new StringIterator;
    set_internal(iterator, '[[IteratedString]]', s);
    set_internal(iterator, '[[StringIteratorNextIndex]]', 0);
    set_internal(iterator, '[[StringIterationKind]]', kind);
    return iterator;
  }

  // 21.1.5.2 The %StringIteratorPrototype% Object
  StringIterator.prototype = new function $StringIteratorPrototype$() {};

  // 21.1.5.2.1 %StringIteratorPrototype%.next ( )
  define(
    StringIterator.prototype, 'next',
    function next() {
      var o = ToObject(this);
      var s = String(o['[[IteratedString]]']),
          index = o['[[StringIteratorNextIndex]]'],
          len = s.length;
      if (index >= len) {
        set_internal(o, '[[StringIteratorNextIndex]]', Infinity);
        return CreateIterResultObject(undefined, true);
      }
      var cp = s.codePointAt(index);
      set_internal(o, '[[StringIteratorNextIndex]]', index + (cp > 0xFFFF ? 2 : 1));
      return CreateIterResultObject(String.fromCodePoint(cp), false);
    });

  // 21.1.5.2.2 %StringIteratorPrototype% [ @@iterator ] ( )
  define(
    StringIterator.prototype, $$iterator,
    function() {
      return this;
    });

  // 21.1.5.2.3 %StringIteratorPrototype% [ @@toStringTag ]
  define(StringIterator.prototype, $$toStringTag, 'String Iterator');

  // 21.1.5.3 Properties of String Iterator Instances

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
  // 21.2.3.1 RegExp ( pattern, flags )
  // 21.2.3.2 new RegExp( ...argumentsList )
  // 21.2.3.3 Abstract Operations for the RegExp Constructor
  // 21.2.4 Properties of the RegExp Constructor
  // 21.2.4.1 RegExp.prototype
  // 21.2.4.2 RegExp[ @@create ] ( )
  // 21.2.5 Properties of the RegExp Prototype Object
  // 21.2.5.1 RegExp.prototype.constructor
  // 21.2.5.2 RegExp.prototype.exec ( string )
  // 21.2.5.3 get RegExp.prototype.global
  // 21.2.5.4 get RegExp.prototype.ignoreCase

  // 21.2.5.5 RegExp.prototype.match ( string )
  define(RegExp.prototype, 'match', function match(string) {
    var o = strict(this);
    return String(string).match(o);
  });

  // 21.2.5.6 get RegExp.prototype.multiline

  // 21.2.5.7 RegExp.prototype.replace ( string, replaceValue )
  define(RegExp.prototype, 'replace', function replace(S, replaceValue) {
    var o = strict(this);
    return String(S).replace(o, replaceValue);
  });

  // 21.2.5.8 RegExp.prototype.search ( string )
  define(RegExp.prototype, 'search', function search(S) {
    var o = strict(this);
    return String(S).search(o);
  });

  // 21.2.5.9 get RegExp.prototype.source

  // 21.2.5.10 RegExp.prototype.split ( string, limit )
  define(RegExp.prototype, 'split', function split(S) {
    var o = strict(this);
    return String(S).split(o);
  });

  // 21.2.5.11 get RegExp.prototype.sticky
  // 21.2.5.12 RegExp.prototype.test( S )
  // 21.2.5.13 RegExp.prototype.toString ( )
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
  // 22.1.1.1 Array ( )
  // 22.1.1.2 Array (len)
  // 22.1.1.3 Array (...items )
  // 22.1.1.3 new Array ( ... argumentsList)
  // 22.1.2 Properties of the Array Constructor

  // 22.1.2.1 Array.from ( arrayLike [ , mapfn [ , thisArg ] ] )
  define(
    Array, 'from',
    function from(arrayLike) {
      var mapfn = arguments[1];
      var thisArg = arguments[2];

      var c = strict(this);
      var items = ToObject(arrayLike);
      if (mapfn === undefined) {
        var mapping = false;
      } else {
        if (!IsCallable(mapfn)) throw TypeError();
        var t = thisArg;
        mapping = true;
      }
      var usingIterator = CheckIterable(items);
      if (usingIterator !== undefined) {
        var iterator = GetIterator(items, usingIterator);
        if (IsConstructor(c)) {
          // SPEC: Spec bug: A vs. newObj
          var newObj = new c();
          var a = ToObject(newObj);
        } else {
          a = new Array();
        }
        var k = 0;
        while (true) {
          var next = IteratorStep(iterator);
          if (next === false) {
            a.length = k;
            return a;
          }
          var nextValue = IteratorValue(next);
          if (mapping) {
            var mappedValue = mapfn.call(t, nextValue);
          } else {
            mappedValue = nextValue;
          }
          a[k] = mappedValue;
          ++k;
        }
      }
      var lenValue = items.length;
      var len = ToInteger(lenValue);
      if (IsConstructor(c)) {
        newObj = new c(len);
        a = ToObject(newObj);
      } else {
        a = new Array(len);
      }
      k = 0;
      while (k < len) {
        var kPresent = HasProperty(items, k);
        if (kPresent) {
          var kValue = items[k];
          if (mapping) {
            mappedValue = mapfn.call(t, kValue, k, items);
          } else {
            mappedValue = kValue;
          }
          a[k] = mappedValue;
        }
        ++k;
      }
      return a;
    });

  // 22.1.2.2 Array.isArray ( arg )

  // 22.1.2.3 Array.of ( ...items )
  define(
    Array, 'of',
    function of() {
      var items = arguments;

      var lenValue = items.length;
      var len = ToUint32(lenValue);
      var c = this, a;
      if (IsConstructor(c)) {
        a = new c(len);
        a = ToObject(a);
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

  // 22.1.2.4 Array.prototype
  // 22.1.2.5 Array[ @@create ] ( )
  // 22.1.3 Properties of the Array Prototype Object
  // 22.1.3.1 Array.prototype.concat ( ...arguments )
  // 22.1.3.1.1 IsConcatSpreadable ( O ) Abstract Operation
  // 22.1.3.2 Array.prototype.constructor
  // 22.1.3.3 Array.prototype.copyWithin (target, start [ , end ] )
  define(
    Array.prototype, 'copyWithin',
    function copyWithin(target, start/*, end*/) {
      var end = arguments[2];

      var o = ToObject(this);
      var lenVal = o.length;
      var len = ToLength(lenVal);
      len = max(len, 0);
      var relativeTarget = ToInteger(target);
      var to;
      if (relativeTarget < 0)
        to = max(len + relativeTarget, 0);
      else
        to = min(relativeTarget, len);
      var relativeStart = ToInteger(start);
      var from;
      if (relativeStart < 0)
        from = max(len + relativeStart, 0);
      else
        from = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = ToInteger(end);
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
        var fromPresent = HasProperty(o, fromKey);
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
  define(
    Array.prototype, 'entries',
    function entries() {
      return CreateArrayIterator(this, 'key+value');
    });

  // 22.1.3.5 Array.prototype.every ( callbackfn [ , thisArg] )

  // 22.1.3.6 Array.prototype.fill (value [ , start [ , end ] ] )
  define(
    Array.prototype, 'fill',
    function fill(value/*, start, end*/) {
      var start = arguments[1],
          end = arguments[2];

      var o = ToObject(this);
      var lenVal = o.length;
      var len = ToLength(lenVal);
      len = max(len, 0);
      var relativeStart = ToInteger(start);
      var k;
      if (relativeStart < 0)
        k = max((len + relativeStart), 0);
      else
        k = min(relativeStart, len);
      var relativeEnd;
      if (end === undefined)
        relativeEnd = len;
      else
        relativeEnd = ToInteger(end);
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

  // 22.1.3.8 Array.prototype.find ( predicate [ , thisArg ] )
  define(
    Array.prototype, 'find',
    function find(predicate) {
      var o = ToObject(this);
      var lenValue = o.length;
      var len = ToInteger(lenValue);
      if (!IsCallable(predicate)) throw TypeError();
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = HasProperty(o, pk);
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

  // 22.1.3.9 Array.prototype.findIndex ( predicate [ , thisArg ] )
  define(
    Array.prototype, 'findIndex',
    function findIndex(predicate) {
      var o = ToObject(this);
      var lenValue = o.length;
      var len = ToLength(lenValue);
      if (!IsCallable(predicate)) throw TypeError();
      var t = arguments.length > 1 ? arguments[1] : undefined;
      var k = 0;
      while (k < len) {
        var pk = String(k);
        var kPresent = HasProperty(o, pk);
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
  define(
    Array.prototype, 'keys',
    function keys() {
      return CreateArrayIterator(this, 'key');
    });

  // 22.1.3.14 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
  // 22.1.3.15 Array.prototype.map ( callbackfn [ , thisArg ] )
  // 22.1.3.16 Array.prototype.pop ( )
  // 22.1.3.17 Array.prototype.push ( ...items )
  // 22.1.3.18 Array.prototype.reduce ( callbackfn [ , initialValue ] )
  // 22.1.3.19 Array.prototype.reduceRight ( callbackfn [ , initialValue ] )
  // 22.1.3.20 Array.prototype.reverse ( )
  // 22.1.3.21 Array.prototype.shift ( )
  // 22.1.3.22 Array.prototype.slice (start, end)
  // 22.1.3.23 Array.prototype.some ( callbackfn [ , thisArg ] )
  // 22.1.3.24 Array.prototype.sort (comparefn)
  // 22.1.3.25 Array.prototype.splice (start, deleteCount , ...items )
  // 22.1.3.26 Array.prototype.toLocaleString ( [ reserved1 [ , reserved2 ] ] )
  // 22.1.3.27 Array.prototype.toString ( )
  // 22.1.3.28 Array.prototype.unshift ( ...items )

  // 22.1.3.29 Array.prototype.values ( )
  define(
    Array.prototype, 'values',
    function values() {
      return CreateArrayIterator(this, 'value');
    });

  // 22.1.3.30 Array.prototype [ @@iterator ] ( )
  define(
    Array.prototype, $$iterator,
    Array.prototype.values
    );

  // 22.1.3.31 Array.prototype [ @@unscopables ]
  // 22.1.4 Properties of Array Instances
  // 22.1.4.1 length

  // 22.1.5 Array Iterator Objects
  function ArrayIterator() {}

  // 22.1.5.1 CreateArrayIterator Abstract Operation
  function CreateArrayIterator(array, kind) {
    var o = ToObject(array);
    var iterator = new ArrayIterator;
    set_internal(iterator, '[[IteratedObject]]', o);
    set_internal(iterator, '[[ArrayIteratorNextIndex]]', 0);
    set_internal(iterator, '[[ArrayIterationKind]]', kind);
    return iterator;
  }

  // 22.1.5.2 The %ArrayIteratorPrototype% Object
  ArrayIterator.prototype = new function $ArrayIteratorPrototype$() {};

  // 22.1.5.2.1 %ArrayIteratorPrototype%. next( )
  define(
    ArrayIterator.prototype, 'next',
    function next() {
      var o = strict(this);
      if (Type(o) !== 'object') throw TypeError();
      var a = o['[[IteratedObject]]'],
          index = o['[[ArrayIteratorNextIndex]]'],
          itemKind = o['[[ArrayIterationKind]]'],
          lenValue = a.length,
          len = ToUint32(lenValue),
          elementKey,
          elementValue;
      if (itemKind.indexOf('sparse') !== -1) {
        var found = false;
        while (!found && index < len) {
          elementKey = String(index);
          found = HasProperty(a, elementKey);
          if (!found) {
            index += 1;
          }
        }
      }
      if (index >= len) {
        set_internal(o, '[[ArrayIteratorNextIndex]]', Infinity);
        return CreateIterResultObject(undefined, true);
      }
      elementKey = index;
      set_internal(o, '[[ArrayIteratorNextIndex]]', index + 1);
      if (itemKind.indexOf('value') !== -1) {
        elementValue = a[elementKey];
      }
      if (itemKind.indexOf('key+value') !== -1) {
        return CreateIterResultObject([elementKey, elementValue], false);
      } else if (itemKind.indexOf('key') !== -1) {
        return CreateIterResultObject(elementKey, false);
      } else if (itemKind === 'value') {
        return CreateIterResultObject(elementValue, false);
      }
      throw Error('Internal error');
    });

  // 22.1.5.2.2 %ArrayIteratorPrototype% [ @@iterator ] ( )
  define(
    ArrayIterator.prototype, $$iterator,
    function() {
      return this;
    });

  // 22.1.5.2.3 %ArrayIteratorPrototype% [ @@toStringTag ]
  define(ArrayIterator.prototype, $$toStringTag, 'Array Iterator');

  // 22.1.5.3 Properties of Array Iterator Instances


  // ---------------------------------------
  // 22.2 TypedArray Objects
  // ---------------------------------------

  // See typedarray.js for TypedArray polyfill

  ['Int8Array', 'Uint8Array', 'Uint8ClampedArray',
   'Int16Array', 'Uint16Array',
   'Int32Array', 'Uint32Array',
   'Float32Array', 'Float64Array'].forEach(function ($TypedArrayName$) {
     if (!($TypedArrayName$ in global))
       return;
     var $TypedArray$ = global[$TypedArrayName$];

     // 22.2.1 The %TypedArray% Intrinsic Object
     // 22.2.1.1 %TypedArray% ( length )
     // 22.2.1.2 %TypedArray% ( typedArray )
     // 22.2.1.3 %TypedArray% ( array )
     // 22.2.1.4 %TypedArray% ( buffer, byteOffset=0, length=undefined )
     // 22.2.1.5 %TypedArray% ( all other argument combinations )
     // 22.2.2 Properties of the %TypedArray% Intrinsic Object

     // 22.2.2.1 %TypedArray%.from ( source , mapfn=undefined, thisArg=undefined )
     define(
       $TypedArray$, 'from',
       function from(source) {
         var mapfn = arguments[1];
         var thisArg = arguments[2];

         var c = strict(this);
         if (!IsConstructor(c)) throw TypeError();
         var items = ToObject(source);
         if (mapfn === undefined) {
           var mapping = false;
         } else {
           if (IsCallable(mapfn)) throw TypeError();
           var t = thisArg;
           mapping = true;
         }
         var usingIterator = CheckIterable(items);
         if (usingIterator !== undefined) {
           var iterator = GetIterator(items, usingIterator);
           var values = [];
           var next = true;
           while (next !== false) {
             next = IteratorStep(iterator);
             if (next !== false) {
               var nextValue = IteratorValue(next);
               values.push(nextValue);
             }
           }
           var len = values.length;
           var newObj = new c(len);
           var k = 0;
           while (k < len) {
             var kValue = values.shift();
             if (mapping) {
               var mappedValue = mapfn.call(t, kValue);
             } else {
               mappedValue = kValue;
             }
             newObj[k] = mappedValue;
             ++k;
           }
           assert(values.length === 0);
           return newObj;
         }
         var lenValue = items.length;
         len = ToLength(lenValue);
         newObj = new c(len);
         k = 0;
         while (k < len) {
           kValue = items[k];
           if (mapping) {
             mappedValue = mapfn.call(t, kValue, k, items);
           } else {
             mappedValue = kValue;
           }
           newObj[k] = mappedValue;
           ++k;
         }
         return newObj;
       });

     // 22.2.2.2 %TypedArray%.of ( ...items )
     define(
       $TypedArray$, 'of',
       function of() {
         var items = arguments;

         var len = items.length;
         var c = strict(this);
         var newObj = new c(len);
         var k = 0;
         while (k < len) {
           newObj[k] = items[k];
           ++k;
         }
         return newObj;
       });

     // 22.2.2.3 %TypedArray%.prototype
     // 22.2.2.4 %TypedArray% [ @@create ] ( )
     // 22.2.3 Properties of the %TypedArrayPrototype% Object
     // 22.2.3.1 get %TypedArray%.prototype.buffer
     // 22.2.3.2 get %TypedArray%.prototype.byteLength
     // 22.2.3.3 get %TypedArray%.prototype.byteOffset
     // 22.2.3.4 %TypedArray%.prototype.constructor

     // 22.2.3.5 %TypedArray%.prototype.copyWithin (target, start, end = this.length )
     define($TypedArray$.prototype, 'copyWithin', Array.prototype.copyWithin);

     // 22.2.3.6 %TypedArray%.prototype.entries ( )
     define($TypedArray$.prototype, 'entries', Array.prototype.entries);

     // 22.2.3.7 %TypedArray%.prototype.every ( callbackfn, thisArg = undefined )
     define($TypedArray$.prototype, 'every', Array.prototype.every);

     // 22.2.3.8 %TypedArray%.prototype.fill (value, start = 0, end = this.length )
     define($TypedArray$.prototype, 'fill', Array.prototype.fill);

     // 22.2.3.9 %TypedArray%.prototype.filter ( callbackfn, thisArg = undefined )
     define(
       $TypedArray$.prototype, 'filter',
       function filter(callbackfn) {
         var thisArg = arguments[1];

         var o = ToObject(this);
         var lenVal = o.length;
         var len = ToLength(lenVal);
         if (!IsCallable(callbackfn)) throw TypeError();
         var t = thisArg;
         var c = o.constructor;
         var kept = [];
         var k = 0;
         var captured = 0;
         while (k < len) {
           var kValue = o[k];
           var selected = callbackfn.call(t, kValue, k, o);
           if (selected) {
             kept.push(kValue);
             ++captured;
           }
           ++k;
         }
         var a = new c(captured);
         var n = 0;
         for (var i = 0; i < kept.length; ++i) {
           var e = kept[i];
           a[n] = e;
           ++n;
         }
         return a;
       });

     // 22.2.3.10 %TypedArray%.prototype.find (predicate, thisArg = undefined)
     define($TypedArray$.prototype, 'find', Array.prototype.find);

     // 22.2.3.11 %TypedArray%.prototype.findIndex ( predicate, thisArg = undefined )
     define($TypedArray$.prototype, 'findIndex', Array.prototype.findIndex);

     // 22.2.3.12 %TypedArray%.prototype.forEach ( callbackfn, thisArg = undefined )
     define($TypedArray$.prototype, 'forEach', Array.prototype.forEach);

     // 22.2.3.13 %TypedArray%.prototype.indexOf (searchElement, fromIndex = 0 )
     define($TypedArray$.prototype, 'indexOf', Array.prototype.indexOf);

     // 22.2.3.14 %TypedArray%.prototype.join ( separator )
     define($TypedArray$.prototype, 'join', Array.prototype.join);

     // 22.2.3.15 %TypedArray%.prototype.keys ( )
     define($TypedArray$.prototype, 'keys', Array.prototype.keys);

     // 22.2.3.16 %TypedArray%.prototype.lastIndexOf ( searchElement, fromIndex = this.length-1 )
     define($TypedArray$.prototype, 'lastIndexOf', Array.prototype.lastIndexOf);

     // 22.2.3.17 get %TypedArray%.prototype.length

     // 22.2.3.18 %TypedArray%.prototype.map ( callbackfn, thisArg = undefined )
     define(
       $TypedArray$.prototype, 'map',
       function map(callbackfn) {
         var thisArg = arguments[1];

         var o = ToObject(this);
         var lenValue = o.length;
         var len = ToLength(lenValue);
         if (!IsCallable(callbackfn)) throw TypeError();
         var t = thisArg;
         var a = undefined;
         var c = o.constructor;
         if (IsConstructor(c))
           a = new c(len);
         if (a === undefined)
           a = new Array(len);
         var k = 0;
         while (k < len) {
           var kPresent = HasProperty(o, k);
           if (kPresent) {
             var kValue = o[k];
             var mappedValue = callbackfn.call(t, kValue, k, o);
             a[k] = mappedValue;
           }
           ++k;
         }
         return a;
       });

     // 22.2.3.19 %TypedArray%.prototype.reduce ( callbackfn [, initialValue] )
     define($TypedArray$.prototype, 'reduce', Array.prototype.reduce);

     // 22.2.3.20 %TypedArray%.prototype.reduceRight ( callbackfn [, initialValue] )
     define($TypedArray$.prototype, 'reduceRight', Array.prototype.reduceRight);

     // 22.2.3.21 %TypedArray%.prototype.reverse ( )
     define($TypedArray$.prototype, 'reverse', Array.prototype.reverse);

     // 22.2.3.22 %TypedArray%.prototype.set(array, offset = 0 )
     // 22.2.3.23 %TypedArray%.prototype.set(typedArray, offset = 0 )

     // 22.2.3.24 %TypedArray%.prototype.slice ( start, end )
     define(
       $TypedArray$.prototype, 'slice',
       function slice(start, end) {
         var o = ToObject(this);
         var lenVal = o.length;
         var len = ToLength(lenVal);
         var relativeStart = ToInteger(start);
         var k = (relativeStart < 0) ? max(len + relativeStart, 0) : min(relativeStart, len);
         var relativeEnd = (end === undefined) ? len : ToInteger(end);
         var final = (relativeEnd < 0) ? max(len + relativeEnd, 0) : min(relativeEnd, len);
         var count = final - k;
         var c = o.constructor;
         if (IsConstructor(c)) {
           var a = new c(count);
         } else {
           throw TypeError();
         }
         var n = 0;
         while (k < final) {
           var kValue = o[k];
           a[n] = kValue;
           ++k;
           ++n;
         }
         return a;
       });

     // 22.2.3.25 %TypedArray%.prototype.some ( callbackfn, thisArg = undefined )
     define($TypedArray$.prototype, 'some', Array.prototype.some);

     // 22.2.3.26 %TypedArray%.prototype.sort ( comparefn )
     define(
       $TypedArray$.prototype, 'sort',
       function sort() {
         var comparefn = arguments[0];

         function sortCompare(x, y) {
           assert(Type(x) === 'number' && Type(y) === 'number');
           if (x !== x && y !== y) return +0;
           if (x !== x) return 1;
           if (y !== y) return -1;
           if (comparefn !== undefined) {
             return comparefn(x, y);
           }
           if (x < y) return -1;
           if (x > y) return 1;
           return +0;
         }
         return Array.prototype.sort.call(this, sortCompare);
       });

     // 22.2.3.27 %TypedArray%.prototype.subarray(begin = 0, end = this.length )
     // 22.2.3.28 %TypedArray%.prototype.toLocaleString ( )
     // 22.2.3.29 %TypedArray%.prototype.toString ( )

     // 22.2.3.30 %TypedArray%.prototype.values ( )
     define($TypedArray$.prototype, 'values', Array.prototype.values);

     // 22.2.3.31 %TypedArray%.prototype [ @@iterator ] ( )
     define(
       $TypedArray$.prototype, $$iterator,
       $TypedArray$.prototype.values
     );

     // 22.2.3.32 get %TypedArray%.prototype [ @@toStringTag ]
     define($TypedArray$.prototype, $$toStringTag, $TypedArrayName$);

     // 22.2.4 The TypedArray Constructors
     // 22.2.4.1 new TypedArray( ...argumentsList )
     // 22.2.4.2 new TypedArray( ...argumentsList )
     // 22.2.5 Properties of the TypedArray Constructors
     // 22.2.5.1 TypedArray.BYTES_PER_ELEMENT
     // 22.2.5.2 TypedArray.prototype
     // 22.2.6 Properties of TypedArray Prototype Objects
     // 22.2.6.1 TypedArray.prototype.BYTES_PER_ELEMENT
     // 22.2.6.2 TypedArray.prototype.constructor
     // 22.2.7 Properties of TypedArray Instances
   });

  // ---------------------------------------
  // 23 Keyed Collection
  // ---------------------------------------

  // ---------------------------------------
  // 23.1 Map Objects
  // ---------------------------------------

  (function() {
    // 23.1.1 The Map Constructor

    // 23.1.1.1 Map ( [ iterable ] )
    /** @constructor */
    function Map(iterable) {
      var map = strict(this);

      if (Type(map) !== 'object') throw TypeError();
      if ('[[MapData]]' in map) throw TypeError();

      if (iterable !== undefined) {
        var adder = map['set'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(map, '[[MapData]]', { keys: [], values: [] });
      if (iter === undefined) return map;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return map;
        var nextItem = IteratorValue(next);
        if (Type(nextItem) !== 'object') throw TypeError();
        var k = nextItem[0];
        var v = nextItem[1];
        adder.call(map, k, v);
      }

      return map;
    }

    function MapDataIndexOf(mapData, key) {
      var i;
      if (key === key) return mapData.keys.indexOf(key);
      // Slow case for NaN
      for (i = 0; i < mapData.keys.length; i += 1)
        if (SameValueZero(mapData.keys[i], key)) return i;
      return -1;
    }

    // 23.1.1.2 new Map ( ... argumentsList )
    // 23.1.2 Properties of the Map Constructor
    // 23.1.2.1 Map.prototype
    Map.prototype = new function $MapPrototype$() {};

    // 23.1.2.2 Map[ @@create ] ( )
    // 23.1.3 Properties of the Map Prototype Object
    // 23.1.3.1 Map.prototype.clear ()
    define(
      Map.prototype, 'clear',
      function clear() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        entries.keys.length = 0;
        entries.values.length = 0;
        return undefined;
      });

    // 23.1.3.2 Map.prototype.constructor

    // 23.1.3.3 Map.prototype.delete ( key )
    define(
      Map.prototype, 'delete',
      function delete_(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i < 0) return false;
        entries.keys[i] = empty;
        entries.values[i] = empty;
        return true;
      });

    // 23.1.3.4 Map.prototype.entries ( )
    define(
      Map.prototype, 'entries',
      function entries() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.5 Map.prototype.forEach ( callbackfn [ , thisArg ] )
    define(
      Map.prototype, 'forEach',
      function forEach(callbackfn /*, thisArg*/) {
        var thisArg = arguments[1];

        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];

        if (!IsCallable(callbackfn)) {
          throw TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.keys.length; ++i) {
          if (entries.keys[i] !== empty) {
            callbackfn.call(thisArg, entries.values[i], entries.keys[i], m);
          }
        }
        return undefined;
      });

    // 23.1.3.6 Map.prototype.get ( key )
    define(
      Map.prototype, 'get',
      function get(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i >= 0) return entries.values[i];
        return undefined;
      });

    // 23.1.3.7 Map.prototype.has ( key )
    define(
      Map.prototype, 'has',
      function has(key) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        var entries = m['[[MapData]]'];
        if (MapDataIndexOf(entries, key) >= 0) return true;
        return false;
      });

    // 23.1.3.8 Map.prototype.keys ( )
    define(
      Map.prototype, 'keys',
      function keys() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key');
      });

    // 23.1.3.9 Map.prototype.set ( key , value )
    define(
      Map.prototype, 'set',
      function set(key, value) {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        if (!('[[MapData]]' in m)) throw TypeError();
        if (m['[[MapData]]'] === undefined) throw TypeError();
        if (SameValue(value, -0)) value = 0;
        var entries = m['[[MapData]]'];
        var i = MapDataIndexOf(entries, key);
        if (i < 0) i = entries.keys.length;
        entries.keys[i] = key;
        entries.values[i] = value;
        return m;
      });

    // 23.1.3.10 get Map.prototype.size
    Object.defineProperty(
      Map.prototype, 'size', {
        get: function() {
          var m = strict(this);
          if (Type(m) !== 'object') throw TypeError();
          if (!('[[MapData]]' in m)) throw TypeError();
          if (m['[[MapData]]'] === undefined) throw TypeError();
          var entries = m['[[MapData]]'];
          var count = 0;
          for (var i = 0; i < entries.keys.length; ++i) {
            if (entries.keys[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.1.3.11 Map.prototype.values ( )
    define(
      Map.prototype, 'values',
      function values() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'value');
      });

    // 23.1.3.12 Map.prototype [ @@iterator ]( )
    define(
      Map.prototype, $$iterator,
      function() {
        var m = strict(this);
        if (Type(m) !== 'object') throw TypeError();
        return CreateMapIterator(m, 'key+value');
      });

    // 23.1.3.13 Map.prototype [ @@toStringTag ]
    define(Map.prototype, $$toStringTag, 'Map');

    // 23.1.4 Properties of Map Instances
    // 23.1.5 Map Iterator Object

    /** @constructor */
    function MapIterator() {}

    // 23.1.5.1 CreateMapIterator Abstract Operation
    function CreateMapIterator(map, kind) {
      if (Type(map) !== 'object') throw TypeError();
      if (!('[[MapData]]' in map)) throw TypeError();
      if (map['[[MapData]]'] === undefined) throw TypeError();
      var iterator = new MapIterator;
      set_internal(iterator, '[[Map]]', map);
      set_internal(iterator, '[[MapNextIndex]]', 0);
      set_internal(iterator, '[[MapIterationKind]]', kind);
      return iterator;
    }

    // 23.1.5.2 The %MapIteratorPrototype% Object
    MapIterator.prototype = new function $MapIteratorPrototype$() {};

    // 23.1.5.2.1 %MapIteratorPrototype%.next ( )
    define(
      MapIterator.prototype, 'next',
      function next() {
        var o = strict(this);
        if (Type(o) !== 'object') throw TypeError();
        var m = o['[[Map]]'],
            index = o['[[MapNextIndex]]'],
            itemKind = o['[[MapIterationKind]]'],
            entries = m['[[MapData]]'];
        while (index < entries.keys.length) {
          var e = {key: entries.keys[index], value: entries.values[index]};
          index = index += 1;
          set_internal(o, '[[MapNextIndex]]', index);
          if (e.key !== empty) {
            if (itemKind === 'key') {
              return CreateIterResultObject(e.key, false);
            } else if (itemKind === 'value') {
              return CreateIterResultObject(e.value, false);
            } else {
              return CreateIterResultObject([e.key, e.value], false);
            }
          }
        }
        return CreateIterResultObject(undefined, true);
      });

    // 23.1.5.2.2 %MapIteratorPrototype% [ @@iterator ] ( )
    define(
      MapIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 23.1.5.2.3 %MapIteratorPrototype% [ @@toStringTag ]
    define(MapIterator.prototype, $$toStringTag, 'Map Iterator');

    // 23.1.5.3 Properties of Map Iterator Instances

    if (!global.Map || new global.Map([['a', 1]]).size !== 1)
      global.Map = Map;
  }());

  // ---------------------------------------
  // 23.2 Set Objects
  // ---------------------------------------

  (function() {
    // 23.2.1 The Set Constructor
    // 23.2.1.1 Set ( [ iterable ] )

    /** @constructor */
    function Set(iterable) {
      var set = strict(this);

      if (Type(set) !== 'object') throw TypeError();
      if ('[[SetData]]' in set) throw TypeError();

      if (iterable !== undefined) {
        var adder = set['add'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(set, '[[SetData]]', []);
      if (iter === undefined) return set;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return set;
        var nextValue = IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    function SetDataIndexOf(setData, key) {
      var i;
      if (key === key)
        return setData.indexOf(key);
      // Slow case for NaN
      for (i = 0; i < setData.length; i += 1)
        if (SameValueZero(setData[i], key)) return i;
      return -1;
    }

    // 23.2.1.2 new Set ( ...argumentsList )
    // 23.2.2 Properties of the Set Constructor

    // 23.2.2.1 Set.prototype
    Set.prototype = new function $SetPrototype$() {};

    // 23.2.2.2 Set[ @@create ] ( )
    // 23.2.3 Properties of the Set Prototype Object

    // 23.2.3.1 Set.prototype.add (value )
    define(
      Set.prototype, 'add',
      function add(value) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        if (SameValue(value, -0)) value = 0;
        var entries = s['[[SetData]]'];
        var i = SetDataIndexOf(entries, value);
        if (i < 0) i = s['[[SetData]]'].length;
        s['[[SetData]]'][i] = value;

        return s;
      });

    // 23.2.3.2 Set.prototype.clear ()
    define(
      Set.prototype, 'clear',
      function clear() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        entries.length = 0;
        return undefined;
      });

    // 23.2.3.3 Set.prototype.constructor
    // 23.2.3.4 Set.prototype.delete ( value )
    define(
      Set.prototype, 'delete',
      function delete_(value) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        var i = SetDataIndexOf(entries, value);
        if (i < 0) return false;
        entries[i] = empty;
        return true;
      });

    // 23.2.3.5 Set.prototype.entries ( )
    define(
      Set.prototype, 'entries',
      function entries() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s, 'key+value');
      });

    // 23.2.3.6 Set.prototype.forEach ( callbackfn [ , thisArg ] )
    define(
      Set.prototype, 'forEach',
      function forEach(callbackfn/*, thisArg*/) {
        var thisArg = arguments[1];

        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];

        if (!IsCallable(callbackfn)) {
          throw TypeError('First argument to forEach is not callable.');
        }
        for (var i = 0; i < entries.length; ++i) {
          if (entries[i] !== empty) {
            callbackfn.call(thisArg, entries[i], entries[i], s);
          }
        }
      });

    // 23.2.3.7 Set.prototype.has ( value )
    define(
      Set.prototype, 'has',
      function has(key) {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        if (!('[[SetData]]' in s)) throw TypeError();
        if (s['[[SetData]]'] === undefined) throw TypeError();
        var entries = s['[[SetData]]'];
        return SetDataIndexOf(entries, key) !== -1;
      });

    // 23.2.3.8 Set.prototype.keys ( )
    // See Set.prototype.values

    // 23.2.3.9 get Set.prototype.size
    Object.defineProperty(
      Set.prototype, 'size', {
        get: function() {
          var s = strict(this);
          if (Type(s) !== 'object') throw TypeError();
          if (!('[[SetData]]' in s)) throw TypeError();
          if (s['[[SetData]]'] === undefined) throw TypeError();
          var entries = s['[[SetData]]'];
          var count = 0;
          for (var i = 0; i < entries.length; ++i) {
            if (entries[i] !== empty)
              count = count + 1;
          }
          return count;
        }
      });

    // 23.2.3.10 Set.prototype.values ( )
    define(
      Set.prototype, 'values',
      function values() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s);
      });
    // NOTE: function name is still 'values':
    Set.prototype.keys = Set.prototype.values;

    // 23.2.3.11 Set.prototype [@@iterator ] ( )
    define(
      Set.prototype, $$iterator,
      function() {
        var s = strict(this);
        if (Type(s) !== 'object') throw TypeError();
        return CreateSetIterator(s);
      });

    // 23.2.3.12 Set.prototype [ @@toStringTag ]
    define(Set.prototype, $$toStringTag, 'Set');

    // 23.2.4 Properties of Set Instances
    // 23.2.5 Set Iterator Objects
    /** @constructor */
    function SetIterator() {}

    // 23.2.5.1 CreateSetIterator Abstract Operation
    function CreateSetIterator(set, kind) {
      if (Type(set) !== 'object') throw TypeError();
      if (!('[[SetData]]' in set)) throw TypeError();
      if (set['[[SetData]]'] === undefined) throw TypeError();
      var iterator = new SetIterator;
      set_internal(iterator, '[[IteratedSet]]', set);
      set_internal(iterator, '[[SetNextIndex]]', 0);
      set_internal(iterator, '[[SetIteratorKind]]', kind);
      return iterator;
    }

    // 23.2.5.2 The %SetIteratorPrototype% Object
    SetIterator.prototype = new function $SetIteratorPrototype$() {};

    // 23.2.5.2.1 %SetIteratorPrototype%.next( )
    define(
      SetIterator.prototype, 'next',
      function next() {
        var o = strict(this);
        if (Type(o) !== 'object') throw TypeError();
        var s = o['[[IteratedSet]]'],
            index = o['[[SetNextIndex]]'],
            entries = s['[[SetData]]'];
        while (index < entries.length) {
          var e = entries[index];
          index = index += 1;
          set_internal(o, '[[SetNextIndex]]', index);
          if (e !== empty) {
            return CreateIterResultObject(e, false);
          }
        }
        return CreateIterResultObject(undefined, true);
      });

    // 23.2.5.2.2 %SetIteratorPrototype% [ @@iterator ] ( )
    define(
      SetIterator.prototype, $$iterator,
      function() {
        return this;
      });

    // 23.2.5.2.3 %SetIteratorPrototype% [ @@toStringTag ]
    define(SetIterator.prototype, $$toStringTag, 'Set Iterator');

    // 23.2.5.3 Properties of Set Iterator Instances

    if (!global.Set || new global.Set([1]).size !== 1)
      global.Set = Set;
  }());

  // ---------------------------------------
  // 23.3 WeakMap Objects
  // ---------------------------------------

  (function() {
    // 23.3.1 The WeakMap Constructor
    // 23.3.1.1 WeakMap ( [ iterable ] )
    /** @constructor */
    function WeakMap(iterable) {
      var map = strict(this);

      if (Type(map) !== 'object') throw TypeError();
      if ('[[WeakMapData]]' in map) throw TypeError();

      if (iterable !== undefined) {
        var adder = map['set'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(map, '[[WeakMapData]]', new EphemeronTable);
      if (iter === undefined) return map;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return map;
        var nextValue = IteratorValue(next);
        if (Type(nextValue) !== 'object') throw TypeError();
        var k = nextValue[0];
        var v = nextValue[1];
        adder.call(map, k, v);
      }

      return map;
    }

    // 23.3.1.2 new WeakMap ( ...argumentsList )
    // 23.3.2 Properties of the WeakMap Constructor
    // 23.3.2.1 WeakMap.prototype
    WeakMap.prototype = new function $WeakMapPrototype$() {};

    // 23.3.2.2 WeakMap[ @@create ] ( )
    // 23.3.3 Properties of the WeakMap Prototype Object

    // 23.3.3.1 WeakMap.prototype.clear ()
    define(
      WeakMap.prototype, 'clear',
      function clear() {
        var M = strict(this);
        if (Type(M) !== 'object') throw TypeError();
        if (M['[[WeakMapData]]'] === undefined) throw TypeError();
        M['[[WeakMapData]]'].clear();
      });

    // 23.3.3.2 WeakMap.prototype.constructor

    // 23.3.3.3 WeakMap.prototype.delete ( key )
    define(
      WeakMap.prototype, 'delete',
      function delete_(key) {
        var M = strict(this);
        if (Type(M) !== 'object') throw TypeError();
        if (M['[[WeakMapData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        return M['[[WeakMapData]]'].remove(key);
      });

    // 23.3.3.4 WeakMap.prototype.get ( key )
    define(
      WeakMap.prototype, 'get',
      function get(key, defaultValue) {
        var M = strict(this);
        if (Type(M) !== 'object') throw TypeError();
        if (M['[[WeakMapData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        return M['[[WeakMapData]]'].get(key, defaultValue);
      });

    // 23.3.3.5 WeakMap.prototype.has ( key )
    define(
      WeakMap.prototype, 'has',
      function has(key) {
        var M = strict(this);
        if (Type(M) !== 'object') throw TypeError();
        if (M['[[WeakMapData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        return M['[[WeakMapData]]'].has(key);
      });

    // 23.3.3.6 WeakMap.prototype.set ( key , value )
    define(
      WeakMap.prototype, 'set',
      function set(key, value) {
        var M = strict(this);
        if (Type(M) !== 'object') throw TypeError();
        if (M['[[WeakMapData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        M['[[WeakMapData]]'].set(key, value);
        return M;
      });

    global.WeakMap = global.WeakMap || WeakMap;

    // 23.3.3.7 WeakMap.prototype [ @@toStringTag ]
    define(global.WeakMap.prototype, $$toStringTag, 'WeakMap');

    // 23.3.4 Properties of WeakMap Instances

    // Polyfills for incomplete native implementations:
    (function() {
      var wm = new global.WeakMap();
      var orig = global.WeakMap.prototype.set;
      define(global.WeakMap.prototype, 'set', function set() {
        orig.apply(this, arguments);
        return this;
      }, wm.set({}, 0) !== wm);
    }());
  }());

  // ---------------------------------------
  // 23.4 WeakSet Objects
  // ---------------------------------------

  (function() {
    // 23.4.1 The WeakSet Constructor
    // 23.4.1.1 WeakSet ( [ iterable ] )
    /** @constructor */
    function WeakSet(iterable) {
      var set = strict(this);

      if (Type(set) !== 'object') throw TypeError();
      if ('[[WeakSetData]]' in set) throw TypeError();

      if (iterable !== undefined) {
        var adder = set['add'];
        if (!IsCallable(adder)) throw TypeError();
        var iter = GetIterator(ToObject(iterable));
      }
      set_internal(set, '[[WeakSetData]]', new EphemeronTable);
      if (iter === undefined) return set;
      while (true) {
        var next = IteratorStep(iter);
        if (next === false)
          return set;
        var nextValue = IteratorValue(next);
        adder.call(set, nextValue);
      }

      return set;
    }

    // 23.4.1.2 new WeakSet ( ...argumentsList )
    // 23.4.2 Properties of the WeakSet Constructor
    // 23.4.2.1 WeakSet.prototype
    WeakSet.prototype = new function $WeakSetPrototype$() {};

    // 23.4.2.2 WeakSet [ @@create ] ( )
    // 23.4.3 Properties of the WeakSet Prototype Object
    // 23.4.3.1 WeakSet.prototype.add (value )
    define(
      WeakSet.prototype, 'add',
      function add(value) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(value) !== 'object') throw TypeError('Expected object');
        S['[[WeakSetData]]'].set(value, true);
        return S;
      });

    // 23.4.3.2 WeakSet.prototype.clear ()
    define(
      WeakSet.prototype, 'clear',
      function clear() {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        S['[[WeakSetData]]'].clear();
      });

    // 23.4.3.3 WeakSet.prototype.constructor
    // 23.4.3.4 WeakSet.prototype.delete ( value )
    define(
      WeakSet.prototype, 'delete',
      function delete_(value) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(value) !== 'object') throw TypeError('Expected object');
        return S['[[WeakSetData]]'].remove(value);
      });

    // 23.4.3.5 WeakSet.prototype.has ( value )
    define(
      WeakSet.prototype, 'has',
      function has(key) {
        var S = strict(this);
        if (Type(S) !== 'object') throw TypeError();
        if (S['[[WeakSetData]]'] === undefined) throw TypeError();
        if (Type(key) !== 'object') throw TypeError('Expected object');
        return S['[[WeakSetData]]'].has(key);
      });

    global.WeakSet = global.WeakSet || WeakSet;

    // 23.4.3.6 WeakSet.prototype [ @@toStringTag ]
    define(global.WeakSet.prototype, $$toStringTag, 'WeakSet');

    // 23.4.4 Properties of WeakSet Instances

    // Polyfills for incomplete native implementations:
    (function() {
      var ws = new global.WeakSet();
      var orig = global.WeakSet.prototype.add;
      define(global.WeakSet.prototype, 'add', function add() {
        orig.apply(this, arguments);
        return this;
      }, ws.add({}) !== ws);
    }());
  }());

  // ---------------------------------------
  // 24 Structured Data
  // ---------------------------------------

  // ---------------------------------------
  // 24.1 ArrayBuffer Objects
  // ---------------------------------------

  // See typedarray.js for TypedArray polyfill

  (function() {
    if (!('ArrayBuffer' in global))
      return;

    // 24.1.1 Abstract Operations For ArrayBuffer Objects
    // 24.1.1.1 AllocateArrayBuffer( constructor )
    // 24.1.1.2 IsNeuteredBuffer( arrayBuffer )
    // 24.1.1.3 NeuterArrayBuffer( arrayBuffer )
    // 24.1.1.4 SetArrayBufferData( arrayBuffer, bytes )
    // 24.1.1.5 CloneArrayBuffer( srcBuffer, srcByteOffset )
    // 24.1.1.6 GetValueFromBuffer ( arrayBuffer, byteIndex, type, isLittleEndian )
    // 24.1.1.7 SetValueInBuffer ( arrayBuffer, byteIndex, type, value, isLittleEndian )
    // 24.1.2 The ArrayBuffer Constructor
    // 24.1.2.1 ArrayBuffer( length )
    // 24.1.2.2 new ArrayBuffer( ...argumentsList )
    // 24.1.3 Properties of the ArrayBuffer Constructor

    // 24.1.3.1 ArrayBuffer.isView ( arg )
    define(
      ArrayBuffer, 'isView',
      function isView(arg) {
        if (Type(arg) !== 'object') return false;
        // TODO: Is there a less hackish way?
        if ('buffer' in arg && arg.buffer instanceof ArrayBuffer) return true;
        // TODO: [[ViewedDataArrayBuffer]] clause?
        return false;
      });

    // 24.1.3.2 ArrayBuffer.prototype
    // 24.1.3.3 ArrayBuffer[ @@create ] ( )
    // 24.1.4 Properties of the ArrayBuffer Prototype Object
    // 24.1.4.1 get ArrayBuffer.prototype.byteLength
    // 24.1.4.2 ArrayBuffer.prototype.constructor
    // 24.1.4.3 ArrayBuffer.prototype.slice ( start , end)

    // 24.1.4.4 ArrayBuffer.prototype [ @@toStringTag ]
    define(ArrayBuffer.prototype, $$toStringTag, 'ArrayBuffer');

    // 24.1.5 Properties of the ArrayBuffer Instances
  }());

  // ---------------------------------------
  // 24.2 DataView Objects
  // ---------------------------------------

  // See typedarray.js for TypedArray polyfill

  // 24.2.1 Abstract Operations For DataView Objects
  // 24.2.1.1 GetViewValue(view, requestIndex, isLittleEndian, type)
  // 24.2.1.2 SetViewValue(view, requestIndex, isLittleEndian, type, value)
  // 24.2.2 The DataView Constructor
  // 24.2.2.1 DataView (buffer [ , byteOffset [ , byteLength ] ] )
  // 24.2.2.2 new DataView( ...argumentsList )
  // 24.2.3 Properties of the DataView Constructor
  // 24.2.3.1 DataView.prototype
  // 24.2.3.2 DataView [ @@create ] ( )
  // 24.2.4 Properties of the DataView Prototype Object
  // 24.2.4.1 get DataView.prototype.buffer
  // 24.2.4.2 get DataView.prototype.byteLength
  // 24.2.4.3 get DataView.prototype.byteOffset
  // 24.2.4.4 DataView.prototype.constructor
  // 24.2.4.5 DataView.prototype.getFloat32 ( byteOffset [ , littleEndian ] )
  // 24.2.4.6 DataView.prototype.getFloat64 ( byteOffset [ , littleEndian ] )
  // 24.2.4.7 DataView.prototype.getInt8 ( byteOffset )
  // 24.2.4.8 DataView.prototype.getInt16 ( byteOffset [ , littleEndian ] )
  // 24.2.4.9 DataView.prototype.getInt32 ( byteOffset [ , littleEndian ] )
  // 24.2.4.10 DataView.prototype.getUint8 ( byteOffset )
  // 24.2.4.11 DataView.prototype.getUint16 ( byteOffset [ , littleEndian ] )
  // 24.2.4.12 DataView.prototype.getUint32 ( byteOffset [ , littleEndian ] )
  // 24.2.4.13 DataView.prototype.setFloat32 ( byteOffset, value [ , littleEndian ] )
  // 24.2.4.14 DataView.prototype.setFloat64 ( byteOffset, value [ , littleEndian ] )
  // 24.2.4.15 DataView.prototype.setInt8 ( byteOffset, value )
  // 24.2.4.16 DataView.prototype.setInt16 ( byteOffset, value [ , littleEndian ] )
  // 24.2.4.17 DataView.prototype.setInt32 ( byteOffset, value [ , littleEndian ] )
  // 24.2.4.18 DataView.prototype.setUint8 ( byteOffset, value )
  // 24.2.4.19 DataView.prototype.setUint16 ( byteOffset, value [ , littleEndian ] )
  // 24.2.4.20 DataView.prototype.setUint32 ( byteOffset, value [ , littleEndian ] )

  // 24.2.4.21 DataView.prototype[ @@toStringTag ]
  define(DataView.prototype, $$toStringTag, 'DataView');

  // 24.2.5 Properties of DataView Instances

  // ---------------------------------------
  // 24.3 The JSON Object
  // ---------------------------------------

  // 24.3.1 JSON.parse ( text [ , reviver ] )
  // 24.3.2 JSON.stringify ( value [ , replacer [ , space ] ] )
  // 24.3.3 JSON [ @@toStringTag ]
  define(JSON, $$toStringTag, 'JSON');

  // ---------------------------------------
  // 25 Control Abstraction Objects
  // ---------------------------------------

  // 25.1 Common Iteration Interfaces
  // 25.1.1 The Iterable Interface
  // 25.1.2 The Iterator Interface
  // 25.1.3 The IteratorResult Interface

  // ---------------------------------------
  // 25.2 GeneratorFunction Objects
  // ---------------------------------------

  // 25.2.1 The GeneratorFunction Constructor
  // 25.2.1.1 GeneratorFunction (p1, p2, ... , pn, body)
  // 25.2.1.2 new GeneratorFunction ( ...argumentsList )
  // 25.2.2 Properties of the GeneratorFunction Constructor
  // 25.2.2.1 GeneratorFunction.length
  // 25.2.2.2 GeneratorFunction.prototype
  // 25.2.2.3 GeneratorFunction[ @@create ] ( )
  // 25.2.3 Properties of the GeneratorFunction Prototype Object
  // 25.2.3.1 GeneratorFunction.prototype.constructor
  // 25.2.3.2 GeneratorFunction.prototype.prototype
  // 25.2.3.3 GeneratorFunction.prototype [ @@toStringTag ]
  // 25.2.3.4 GeneratorFunction.prototype [ @@create ] ( )
  // 25.2.4 GeneratorFunction Instances
  // 25.2.4.1 length
  // 25.2.4.2 prototype

  // ---------------------------------------
  // 25.3 Generator Objects
  // ---------------------------------------

  // 25.3.1 Properties of Generator Prototype
  // 25.3.1.1 Generator.prototype.constructor
  // 25.3.1.2 Generator.prototype.next ( value )
  // 25.3.1.3 Generator.prototype.return ( value )
  // 25.3.1.4 Generator.prototype.throw ( exception )
  // 25.3.1.5 Generator.prototype [ @@iterator ] ( )
  // 25.3.1.6 Generator.prototype [ @@toStringTag ]
  // 25.3.2 Properties of Generator Instances
  // 25.3.3 Generator Abstract Operations
  // 25.3.3.1 GeneratorStart (generator, generatorBody)
  // 25.3.3.2 GeneratorResume ( generator, value )
  // 25.3.3.3 GeneratorResumeAbrupt(generator, abruptCompletion)
  // 25.3.3.4 GeneratorYield ( iterNextObj )

  // ---------------------------------------
  // 25.4 Promise Objects
  // ---------------------------------------

  (function() {
    function QueueMicrotask(microtask, argumentsList) {
     // TODO: Use MutationObservers or setImmediate if available
     setTimeout(function() {
       microtask.apply(null, argumentsList);
     }, 0);
    }

    // To satisy js2-mode linter that requires consistent return values.
    var nothing = undefined;

    // 25.4.1 Abstract Operations for Promise Objects

    // 25.4.1.1 PromiseCapability Records
    // 25.4.1.1.1 IfAbruptRejectPromise ( value, capability )
    // 25.4.1.2 PromiseReaction Records

    // 25.4.1.3 CreateRejectFunction ( promise )
    function CreateRejectFunction(promise) {
      var F = function(reason) {
        var promise = F['[[Promise]]'];
        return PromiseReject(promise, reason);
      };
      set_internal(F, '[[Promise]]', promise);
      return F;
    }

    // 25.4.1.3.1 Promise Reject Functions
    function PromiseReject(promise, reason) {
      if (promise['[[PromiseStatus]]'] !== "unresolved") return nothing;
      var reactions = promise['[[PromiseRejectReactions]]'];
      set_internal(promise, '[[PromiseResult]]', reason);
      set_internal(promise, '[[PromiseResolveReactions]]', undefined);
      set_internal(promise, '[[PromiseRejectReactions]]', undefined);
      set_internal(promise, '[[PromiseStatus]]', "has-rejection");
      return TriggerPromiseReactions(reactions, reason);
    }

    // 25.4.1.4 CreateResolveFunction ( promise )
    function CreateResolveFunction(promise) {
      var F = function(resolution) {
        var promise = F['[[Promise]]'];
        return PromiseResolve(promise, resolution);
      };
      set_internal(F, '[[Promise]]', promise);
      return F;
    }

    // 25.4.1.4.1 PromiseResolveFunctions
    function PromiseResolve(promise, resolution) {
      if (promise['[[PromiseStatus]]'] !== "unresolved") return nothing;
      var reactions = promise['[[PromiseResolveReactions]]'];
      set_internal(promise, '[[PromiseResult]]', resolution);
      set_internal(promise, '[[PromiseResolveReactions]]', undefined);
      set_internal(promise, '[[PromiseRejectReactions]]', undefined);
      set_internal(promise, '[[PromiseStatus]]', "has-resolution");
      return TriggerPromiseReactions(reactions, resolution);
    }

    // 25.4.1.5 NewPromiseCapability ( C )
    function NewPromiseCapability(C) {
      if (!IsConstructor(C)) throw TypeError();
      var promise = Object.create(C.prototype);
      return CreatePromiseCapabilityRecord(promise, C);
    }

    // 25.4.1.5.1 CreatePromiseCapabilityRecord ( promise, constructor )
    function CreatePromiseCapabilityRecord(promise, constructor) {
      var promiseCapability = { '[[Promise]]': promise, '[[Resolve]]': undefined, '[[Reject]]': undefined };
      var executor = new GetCapabilitiesExecutor;
      set_internal(executor, '[[Capability]]', promiseCapability);
      var constructorResult = constructor.call(promise, executor);
      if (!IsCallable(promiseCapability['[[Resolve]]'])) throw TypeError();
      if (!IsCallable(promiseCapability['[[Reject]]'])) throw TypeError();
      if (Type(constructorResult) === 'object' && promise !== constructorResult) throw TypeError();
      return promiseCapability;
    }

    // 25.4.1.5.2 GetCapabilitiesExecutor Functions
    function GetCapabilitiesExecutor() {
      var F = function(resolve, reject) {
        var promiseCapability = F['[[Capability]]'];
        set_internal(promiseCapability, '[[Resolve]]', resolve);
        set_internal(promiseCapability, '[[Reject]]', reject);
      };
      return F;
    }

    // 25.4.1.6 IsPromise ( x )
    function IsPromise(x) {
      if (Type(x) !== 'object') return false;
      if (!x.hasOwnProperty('[[PromiseStatus]]')) return false;
      if (x['[[PromiseStatus]]'] === undefined) return false;
      return true;
    };

    // 25.4.1.7 TriggerPromiseReactions ( reactions, argument )
    function TriggerPromiseReactions(reactions, argument) {
      reactions.forEach(function(reaction) {
        QueueMicrotask(PromiseReactionTask, [reaction, argument]);
      });
    }

    // 25.4.1.8 UpdatePromiseFromPotentialThenable ( x, promiseCapability)
    function UpdatePromiseFromPotentialThenable(x, promiseCapability) {
      if (Type(x) !== 'object') return "not a thenable";
      try {
        var then = x["then"];
      } catch (_) {
        var rejectResult = promiseCapability['[[Reject]]'].call(undefined, then);
        return nothing;
      }
      if (!IsCallable(then)) return "not a thenable";
      try {
        var thenCallResult = then.call(x, promiseCapability['[[Resolve]]'], promiseCapability['[[Reject]]']);
      } catch (_) {
        rejectResult = promiseCapability['[[Reject]]'].call(undefined, thenCallResult);
        return nothing;
      }
      return nothing;
    }

    // 25.4.2 Promise Tasks

    // 25.4.2.1 PromiseReactionTask( reaction, argument )

    function PromiseReactionTask(reaction, argument) {
      var promiseCapability = reaction['[[Capabilities]]'];
      var handler = reaction['[[Handler]]'];
      try {
        var handlerResult = handler.call(undefined, argument);
      } catch (handlerResult) {
        return promiseCapability['[[Reject]]'].call(undefined, handlerResult);
      }
      if (SameValue(handlerResult, promiseCapability['[[Promise]]'])) {
        var selfResolutionError = TypeError();
        return promiseCapability['[[Reject]]'].call(undefined, selfResolutionError);
      }
      var updateResult = UpdatePromiseFromPotentialThenable(handlerResult, promiseCapability);
      if (updateResult === "not a thenable")
        return promiseCapability['[[Resolve]]'].call(undefined, handlerResult);
      return nothing;
    }

    // 25.4.3 The Promise Constructor

    // 25.4.3.1 Promise ( executor )

    function Promise(executor) {
      set_internal(this, '[[PromiseConstructor]]', Promise);

      var promise = strict(this);
      if (!IsCallable(executor)) throw TypeError();
      if (Type(promise) !== 'object') throw TypeError();
      return InitializePromise(promise, executor);
    }

    // 25.4.3.1.1 InitialisePromise ( promise, executor ) AbstractOperation
    function InitializePromise(promise, executor) {
      set_internal(promise, '[[PromiseStatus]]', "unresolved");
      set_internal(promise, '[[PromiseResolveReactions]]', []);
      set_internal(promise, '[[PromiseRejectReactions]]', []);
      var resolve = CreateResolveFunction(promise);
      var reject = CreateRejectFunction(promise);
      try {
        var result = executor.call(undefined, resolve, reject);
      } catch (result) {
        PromiseReject(promise, result);
      }
      return promise;
    }

    // 25.4.3.2 new Promise ( ...argumentsList )

    // 25.4.4 Properties of the Promise Constructor

    // 25.4.4.1 Promise.all ( iterable )
    define(Promise, 'all', function all(iterable) {
      var C = strict(this);
      var promiseCapability = NewPromiseCapability(C);
      var iterator = GetIterator(iterable);
      var values = Array(0);
      var remainingElementsCount = { '[[value]]': 0 };
      var index = 0;
      while (true) {
        var next = IteratorStep(iterator);
        if (next === false) {
          if (index === 0) {
            var resolveResult = promiseCapability['[[Resolve]]'].call(undefined, values);
          }
          return promiseCapability['[[Promise]]'];
        }
        var nextValue = IteratorValue(next);
        var nextPromise = C["resolve"](nextValue);
        var resolveElement = new PromiseAllResolveElementFunction;
        set_internal(resolveElement, '[[Index]]', index);
        set_internal(resolveElement, '[[Values]]', values);
        set_internal(resolveElement, '[[Capabilities]]', promiseCapability);
        set_internal(resolveElement, '[[RemainingElements]]', remainingElementsCount);
        var result = nextPromise["then"](resolveElement, promiseCapability['[[Reject]]']);
        index += 1;
        remainingElementsCount['[[value]]'] += 1;
      }
    });

    // 25.4.4.1.1 Promise.all Resolve Element Functions
    function PromiseAllResolveElementFunction() {
      var F =  function(x) {
        var index = F['[[Index]]'];
        var values = F['[[Values]]'];
        var promiseCapability = F['[[Capabilities]]'];
        var remainingElementsCount = F['[[RemainingElements]]'];
        values[index] = x;
        remainingElementsCount['[[value]]'] -= 1;
        if (remainingElementsCount['[[value]]'] === 0) {
          promiseCapability['[[Resolve]]'].call(undefined, values);
        }
        return nothing;
      };
      return F;
    }

    // 25.4.4.2 Promise.cast ( x )
    // Per TC-39, Promise.cast renamed Promise.resolve
    define(Promise, 'resolve', function resolve(x) {
      var C = strict(this);
      if (IsPromise(x)) {
        var constructor = x['[[PromiseConstructor]]'];
        if (SameValue(constructor, C)) return x;
      }
      var promiseCapability = NewPromiseCapability(C);
      var resolveResult = promiseCapability['[[Resolve]]'].call(undefined, x);
      return promiseCapability['[[Promise]]'];
    });

    // 25.4.4.3 Promise.prototype
    define(Promise, 'prototype', {});

    // 25.4.4.4 Promise.race ( iterable )
    define(Promise, 'race', function race(iterable) {
      var C = strict(this);
      var promiseCapability = NewPromiseCapability(C);
      var iterator = GetIterator(iterable);
      while (true) {
        var next = IteratorStep(iterator);
        if (next === false) return promiseCapability['[[Promise]]'];
        var nextValue = IteratorValue(next);
        var nextPromise = C["resolve"](nextValue);
        var result = nextPromise["then"](promiseCapability['[[Resolve]]'], promiseCapability['[[Reject]]']);
      }
    });

    // 25.4.4.5 Promise.reject ( r )
    define(Promise, 'reject', function reject(r) {
      var C = strict(this);
      var promiseCapability = NewPromiseCapability(C);
      var rejectResult = promiseCapability['[[Reject]]'].call(undefined, r);
      return promiseCapability['[[Promise]]'];
    });

    // 25.4.4.6 Promise.resolve ( x )
    // Per TC-39, remove old Promise.resolve

    // 25.4.4.7 Promise [ @@create ] ( )
    // 25.4.4.7.1 AllocatePromise( constructor ) Abstraction Operation

    // 25.4.5 Properties of the Promise Prototype Object

    // 25.4.5.1 Promise.prototype.catch ( onRejected )
    define(Promise.prototype, 'catch', function catch_(onRejected) {
      var promise = strict(this);
      promise["then"](undefined, onRejected);
    });

    // 25.4.5.2 Promise.prototype.constructor
    Promise.prototype.constructor = Promise;

    // 25.4.5.3 Promise.prototype.then ( onFulfilled , onRejected )
    define(Promise.prototype, 'then', function then(onFulfilled, onRejected) {
      var promise = strict(this);
      if (!IsPromise(promise)) throw TypeError();
      var C = promise.constructor;
      var promiseCapability = NewPromiseCapability(C);
      var rejectionHandler = new ThrowerFunction;
      if (IsCallable(onRejected)) rejectionHandler = onRejected;
      var fulfillmentHandler = new IdentityFunction;
      if (IsCallable(onFulfilled)) fulfillmentHandler = onFulfilled;
      var resolutionHandler = new PromiseResolutionHandlerFunction;
      set_internal(resolutionHandler, '[[Promise]]', promise);
      set_internal(resolutionHandler, '[[FulfillmentHandler]]', fulfillmentHandler);
      set_internal(resolutionHandler, '[[RejectionHandler]]', rejectionHandler);
      var resolveReaction = { '[[Capabilities]]': promiseCapability, '[[Handler]]': resolutionHandler };
      var rejectReaction = { '[[Capabilities]]': promiseCapability, '[[Handler]]': rejectionHandler };
      if (promise['[[PromiseStatus]]'] === "unresolved") {
        promise['[[PromiseResolveReactions]]'].push(resolveReaction);
        promise['[[PromiseRejectReactions]]'].push(rejectReaction);
      }
      if (promise['[[PromiseStatus]]'] === "has-resolution") {
        var resolution = promise['[[PromiseResult]]'];
        QueueMicrotask(PromiseReactionTask, [resolveReaction, resolution]);
      }
      if (promise['[[PromiseStatus]]'] === "has-rejection") {
        resolution = promise['[[PromiseResult]]'];
        QueueMicrotask(PromiseReactionTask, [rejectReaction, resolution]);
      }
      return promiseCapability['[[Promise]]'];
    });

    // 25.4.5.3.1 IdentityFunctions
    function IdentityFunction() {
      var F = function (x) {
        return x;
      };
      return F;
    }

    // 25.4.5.3.2 PromiseResolutionHandlerFunctions
    function PromiseResolutionHandlerFunction() {
      var F = function(x) {
        var promise = F['[[Promise]]'];
        var fulfillmentHandler = F['[[FulfillmentHandler]]'];
        var rejectionHandler = F['[[RejectionHandler]]'];
        if (SameValue(x, promise)) {
          var selfResolutionError = TypeError();
          return rejectionHandler.call(undefined, selfResolutionError);
        }
        var C = promise['[[PromiseConstructor]]'];
        var promiseCapability = NewPromiseCapability(C);
        var updateResult = UpdatePromiseFromPotentialThenable(x, promiseCapability);
        if (updateResult !== "not a thenable") return promiseCapability['[[Promise]]']["then"](fulfillmentHandler, rejectionHandler);
        return fulfillmentHandler.call(undefined, x);
      };
      return F;
    }

    // 25.4.5.3.3 Thrower Functions
    function ThrowerFunction() {
      var F = function(e) {
        throw e;
      };
      return F;
    }

    global.Promise = global.Promise || Promise;

    // Patch early Promise.cast vs. Promise.resolve implementations
    if ('cast' in global.Promise) global.Promise.resolve = global.Promise.cast;
  }());

  // 25.4.5.1 Promise.prototype [ @@toStringTag ]
  define(Promise.prototype, $$toStringTag, 'Promise');

  // ---------------------------------------
  // 26 Reflection
  // ---------------------------------------

  (function() {
    // 26.1 The Reflect Object
    var Reflect = {};

    // 26.1.1 Reflect.apply ( target, thisArgument, argumentsList )
   define(
      Reflect, 'apply',
      function apply(target, thisArgument, argumentsList) {
        var obj = ToObject(target);
        return Function.prototype.apply.call(thisArgument, argumentsList);
      });

    // 26.1.2 Reflect.construct ( target, argumentsList )
    define(
      Reflect, 'construct',
      function construct(target, argumentsList) {
        var args = '', len = argumentsList.length;
        for (var i = 0; i < len; ++i) {
          if (i > 0) args += ',';
          args += 'argumentsList[' + i + ']';
        }
        return eval('new target(' + args + ')');
      });

    // 26.1.3 Reflect.defineProperty ( target, propertyKey, attributes )
    define(
      Reflect, 'defineProperty',
      Object.defineProperty);

    // 26.1.4 Reflect.deleteProperty ( target, propertyKey )
    define(
      Reflect, 'deleteProperty',
      function deleteProperty(target,name) {
        delete target[name];
      });

    // 26.1.5 Reflect.enumerate ( target )
    define(
      Reflect, 'enumerate',
      function enumerate(target) {
        target = ToObject(target);
        var iterator = Enumerate(target);
        return iterator;
      });

    // 26.1.6 Reflect.get ( target, propertyKey [ , receiver ])
    define(
      Reflect, 'get',
      function get(target, name, receiver) {
        target = ToObject(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : ToObject(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('get' in desc) {
          return Function.prototype.call.call(desc['get'], receiver);
        }
        return target[name];
      });

    // 26.1.7 Reflect.getOwnPropertyDescriptor ( target, propertyKey )
    define(
      Reflect, 'getOwnPropertyDescriptor',
      Object.getOwnPropertyDescriptor);

    // 26.1.8 Reflect.getPrototypeOf ( target )
    define(
      Reflect, 'getPrototypeOf',
      Object.getPrototypeOf);

    // 26.1.9 Reflect.has ( target, propertyKey )
    define(
      Reflect, 'has',
      function has(target,name) {
        return String(name) in ToObject(target);
      });

    // 26.1.10 Reflect.isExtensible (target)
    define(
      Reflect, 'isExtensible',
      Object.isExtensible);

    // 26.1.11 Reflect.ownKeys ( target )
    define(
      Reflect, 'ownKeys',
      function ownKeys(target) {
        var obj = ToObject(target);
        return Object.getOwnPropertyNames(obj);
      });

    // 26.1.12 Reflect.preventExtensions ( target )
    define(
      Reflect, 'preventExtensions',
      function preventExtensions(target) {
        try { Object.preventExtensions(target); return true; } catch (_) { return false; }
      });

    // 26.1.13 Reflect.set ( target, propertyKey, V [ , receiver ] )
    define(
      Reflect, 'set',
      function set(target,name,value,receiver) {
        target = ToObject(target);
        name = String(name);
        receiver = (receiver === undefined) ? target : ToObject(receiver);
        var desc = Object.getPropertyDescriptor(target, name);
        if ('set' in desc) {
          return Function.prototype.call.call(desc['set'], receiver, value);
        }
        return target[name] = value;
      });

    // 26.1.14 Reflect.setPrototypeOf ( target, proto )
    define(
      Reflect, 'setPrototypeOf',
      function setPrototypeOf(target, proto) {
        target.__proto__ = proto;
      });

    global.Reflect = global.Reflect || Reflect;
  }());

  // ---------------------------------------
  // 26.2 Proxy Objects
  // ---------------------------------------

  // Not polyfillable.

  // ---------------------------------------
  // Non-Standard Helpers
  // ---------------------------------------

  // NOTE: Since true iterators can't be polyfilled, this is a helper.
  function forOf(o, func) {
    o = ToObject(o);
    var it = GetIterator(o);
    while (true) {
      var next = IteratorStep(it);
      if (next === false)
        return;
      func(IteratorValue(next));
    }
  }
  global.forOf = forOf; // Since for( ... of ... ) can't be shimmed w/o a transpiler.

}(this));
