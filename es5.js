//----------------------------------------------------------------------
//
// ECMAScript 5 Polyfills
//
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// ES5 15.2 Object Objects
//----------------------------------------------------------------------

//
// ES5 15.2.3 Properties of the Object Constructor
//

// ES5 15.2.3.2 Object.getPrototypeOf ( O )
// From http://ejohn.org/blog/objectgetprototypeof/
// NOTE: won't work for typical function T() {}; T.prototype = {}; new T; case
// since the constructor property is destroyed.
if (!Object.getPrototypeOf) {
  Object.getPrototypeOf = function (o) {
    if (o !== Object(o)) { throw TypeError("Object.getPrototypeOf called on non-object"); }
    return o.__proto__ || o.constructor.prototype || Object.prototype;
  };
}

//    // ES5 15.2.3.3 Object.getOwnPropertyDescriptor ( O, P )
//    if (typeof Object.getOwnPropertyDescriptor !== "function") {
//        Object.getOwnPropertyDescriptor = function (o, name) {
//            if (o !== Object(o)) { throw TypeError(); }
//            if (o.hasOwnProperty(name)) {
//                return {
//                    value: o[name],
//                    enumerable: true,
//                    writable: true,
//                    configurable: true
//                };
//            }
//        };
//    }

// ES5 15.2.3.4 Object.getOwnPropertyNames ( O )
if (typeof Object.getOwnPropertyNames !== "function") {
  Object.getOwnPropertyNames = function (o) {
    if (o !== Object(o)) { throw TypeError("Object.getOwnPropertyNames called on non-object"); }
    var props = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        props.push(p);
      }
    }
    return props;
  };
}

// ES5 15.2.3.5 Object.create ( O [, Properties] )
if (typeof Object.create !== "function") {
  Object.create = function (prototype, properties) {
    if (typeof prototype !== "object") { throw TypeError(); }
    function Ctor() {}
    Ctor.prototype = prototype;
    var o = new Ctor();
    if (prototype) { o.constructor = Ctor; }
    if (properties !== undefined) {
      if (properties !== Object(properties)) { throw TypeError(); }
      Object.defineProperties(o, properties);
    }
    return o;
  };
}

// ES 15.2.3.6 Object.defineProperty ( O, P, Attributes )
// Partial support for most common case - getters, setters, and values
(function() {
  if (!Object.defineProperty ||
      !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
    var orig = Object.defineProperty;
    Object.defineProperty = function (o, prop, desc) {
      // In IE8 try built-in implementation for defining properties on DOM prototypes.
      if (orig) { try { return orig(o, prop, desc); } catch (e) {} }

      if (o !== Object(o)) { throw TypeError("Object.defineProperty called on non-object"); }
      if (Object.prototype.__defineGetter__ && ('get' in desc)) {
        Object.prototype.__defineGetter__.call(o, prop, desc.get);
      }
      if (Object.prototype.__defineSetter__ && ('set' in desc)) {
        Object.prototype.__defineSetter__.call(o, prop, desc.set);
      }
      if ('value' in desc) {
        o[prop] = desc.value;
      }
      return o;
    };
  }
}());

// ES 15.2.3.7 Object.defineProperties ( O, Properties )
if (typeof Object.defineProperties !== "function") {
  Object.defineProperties = function (o, properties) {
    if (o !== Object(o)) { throw TypeError("Object.defineProperties called on non-object"); }
    var name;
    for (name in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, name)) {
        Object.defineProperty(o, name, properties[name]);
      }
    }
    return o;
  };
}


// ES5 15.2.3.14 Object.keys ( O )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = function (o) {
    if (o !== Object(o)) { throw TypeError('Object.keys called on non-object'); }
    var ret = [], p;
    for (p in o) {
      if (Object.prototype.hasOwnProperty.call(o, p)) {
        ret.push(p);
      }
    }
    return ret;
  };
}

//----------------------------------------------------------------------
// ES5 15.3 Function Objects
//----------------------------------------------------------------------

//
// ES5 15.3.4 Properties of the Function Prototype Object
//

// ES5 15.3.4.5 Function.prototype.bind ( thisArg [, arg1 [, arg2, ... ]] )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function (o) {
    if (typeof this !== 'function') { throw TypeError("Bind must be called on a function"); }

    var args = Array.prototype.slice.call(arguments, 1),
        self = this,
        nop = function() {},
        bound = function () {
          return self.apply(this instanceof nop ? this : o,
                            args.concat(Array.prototype.slice.call(arguments)));
        };

    if (this.prototype)
      nop.prototype = this.prototype;
    bound.prototype = new nop();
    return bound;
  };
}


//----------------------------------------------------------------------
// ES5 15.4 Array Objects
//----------------------------------------------------------------------

//
// ES5 15.4.3 Properties of the Array Constructor
//


