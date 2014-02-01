// http://wiki.ecmascript.org/doku.php?id=harmony:binary_data
(function(global){

  function ASSERT(c, m) { if (!c) { throw Error(m); } }

  (function() {
    var orig = Object.prototype.toString;
    Object.prototype.toString = function toString() {
      if (Object(this) === this && '__Class__' in this) {
        return '[object ' + this.__Class__ + ']';
      }
      return orig.call(this, arguments);
    };
  }());

  function Data() { throw TypeError(); }
  Data.prototype = {};
  Object.defineProperties(Data.prototype, {
    buffer: { get: function() { return this.__Value__.buffer; }},
    byteOffset: { get: function() { return this.__Value__.byteOffset; }},
    byteLength: { get: function() { return this.__Value__.byteLength; }},
    update: { value: function(val) {
      if (this !== Object(this) || !(this instanceof Data)) { throw TypeError(); }
      var r = this.__DataType__.__Convert__(val);
      viewCopy(r, this.__Value__, 0, r.byteLength);
    }}
  });
  global.Data = Data;

  function Type() { throw TypeError(); }
  Type.prototype = Data;
  global.Type = Type;

  // "block" is defined as an object with a __Value__ property (which is an ArrayBufferView)
  function isBlockObject(v) { return '__Value__' in Object(v); }
  function isBlockType(t) { return 'bytes' in t && '__Convert__' in t && '__Reify__' in t; }

  var littleEndian = true;

  // Intrinsic types
  [
    {name: 'int8', type: 'Int8', domain: function(x) { return -0x80 <= x && x < 0x80; } },
    {name: 'int16', type: 'Int16', domain: function(x) { return -0x8000 <= x && x < 0x8000; } },
    {name: 'int32', type: 'Int32', domain: function(x) { return -0x80000000 <= x && x < 0x80000000; } },
    {name: 'uint8', type: 'Uint8', domain: function(x) { return 0 <= x && x <= 0xff; } },
    {name: 'uint16', type: 'Uint16', domain: function(x) { return 0 <= x && x <= 0xffff; } },
    {name: 'uint32', type: 'Uint32', domain: function(x) { return 0 <= x && x <= 0xffffffff; } },
    {name: 'float32', type: 'Float32', domain: function(x) { return true; } },
    {name: 'float64', type: 'Float64', domain: function(x) { return true; } }
  ].forEach(function(desc) {
    var proto = Object.create(Data.prototype);
    var arrayType = global[desc.type + 'Array'],
        getter = 'get' + desc.type,
        setter = 'set' + desc.type,
        bytes = arrayType.BYTES_PER_ELEMENT;

    var t = function SomeNumericType(val) {
      if (this instanceof SomeNumericType) { throw TypeError("Numeric types should have value semantics"); }
      var x = t.__Cast__(val);
      return t.__Reify__(x);
    };
    //t.__proto__ = Type.prototype; // Needed for uint8 instanceof Type, but contradicts spec?
    t.__DataType__ = desc.name;
    t.__Convert__ = function Convert(value) {
      var block = Object.create(proto);
      block.__Value__ = new Uint8Array(bytes);
      if (value === true) {
        value = 1;
      } else if (value === false) {
        value = 0;
      } else if (typeof value === 'number' && desc.domain(value)) {
        // ok
      } else {
        throw TypeError("Value " + value + " is not a " + desc.name);
      }

      (new DataView(block.__Value__.buffer, 0, bytes))[setter](0, value, littleEndian);
      return block;
    };
    t.__IsSame__ = function IsSame(u) {
      return t.__DataType__ === Object(u).__DataType__;
    };
    t.__Cast__ = function Cast(val) {
      var v;
      try {
        v = t.__Convert__(val);
        return t.__Reify(v);
      } catch (e) {}
      if (val === Infinity || val === -Infinity || val !== val) {
        return 0; // TODO: Per spec, but bogus for float types?
      }
      if (typeof val === 'number') {
        return t.__CCast__(val);
      }
      if (typeof val === 'string') {
        v = Number(val);
        return t.__CCast__(v);
      }
      throw TypeError("Cannot cast " + val + " to " + desc.name);
    };
    t.__CCast__ = function CCast(n) {
      var a = new arrayType(1);
      a[0] = n;
      n = a[0];
      return t.__Convert__(n);
    };
    t.__Reify__ = function Reify(block) {
      var view = block.__Value__;
      return (new DataView(view.buffer, view.byteOffset, bytes))[getter](0, littleEndian);
    };

    t.__Class__ = 'DataType'; // TODO: Not in spec?
    t.prototype = proto; // TODO: Not in spec?
    t.prototype.constructor = t; // TODO: Not in spec?

    Object.defineProperty(t, 'bytes', { get: function() { return bytes; }});

    global[desc.name] = t;
  });

  function viewCopy(src, dst, offset, length) {
    var srcv = new Uint8Array(src.buffer, src.byteOffset, length);
    var dstv = new Uint8Array(dst.buffer, dst.byteOffset + offset, length);
    for (var i = 0; i < length; ++i) {
      dstv[i] = srcv[i];
    }
  }

  function ArrayType(elementType, length) {
    if (!(this instanceof ArrayType)) { throw TypeError("ArrayType cannot be called as a function."); }

    var proto = Object.create(ArrayType.prototype.prototype);
    length = length | 0;

    if (!isBlockType(elementType)) { throw TypeError("Type is not a block type"); }

    var bytes = elementType.bytes * length;

    function getter(thisobj, index) {
      var view = thisobj.__Value__;
      var offset = elementType.bytes * index;
      return elementType.__Reify__({__Value__: new Uint8Array(view.buffer, view.byteOffset + offset, elementType.bytes)});
    }
    function setter(thisobj, index, value) {
      var src = elementType.__Convert__(value).__Value__;
      var dst = thisobj.__Value__;
      viewCopy(src, dst, elementType.bytes * index, elementType.bytes);
    }

    for (var i = 0; i < length; ++i) {
      (function(index) {
        Object.defineProperty(proto, index, {
          get: function() {
            return getter(this, index);
          },
          set: function(value) {
            setter(this, index, value);
          }
        });
      }(i));
    }

    var t = function SomeArrayType(value) {
      if (!(this instanceof SomeArrayType)) { throw TypeError("Cannot call as a function"); }
      if (value === void 0 || Array.isArray(value)) {
        var a = t.__Construct__();
        if (value !== void 0) {
          var r = t.__Convert__(value);
          viewCopy(r.__Value__, a.__Value__, 0, bytes);
        }
        return a;
      } else {
        var length = Number(value);
        return new (new ArrayType(elementType, length)); // TODO: Return instance or type?
      }
    };
    t.__Class__ = 'DataType';
    t.__proto__ = ArrayType.prototype;
    t.__DataType__ = 'ArrayType';
    t.__ElementType__ = elementType;
    t.__Length__ = length;
    t.__Convert__ = function Convert(value) {
      // TODO: Precondition checks from spec.
      var block = t.__Construct__();
      for (var i = 0; i < length; ++i) {
        setter(block, i, value ? value[i] : void 0);
      };
      return block;
    };
    t.__IsSame__ = function IsSame(u) {
      u = Object(u);
      return u.__DataType__ === 'ArrayType' &&
        t.__ElementType__ === u.__ElementType__ &&
        t.__Length__ === u.__Length___;
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__Class__ = 'Data';
      block.__Value__ = new Uint8Array(bytes);
      block.__DataType__ = t;
      block.length = length;
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var result = [];
      for (var i = 0; i < length; ++i) {
        result[i] = getter(block, i);
      }
      return result;
    };

    t.prototype = proto;
    t.prototype.constructor = t;
    t.prototype.forEach = Array.prototype.forEach;
    t.prototype.fill = function fill(value) {
      if (this !== Object(this) || this.__Class__ !== 'Data' || !(this.__DataType__.__IsSame__(t))) {
        throw TypeError();
      }
      for (var i = 0; i < t.__Length__; ++i) {
        setter(this, i, value);
      }
    };
    t.prototype.cursor = function cursor(fields) {
      var view = new StructView(elementType);
      var index = 0;
      var array = this;
      return {
        'next': function() {
          if (index >= array.length) { throw global.StopIteration; } // TODO: Real iterator
          view.setView.apply(view, [array, index].concat(fields));
          ++index;
          return view;
        }
      };
    };
    Object.defineProperty(t, 'elementType', { get: function() { return elementType; }});
    t.length = length; // TODO: Fails because t is a Function
    Object.defineProperty(t, 'bytes', { get: function() { return bytes; }});

    return t;
  }
  ArrayType.prototype = Object.create(Type.prototype);
  ArrayType.prototype.constructor = ArrayType;
  // TODO: ArrayType.prototype.repeat
  // TODO: ArrayType.prototype.prototype.forEach (indirection?)
  // TODO: ArrayType.prototype.prototype.subarray (indirection?)


  function StructType(fields) {
    if (!(this instanceof StructType)) { throw TypeError("StructType cannot be called as a function."); }

    var proto = Object.create(Data.prototype);

    var desc = {};
    var bytes = 0;
    Object.keys(fields).forEach(function(name) {
      var type = fields[name];
      if (!isBlockType(type)) { throw TypeError("Type for '" + name + "' is not a block type"); }
      desc[name] = {
        type: type,
        offset: bytes
      };
      bytes += type.bytes;
    });

    function getter(thisobj, key) {
      var field = desc[key];
      var view = thisobj.__Value__;
      return field.type.__Reify__({__Value__: new Uint8Array(view.buffer, view.byteOffset + field.offset, field.type.bytes)});
    }
    function setter(thisobj, key, value) {
      var field = desc[key];
      var src = field.type.__Convert__(value).__Value__;
      var dst = thisobj.__Value__;
      viewCopy(src, dst, field.offset, field.type.bytes);
    }

    Object.keys(desc).forEach(function(name) {
      Object.defineProperty(proto, name, {
        get: function() {
          return getter(this, name);
        },
        set: function(value) {
          setter(this, name, value);
        }
      });
    });

    var t = function SomeStructType(value) {
      if (!(this instanceof SomeStructType)) { throw TypeError("objects have reference semantics"); }
      return t.__Convert__(value);
    };
    t.__Class__ = 'DataType';
    t.__proto__ = StructType.prototype;
    t.__DataType__ = 'StructType';
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      Object.keys(desc).forEach(function(name) {
        setter(block, name, value ? value[name] : void 0);
      });
      return block;
    };
    t.__IsSame__ = function IsSame(u) {
      return t === u;
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__Value__ = new Uint8Array(bytes);
      block.__Class__ = 'Block';
      block.__DataType__ = t;
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var result = {};
      Object.keys(desc).forEach(function(name) {
        result[name] = getter(block, name);
      });
      return result;
    };

    t.prototype = proto;
    t.prototype.constructor = t;
    Object.defineProperty(t, 'fields', { get: function() {
      var result = {};
      Object.keys(desc).forEach(function(name) {
        result[name] = desc[name].type;
      });
      return result;
    }});
    Object.defineProperty(t, 'bytes', { get: function() { return bytes; }});

    // For StructView
    t.__Fields__ = desc;

    return t;
  }
  StructType.prototype = Object.create(Type.prototype);
  StructType.prototype.constructor = StructType;

  global.ArrayType = ArrayType;
  global.StructType = StructType;

  function StructView(type) {
    if (!(this instanceof StructView)) { throw TypeError("StructView cannot be called as a function."); }
    if (Object(type).__DataType__ !== 'StructType') { throw TypeError("Type is not a StructType"); }

    // TODO: fields in StructView.prototype.setView(array, index, [...fields])
    // TODO: (Lazily) define as StructType.ViewType?

    function getter(array, index, key) {
      var field = type.__Fields__[key];
      var view = array.__Value__;
      return field.type.__Reify__({__Value__: new Uint8Array(view.buffer, view.byteOffset + type.bytes * index + field.offset, field.type.bytes)});
    }
    function setter(array, index, key, value) {
      var field = type.__Fields__[key];
      var src = field.type.__Convert__(value).__Value__;
      var dst = array.__Value__;
      viewCopy(src, dst, field.offset + type.bytes * index, field.type.bytes);
    }

    var that = this;
    Object.keys(type.__Fields__).forEach(function(name) {
      Object.defineProperty(that, name, {
        get: function() {
          if (!this.__Array__) throw Error();
          return getter(this.__Array__, this.__Index__, name);
        },
        set: function(value) {
          if (!this.__Array__) throw Error();
          setter(this.__Array__, this.__Index__, name, value);
        }
      });
    });

    this.__DataType__ = type; // TODO: Not in spec.
    Object.defineProperty(this, 'fields', { get: function() { return type.fields; }});
    Object.defineProperty(this, 'bytes', { get: function() { return type.bytes; }});
  }
  StructView.prototype = {};
  Object.defineProperty(StructView.prototype, 'setView', { value: function(array, index) {
    if (!Object(array).__DataType__) { throw TypeError(); }
    if (Object(Object(array).__DataType__).__DataType__ !== 'ArrayType') { throw TypeError(); }
    if (Object(Object(array).__DataType__).__ElementType__ !== this.__DataType__) { throw TypeError(); }

    index = index >> 0;
    if (index < 0 || index >= array.__Length__) { throw RangeError(); }
    this.__Array__ = array;
    this.__Index__ = index;
  }});

  global.StructView = StructView;

}(self));
