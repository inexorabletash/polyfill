//----------------------------------------------------------------------
//
// ECMAScript 2017 Polyfills
//
//----------------------------------------------------------------------

(function (global) {
  'use strict';
  var undefined = (void 0); // Paranoia

  // Helpers

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
      min = Math.min;

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
  // 7.3 Operations on Objects
  //----------------------------------------

  // 7.3.4
  function CreateDataProperty(O, P, V) {
    Object.defineProperty(O, P, {
      value: V,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }

  // 7.3.21
  function EnumerableOwnProperties(o, kind) {
    var ownKeys = Object.keys(o);
    var properties = [];
    ownKeys.forEach(function(key) {
      var desc = Object.getOwnPropertyDescriptor(o, key);
      if (desc && desc.enumerable) {
        if (kind === 'key') properties.push(key);
        else {
          var value = o[key];
          if (kind === 'value') properties.push(value);
          else properties.push([key, value]);
        }
      }
    });
    return properties;
  }


  //----------------------------------------------------------------------
  // 19 Fundamental Objects
  //----------------------------------------------------------------------

  // 19.1 Object Objects
  // 19.1.2 Properties of the Object Constructor

  // 19.1.2.5 Object.entries
  define(
    Object, 'entries',
    function entries(o) {
      var obj = ToObject(o);
      return EnumerableOwnProperties(obj, 'key+value');
    });

  // 19.1.2.8 Object.getOwnPropertyDescriptors ( O )
  define(
    Object, 'getOwnPropertyDescriptors',
    function getOwnPropertyDescriptors(o) {
      var obj = ToObject(o);
      // ReturnIfAbrupt(obj)
      var keys = Object.getOwnPropertyNames(obj);
      // ReturnIfAbrupt(keys)
      var descriptors = {};
      for (var i = 0; i < keys.length; ++i) {
        var nextKey = keys[i];
        var descriptor = Object.getOwnPropertyDescriptor(obj, nextKey);
        // ReturnIfAbrupt(desc)
        // ReturnIfAbrupt(descriptor)
        CreateDataProperty(descriptors, nextKey, descriptor);
      }
      return descriptors;
    });

  // 19.1.2.21 Object.values
  define(
    Object, 'values',
    function values(o) {
      var obj = ToObject(o);
      return EnumerableOwnProperties(obj, 'value');
    });



  //----------------------------------------------------------------------
  // 21 Text Processing
  //----------------------------------------------------------------------

  // 21.1 String Objects
  // 21.1.3 Properties of the String Prototype Object

  // 21.1.3.13 String.prototype.padEnd( maxLength [ , fillString ] )
  define(
    String.prototype, 'padEnd',
    function padEnd(maxLength) {
      var fillString = arguments[1];

      var o = this;
      // ReturnIfAbrupt(o)
      var s = String(this);
      // ReturnIfAbrupt(s)
      var stringLength = s.length;
      if (fillString === undefined) var fillStr = '';
      else fillStr = String(fillString);
      // ReturnIfAbrupt(fillStr)
      if (fillStr === '') fillStr = ' ';
      var intMaxLength = ToLength(maxLength);
      // ReturnIfAbrupt(intMaxLength)
      if (intMaxLength <= stringLength) return s;
      var fillLen = intMaxLength - stringLength;
      var stringFiller = '';
      while (stringFiller.length < fillLen)
        stringFiller = stringFiller + fillStr;
      return s + stringFiller.substring(0, fillLen);
    });

  // 21.1.3.14 String.prototype.padStart( maxLength [ , fillString ] )
  define(
    String.prototype, 'padStart',
    function padStart(maxLength) {
      var fillString = arguments[1];

      var o = this;
      // ReturnIfAbrupt(o)
      var s = String(this);
      // ReturnIfAbrupt(s)
      var stringLength = s.length;
      if (fillString === undefined) var fillStr = '';
      else fillStr = String(fillString);
      // ReturnIfAbrupt(fillStr)
      if (fillStr === '') fillStr = ' ';
      var intMaxLength = ToLength(maxLength);
      // ReturnIfAbrupt(intMaxLength)
      if (intMaxLength <= stringLength) return s;
      var fillLen = intMaxLength - stringLength;
      var stringFiller = '';
      while (stringFiller.length < fillLen)
        stringFiller = stringFiller + fillStr;
      return stringFiller.substring(0, fillLen) + s;
    });

}(this));
