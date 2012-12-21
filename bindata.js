// http://wiki.ecmascript.org/doku.php?id=harmony:binary_data
(function(global){

  (function() {
    var orig = Object.prototype.toString;
    Object.prototype.toString = function toString() {
      if (Object(this) === this && '__Class__' in this) {
        return '[object ' + this.__Class__ + ']';
      }
      return orig.call(this, arguments);
    };
  }());

  function Data() { throw new TypeError(); }
  Data.prototype = {};
  Object.defineProperties(Data.prototype, {
    buffer: { get: function() { return this.__Value__.buffer; }},
    byteOffset: { get: function() { return this.__Value__.byteOffset; }},
    byteLength: { get: function() { return this.__Value__.byteLength; }},
    update: { value: function(val) {
      if (this !== Object(this) || !(this instanceof Data)) { throw new TypeError(); }
      var r = this.__DataType__.__Convert__(val);
      viewCopy(r, this.__Value__, 0, r.byteLength);
    }},
    valueOf: { value: function() {
      if (this !== Object(this) || !(this instanceof Data)) { throw new TypeError(); }
      return this.__DataType__.__Reify__(this);
    }}
  });
  global.Data = Data;

  // TODO: Use Type
  function Type() { throw new TypeError(); }
  Type.prototype = Data;
  global.Type = Type;

  // TODO: .repeat()
  // TODO: .updateRef()
  // TODO: .fill()
  // TODO: .subarray()

  // TODO: StructView(structType) / structView.setView(arrayInstance, index)
  // TODO: arrayType.cursor()

  // "block" is defined as an object with a __Value__ property (which is an ArrayBufferView)
  function isBlockObject(v) { return '__Value__' in Object(v); }
  function isBlockType(t) { return 'bytes' in t && '__Convert__' in t && '__Reify__' in t; }

  var endianness = false;

  // Intrinsic types
  [
    {name: 'int8', type: 'Int8' },
    {name: 'int16', type: 'Int16' },
    {name: 'int32', type: 'Int32' },
    {name: 'uint8', type: 'Uint8' },
    {name: 'uint16', type: 'Uint16' },
    {name: 'uint32', type: 'Uint32' },
    {name: 'float32', type: 'Float32' },
    {name: 'float64', type: 'Float64' }
  ].forEach(function(desc) {
    var proto = Object.create(Data.prototype);
    var arrayType = global[desc.type + 'Array'],
        getter = 'get' + desc.type,
        setter = 'set' + desc.type,
        bytes = arrayType.BYTES_PER_ELEMENT;

    var t = function SomeNumericType(value) {
      if (this instanceof SomeNumericType) { throw new TypeError("Numeric types should have value semantics"); }
      value = Number(value);
      return t.__Convert__(value);
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__Value__ = new Uint8Array(bytes);
      block.__DataType__ = t;
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      var view = block.__Value__;
      (new DataView(view.buffer, 0, bytes))[setter](0, value, endianness); // TODO: Not exercised by tests yet (?!?!)
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var view = block.__Value__;
      return (new DataView(view.buffer, view.byteOffset, bytes))[getter](0, endianness);
    };

    //t.__proto__ = Type.prototype; // Needed for uint8 instanceof Type
    t.prototype = proto;
    t.prototype.constructor = t;
    t.__Class__ = 'DataType';
    t.__DataType__ = desc.name;
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

  function ArrayType(type, length) {
    if (!(this instanceof ArrayType)) { throw new TypeError("ArrayType cannot be called as a function."); }

    var proto = Object.create(Data.prototype);
    length = length | 0;

    if (!isBlockType(type)) { throw new TypeError("Type is not a block type"); }

    var bytes = type.bytes * length;

    function getter(thisobj, index) {
      var view = thisobj.__Value__;
      var offset = type.bytes * index;
      return type.__Reify__({__Value__: new Uint8Array(view.buffer, view.byteOffset + offset, type.bytes)});
    }
    function setter(thisobj, index, value) {
      var src = type.__Convert__(value).__Value__;
      var dst = thisobj.__Value__;
      viewCopy(src, dst, type.bytes * index, type.bytes);
    }

    for (var i = 0; i < length; ++i) {
      (function(type, index) {

        Object.defineProperty(proto, index, {
          get: function() {
            return getter(this, index);
          },
          set: function(value) {
            setter(this, index, value);
          }
        });

      }(type, i));
    }

    var t = function SomeArrayType(value) {
      if (!(this instanceof SomeArrayType)) { throw new TypeError("objects have reference semantics"); }
      return t.__Convert__(value);
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__Class__ = 'Data';
      block.__Value__ = new Uint8Array(bytes);
      block.__DataType__ = t;
      block.length = length;
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      for (var i = 0; i < length; ++i) {
        setter(block, i, value ? value[i] : void 0);
      };
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var result = [];
      for (var i = 0; i < length; ++i) {
        result[i] = getter(block, i);
      }
      return result;
    };

    t.__Class__ = 'DataType';
    t.__proto__ = ArrayType.prototype;
    t.__DataType__ = 'array';
    t.__ElementType__ = type;
    t.prototype = proto;
    t.prototype.constructor = t;
    t.prototype.forEach = Array.prototype.forEach;
    t.__Length__ = length;
    t.prototype.fill = function fill(value) {
      for (var i = 0; i < t.__Length__; ++i) {
        setter(this, i, value);
      }
    };
    t.elementType = type;
    t.length = length; // TODO: Fails because t is a Function
    Object.defineProperty(t, 'bytes', { get: function() { return bytes; }});

    return t;
  }
  ArrayType.prototype = Object.create(Type.prototype);
  ArrayType.prototype.constructor = ArrayType;

  function StructType(fields) {
    if (!(this instanceof StructType)) { throw new TypeError("StructType cannot be called as a function."); }

    var proto = Object.create(Data.prototype);

    var desc = {};
    var bytes = 0;
    Object.keys(fields).forEach(function(name) {
      var type = fields[name];
      if (!isBlockType(type)) { throw new TypeError("Type for '" + name + "' is not a block type"); }
      desc[name] = {
        type: type,
        offset: bytes
      };
      bytes += type.bytes;
    });

    function getter(thisobj, key) {
      if (!desc.hasOwnProperty(key)) { throw new Error("Invalid field access"); }
      var field = desc[key];
      var view = thisobj.__Value__;
      return field.type.__Reify__({__Value__: new Uint8Array(view.buffer, view.byteOffset + field.offset, field.type.bytes)});
    }
    function setter(thisobj, key, value) {
      if (!desc.hasOwnProperty(key)) { throw new Error("Invalid field access"); }
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
      if (!(this instanceof SomeStructType)) { throw new TypeError("objects have reference semantics"); }
      return t.__Convert__(value);
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__Value__ = new Uint8Array(bytes);
      block.__Class__ = 'Block';
      block.__DataType__ = t;
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      Object.keys(fields).forEach(function(name) {
        setter(block, name, value ? value[name] : void 0);
      });
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
    t.__proto__ = StructType.prototype;
    t.__Class__ = 'DataType';
    t.__DataType__ = 'struct';
    Object.defineProperty(t, 'fields', { get: function() {
      var result = {};
      Object.keys(desc).forEach(function(name) {
        result[name] = desc[name].type;
      });
      return result;
    }});
    Object.defineProperty(t, 'bytes', { get: function() { return bytes; }});

    return t;
  }
  StructType.prototype = Object.create(Type.prototype);
  StructType.prototype.constructor = StructType;

  global.ArrayType = ArrayType;
  global.StructType = StructType;
}(self));