// ES5 15.4.3.2 Array.isArray ( arg )
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
Array.isArray = Array.isArray || function (o) { return Boolean(o && Object.prototype.toString.call(Object(o)) === '[object Array]'); };


//
// ES5 15.4.4 Properties of the Array Prototype Object
//

// ES5 15.4.4.14 Array.prototype.indexOf ( searchElement [ , fromIndex ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) { return -1; }

    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (isNaN(n)) {
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    if (n >= len) { return -1; }

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

// ES5 15.4.4.15 Array.prototype.lastIndexOf ( searchElement [ , fromIndex ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf) {
  Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) { return -1; }

    var n = len;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n !== n) {
        n = 0;
      } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);

    for (; k >= 0; k--) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

// ES5 15.4.4.16 Array.prototype.every ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every) {
  Array.prototype.every = function (fun /*, thisp */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t && !fun.call(thisp, t[i], i, t)) {
        return false;
      }
    }

    return true;
  };
}

// ES5 15.4.4.17 Array.prototype.some ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
  Array.prototype.some = function (fun /*, thisp */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t && fun.call(thisp, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}

// ES5 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fun /*, thisp */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        fun.call(thisp, t[i], i, t);
      }
    }
  };
}


// ES5 15.4.4.19 Array.prototype.map ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Map
if (!Array.prototype.map) {
  Array.prototype.map = function (fun /*, thisp */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    var res = []; res.length = len;
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        res[i] = fun.call(thisp, t[i], i, t);
      }
    }

    return res;
  };
}

// ES5 15.4.4.20 Array.prototype.filter ( callbackfn [ , thisArg ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Filter
if (!Array.prototype.filter) {
  Array.prototype.filter = function (fun /*, thisp */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    var res = [];
    var thisp = arguments[1], i;
    for (i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}


// ES5 15.4.4.21 Array.prototype.reduce ( callbackfn [ , initialValue ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (fun /*, initialValue */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") { throw TypeError(); }

    // no value to return if no initial value and an empty array
    if (len === 0 && arguments.length === 1) { throw TypeError(); }

    var k = 0;
    var accumulator;
    if (arguments.length >= 2) {
      accumulator = arguments[1];
    } else {
      do {
        if (k in t) {
          accumulator = t[k++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++k >= len) { throw TypeError(); }
      }
      while (true);
    }

    while (k < len) {
      if (k in t) {
        accumulator = fun.call(undefined, accumulator, t[k], k, t);
      }
      k++;
    }

    return accumulator;
  };
}


// ES5 15.4.4.22 Array.prototype.reduceRight ( callbackfn [, initialValue ] )
// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
if (!Array.prototype.reduceRight) {
  Array.prototype.reduceRight = function (callbackfn /*, initialValue */) {
    if (this === void 0 || this === null) { throw TypeError(); }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof callbackfn !== "function") { throw TypeError(); }

    // no value to return if no initial value, empty array
    if (len === 0 && arguments.length === 1) { throw TypeError(); }

    var k = len - 1;
    var accumulator;
    if (arguments.length >= 2) {
      accumulator = arguments[1];
    } else {
      do {
        if (k in this) {
          accumulator = this[k--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--k < 0) { throw TypeError(); }
      }
      while (true);
    }

    while (k >= 0) {
      if (k in t) {
        accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
      }
      k--;
    }

    return accumulator;
  };
}


//----------------------------------------------------------------------
// ES5 15.5 String Objects
//----------------------------------------------------------------------

//
// ES5 15.5.4 Properties of the String Prototype Object
//


// ES5 15.5.4.20 String.prototype.trim()
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return String(this).replace(/^\s+/, '').replace(/\s+$/, '');
  };
}



//----------------------------------------------------------------------
// ES5 15.9 Date Objects
//----------------------------------------------------------------------


//
// ES 15.9.4 Properties of the Date Constructor
//

// ES5 15.9.4.4 Date.now ( )
// From https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/now
if (!Date.now) {
  Date.now = function now() {
    return Number(new Date());
  };
}


//
// ES5 15.9.5 Properties of the Date Prototype Object
//

// ES5 15.9.4.43 Date.prototype.toISOString ( )
// Inspired by http://www.json.org/json2.js
if (!Date.prototype.toISOString) {
  Date.prototype.toISOString = function () {
    function pad2(n) { return ('00' + n).slice(-2); }
    function pad3(n) { return ('000' + n).slice(-3); }

    return this.getUTCFullYear() + '-' +
      pad2(this.getUTCMonth() + 1) + '-' +
      pad2(this.getUTCDate()) + 'T' +
      pad2(this.getUTCHours()) + ':' +
      pad2(this.getUTCMinutes()) + ':' +
      pad2(this.getUTCSeconds()) + '.' +
      pad3(this.getUTCMilliseconds()) + 'Z';
  };
}
