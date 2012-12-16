// http://wiki.ecmascript.org/doku.php?id=harmony:binary_data
(function(global){

  var endianness = true;

  (function() {
    var orig = Object.prototype.toString;
    Object.prototype.toString = function toString() {
      if (Object(this) === this && '__Class__' in this) {
        return '[object ' + this.__Class__ + ']';
      }
      return orig.call(this, arguments);
    };
  }());

  // TODO: function Data()
  // TODO: .repeat()
  // TODO: .updateRef()
  // TODO: .fill()
  // TODO: .subarray()
  // TODO: .update()
  // TODO: read/write into ArrayBuffer
  // TODO: int64/uint64
  // TODO: __Value__ as ArrayBufferView?

  // "block" is defined as an object with a __View__ property (which is an ArrayBufferView)
  function isBlockObject(v) { return '__View__' in Object(v); }
  function isBlockType(t) { return 'bytes' in t && '__Convert__' in t && '__Reify__' in t; }

  // Intrinsic types
  [
    {name: 'int8', getter: 'getInt8', setter: 'setInt8', bytes: 1 },
    {name: 'int16', getter: 'getInt16', setter: 'setInt16', bytes: 2 },
    {name: 'int32', getter: 'getInt32', setter: 'setInt32', bytes: 4 },
    {name: 'uint8', getter: 'getUint8', setter: 'setUint8', bytes: 1 },
    {name: 'uint16', getter: 'getUint16', setter: 'setUint16', bytes: 2 },
    {name: 'uint32', getter: 'getUint32', setter: 'setUint32',bytes: 4 },
    {name: 'float32', getter: 'getFloat32', setter: 'setFloat32', bytes: 4 },
    {name: 'float64', getter: 'getFloat64', setter: 'setFloat64', bytes: 8 }
  ].forEach(function(desc) {
    var proto = {};

    var t = function SomeNumericType(value) {
      if (this instanceof SomeNumericType) { throw new TypeError("Numeric types should have value semantics"); }
      value = Number(value);
      return t.__Convert__(value);
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__View__ = new Uint8Array(desc.bytes);
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      (new DataView(block.__View__.buffer))[desc.setter](0, value, endianness);
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var view = block.__View__;
      return (new DataView(view.buffer, view.byteOffset, view.byteLength))[desc.getter](0, endianness);
    };

    t.prototype = proto;
    t.__Class__ = 'DataType';
    t.__DataType__ = desc.name;
    t.bytes = desc.bytes;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this);
    };

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
    var proto = {};
    length = length | 0;

    if (!isBlockType(type)) { throw new TypeError("Type is not a block type"); }

    var bytes = type.bytes * length;

    function getter(thisobj, index) {
      var view = thisobj.__View__;
      var offset = type.bytes * index;
      return type.__Reify__({__View__: new Uint8Array(view.buffer, view.byteOffset + offset, type.bytes)});
    }
    function setter(thisobj, index, value) {
      var src = type.__Convert__(value).__View__;
      var dst = thisobj.__View__;
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
      block.__View__ = new Uint8Array(bytes);
      block.__DataType__ = t;
      block.length = length;
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      for (var i = 0; i < length; ++i) {
        setter(block, i, value[i]);
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

    t.prototype = proto;
    t.prototype.forEach = Array.prototype.forEach;
    t.__Class__ = 'DataType';
    t.__DataType__ = 'array';
    t.__ElementType__ = type;
    t.__Length__ = length;
    t.prototype.constructor = t;
    t.prototype.fill = function fill(value) {
      for (var i = 0; i < t.__Length__; ++i) {
        setter(this, i, value);
      }
    };
    t.elementType = type;
    t.length = length; // TODO: Fails because t is a Function
    t.bytes = bytes;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this);
    };

    return t;
  }

  function StructType(fields) {

    var proto = {};
    var bytes = 0;

    // TODO: Define getter/setter (need to compute per-field offset)
    Object.keys(fields).forEach(function(name) {
      var type = fields[name];
      if (!isBlockType(type)) { throw new TypeError("Type for '" + name + "' is not a block type"); }

      (function(name, type, offset){
        Object.defineProperty(proto, name, {
          get: function() {
            var view = this.__View__;
            return type.__Reify__({__View__: new Uint8Array(view.buffer, view.byteOffset + offset, type.bytes)});
          },
          set: function(value) {
            var src = type.__Convert__(value).__View__;
            var dst = this.__View__;
            viewCopy(src, dst, offset, type.bytes);
          }
        });
      }(name, type, bytes));
      bytes += type.bytes;
    });

    var t = function SomeStructType(value) {
      if (!(this instanceof SomeStructType)) { throw new TypeError("objects have reference semantics"); }
      return t.__Convert__(value);
    };
    t.__Construct__ = function Construct() {
      var block = Object.create(proto);
      block.__View__ = new Uint8Array(bytes);
      block.__Class__ = 'Block';
      block.__DataType__ = t;
      return block;
    };
    t.__Convert__ = function Convert(value) {
      var block = t.__Construct__();
      var offset = 0;
      Object.keys(fields).forEach(function(name) {
        block[name] = value[name];
      });
      return block;
    };
    t.__Reify__ = function Reify(block) {
      var result = {};
      var view = block.__View__;
      Object.keys(fields).forEach(function(name) {
        var type = fields[name];
        result[name] = type.__Reify__({__View__: new Uint8Array(view.buffer, view.byteOffset + offset, type.bytes)});
        offset += type.bytes;
      });
      return result;
    };

    t.prototype = proto;
    t.__Class__ = 'DataType';
    t.__DataType__ = 'struct';
    t.prototype.constructor = t;
    t.fields = fields; // TODO: copy/freeze
    t.bytes = bytes;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this);
    };

    return t;
  }

  global.ArrayType = ArrayType;
  global.StructType = StructType;
}(self));
