// http://wiki.ecmascript.org/doku.php?id=harmony:binary_data
(function(global){

  // TODO: function Data()
  // TODO: .repeat()
  // TODO: .updateRef()
  // TODO: .fill()
  // TODO: .subarray()
  // TODO: .update()
  // TODO: read/write into ArrayBuffer
  // TODO: int64/uint64
  // TODO: bytes vs. byteLength

  // Intrinsic types
  [
    {name: 'int8', getter: 'getInt8', setter: 'setInt8', byteLength: 1 },
    {name: 'int16', getter: 'getInt16', setter: 'setInt16', byteLength: 2 },
    {name: 'int32', getter: 'getInt32', setter: 'setInt32', byteLength: 4 },
    {name: 'uint8', getter: 'getUint8', setter: 'setUint8', byteLength: 1 },
    {name: 'uint16', getter: 'getUint16', setter: 'setUint16', byteLength: 2 },
    {name: 'uint32', getter: 'getUint32', setter: 'setUint32',byteLength: 4 },
    {name: 'float32', getter: 'getFloat32', setter: 'setFloat32', byteLength: 4 },
    {name: 'float64', getter: 'getFloat64', setter: 'setFloat64', byteLength: 8 }
  ].forEach(function(desc) {
    var proto = {};

    var t = function SomeNumericType(value) {
      this.buffer = new Uint8Array(desc.byteLength).buffer;
      if (value !== (void 0)) {
        t.convert(value, this.buffer, 0);
      }
    };
    t.convert = function(value, buffer, offset) {
      (new DataView(buffer, offset))[desc.setter](0, value, true);
    };
    t.reify = function(buffer, offset) {
      return (new DataView(buffer, offset))[desc.getter](0, true);
    };

    t.prototype = proto;
    t.__DataType__ = name;
    t.byteLength = desc.byteLength;
    t.prototype.valueOf = function() {
      return t.reify(this.buffer, 0);
    };

    global[desc.name] = t;
  });

  function StructType(fields) {

    var proto = {};
    var byteLength = 0;

    Object.keys(fields).forEach(function(name) {
      var type = fields[name];
      if (!('byteLength' in type && 'convert' in type && 'reify' in type)) {
        throw new TypeError();
      }

      (function(name, type, offset){
        Object.defineProperty(proto, name, {
          get: function() {
            return type.reify(this.buffer, offset);
          },
          set: function(value) {
            type.convert(value, this.buffer, offset);
          }
        });
      }(name, type, byteLength));
      byteLength += type.byteLength;
    });

    var t = function SomeStructType(value) {
      this.buffer = new Uint8Array(byteLength).buffer;
      this.__DataType__ = t;
      if (value !== (void 0)) {
        t.convert(value, this.buffer, 0);
      }
    };
    t.convert = function(value, buffer, offset) {
      Object.keys(fields).forEach(function(name) {
        var type = fields[name];
        type.convert(value[name], buffer, offset);
        offset += type.byteLength;
      });
    };
    t.reify = function(buffer, offset) {
      var result = {};
      Object.keys(fields).forEach(function(name) {
        var type = fields[name];
        result[name] = type.reify(buffer, offset);
        offset += type.byteLength;
      });
      return result;
    };

    t.prototype = proto;
    t.__DataType__ = 'struct';
    t.prototype.constructor = t;
    t.fields = fields; // TODO: copy/freeze
    t.byteLength = byteLength;
    t.prototype.valueOf = function() {
      return t.reify(this.buffer, 0);
    };

    return t;
  }


  function ArrayType(type, length) {
    var proto = {};
    length = length | 0;

    if (!('byteLength' in type && 'convert' in type && 'reify' in type)) {
      throw new TypeError();
    }

    var byteLength = type.byteLength * length;

    for (var i = 0; i < length; ++i) {
      (function(type, index) {

        Object.defineProperty(proto, index, {
          get: function() {
            return type.reify(this.buffer, type.byteLength * index);
          },
          set: function(value) {
            type.convert(value, this.buffer, type.byteLength * index);
          }
        });

      }(type, i));
    }

    var t = function SomeArrayType(value) {
      this.buffer = new Uint8Array(byteLength).buffer;
      this.__DataType__ = t;
      this.length = length;
      if (value !== (void 0)) {
        t.convert(value, this.buffer, 0);
      }
    };
    t.convert = function(value, buffer, offset) {
      for (var i = 0; i < length; ++i) {
        type.convert(value[i], buffer, offset);
        offset += type.byteLength;
      };
    };
    t.reify = function(buffer, offset) {
      var result = [];
      for (var i = 0; i < length; ++i) {
        result[i] = type.reify(buffer, offset);
        offset += type.byteLength;
      }
      return result;
    };

    t.prototype = proto;
    t.prototype.forEach = Array.prototype.forEach;
    t.__DataType__ = 'array';
    t.prototype.constructor = t;
    // TODO: t.prototype.fill()
    t.elementType = type;
    t.length = length;
    t.byteLength = byteLength;
    t.prototype.valueOf = function() {
      return t.reify(this.buffer, 0);
    };

    return t;
  }

  global.StructType = StructType;
  global.ArrayType = ArrayType;
}(self));
