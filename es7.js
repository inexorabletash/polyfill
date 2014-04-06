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

  //----------------------------------------
  // 7.2 Testing and Comparison Operations
  //----------------------------------------

  // 7.2.3
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

  //----------------------------------------
  // 9 ECMAScript Ordinary and Exotic Objects Behaviors
  //----------------------------------------

  // 9.1.13 ObjectCreate(proto, internalDataList)
  function ObjectCreate(proto, internalDataList) {
    return Object.create(proto, internalDataList);
  }

  // 25.3.3.4 CreateItrResultObject (value, done)
  function CreateItrResultObject(value, done) {
    assert(Type(done) === 'boolean');
    var obj = {};
    obj["value"] = value;
    obj["done"] = done;
    return obj;
  }

  // 25.3.3.5 GetIterator ( obj )
  function GetIterator(obj) {
    var iterator = obj[$$iterator]();
    if (Type(iterator) !== 'object') throw TypeError();
    return iterator;
  }

  // 25.3.3.6 IteratorNext ( iterator, value )
  function IteratorNext(iterator, value) {
    var result = iterator.next(value);
    if (Type(result) !== 'object') throw TypeError();
    return result;
  }

  // 25.3.3.7 IteratorComplete ( iterResult )
  function IteratorComplete(iterResult) {
    assert(Type(iterResult) === 'object');
    return Boolean(iterResult.done);
  }

  // 25.3.3.8 IteratorValue ( iterResult )
  function IteratorValue(iterResult) {
    assert(Type(iterResult) === 'object');
    return iterResult.value;
  }

  // 25.3.3.9 IteratorStep ( iterator, value )
  function IteratorStep( iterator, value ) {
    var result = IteratorNext(iterator, value);
    var done = result['done'];
    if (Boolean(done) === true) return false;
    return result;
  }

  // 25.3.3.10 CreateEmptyIterator ( )


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

  // es-discuss: DOMStringList replacement; may rename to 'has'
  define(
    Array.prototype, 'contains',
    function contains(target) {
      if (this === undefined || this === null) throw TypeError();
      var t = ToObject(this),
          len = ToUint32(t.length),
          i;
      for (i = 0; i < len; i += 1) {
        // eval('0 in [undefined]') == false in IE8-
        if (/*i in t &&*/ SameValue(t[i], target)) {
          return true;
        }
      }
      return false;
    });

  define(
    Object, 'values',
    function values(o) {
      return CreateObjectIterator(o, 'value');
    });

  define(
    Object, 'entries',
    function entries(o) {
      return CreateObjectIterator(o, 'key+value');
    });

  function CreateObjectIterator(dict, kind) {
    var d = ToObject(dict);
    var iterator = new ObjectIterator();
    set_internal(iterator, '[[IteratedObject]]', d);
    set_internal(iterator, '[[ObjectNextIndex]]', 0);
    set_internal(iterator, '[[ObjectIterationKind]]', kind);
    // TODO: Use Enumerate()
    set_internal(iterator, '[[PropertyList]]', Object.keys(d));
    return iterator;
  }

  /** @constructor */
  function ObjectIterator() {}

  ObjectIterator.prototype = new function $ObjectIteratorPrototype$() {};
  define(ObjectIterator.prototype, $$toStringTag, 'Object Iterator');
  define(
    ObjectIterator.prototype, 'next',
    function next() {
      var o = ToObject(this);
      var d = ToObject(o['[[IteratedObject]]']),
          index = o['[[ObjectNextIndex]]'],
          entries = o['[[PropertyList]]'],
          len = entries.length,
          itemKind = o['[[ObjectIterationKind]]'];
      while (index < len) {
        var e = {key: entries[index], value: d[entries[index]]};
        index = index += 1;
        set_internal(o, '[[ObjectNextIndex]]', index);
        if (e.key !== empty) {
          if (itemKind === 'key') {
            return CreateItrResultObject(e.key, false);
          } else if (itemKind === 'value') {
            return CreateItrResultObject(e.value, false);
          } else {
            return CreateItrResultObject([e.key, e.value], false);
          }
        }
      }
      return CreateItrResultObject(undefined, true);
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

}(this));
