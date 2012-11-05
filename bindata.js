// http://wiki.ecmascript.org/doku.php?id=harmony:binary_data
(function(global){

  // Intrinsic types
  [
    {name: 'int8', getter: 'getInt8', setter: 'setInt8', size: 1 },
    {name: 'int16', getter: 'getInt16', setter: 'setInt16', size: 2 },
    {name: 'int32', getter: 'getInt32', setter: 'setInt32', size: 4 },
    {name: 'uint8', getter: 'getUint8', setter: 'setUint8', size: 1 },
    {name: 'uint16', getter: 'getUint16', setter: 'setUint16', size: 2 },
    {name: 'uint32', getter: 'getUint32', setter: 'setUint32',size: 4 },
    {name: 'float32', getter: 'getFloat32', setter: 'setFloat32', size: 4 },
    {name: 'float64', getter: 'getFloat64', setter: 'setFloat64', size: 8 }
  ].forEach(function(desc) {
    global[desc.name] = {
      size: desc.size,
      convert: function(value, buffer, offset) {
        (new DataView(buffer, offset))[desc.setter](0, value, true);
      },
      reify: function(buffer, offset) {
        return (new DataView(buffer, offset))[desc.getter](0, true);
      }
    };
  });

  function StructType(descriptor) {

    var proto = {};
    var size = 0;

    Object.keys(descriptor).forEach(function(name) {
      var type = descriptor[name];
      if (!('size' in type && 'convert' in type && 'reify' in type)) {
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
      }(name, type, size));
      size += type.size;
    });

    // TODO: Name this somehow
    var T = function(value) {
      this.buffer = new Uint8Array(size).buffer;
      if (value !== (void 0)) {
        T.convert(value, this.buffer, 0);
      }
    };
    T.convert = function(value, buffer, offset) {
      Object.keys(descriptor).forEach(function(name) {
        var type = descriptor[name];
        type.convert(value[name], buffer, offset);
        offset += type.size;
      });
    };
    T.reify = function(buffer, offset) {
      var result = {};
      Object.keys(descriptor).forEach(function(name) {
        var type = descriptor[name];
        result[name] = type.reify(buffer, offset);
        offset += type.size;
      });
      return result;
    };
    T.size = size;
    T.prototype = proto;

    proto.toJS = function() {
      return T.reify(this.buffer, 0);
    };

    return T;
  }


  function ArrayType(type, length) {
    var proto = {};
    length = length | 0;

    if (!('size' in type && 'convert' in type && 'reify' in type)) {
      throw new TypeError();
    }

    var size = type.size * length;

    for (var i = 0; i < length; ++i) {
      (function(type, index) {

        Object.defineProperty(proto, index, {
          get: function() {
            return type.reify(this.buffer, type.size * index);
          },
          set: function(value) {
            type.convert(value, this.buffer, type.size * index);
          }
        });

      }(type, i));
    }

    // TODO: Name this somehow
    var T = function(value) {
      this.buffer = new Uint8Array(size).buffer;
      if (value !== (void 0)) {
        T.convert(value, this.buffer, 0);
      }
    };
    T.convert = function(value, buffer, offset) {
      for (var i = 0; i < length; ++i) {
        type.convert(value[i], buffer, offset);
        offset += type.size;
      };
    };
    T.reify = function(buffer, offset) {
      var result = [];
      for (var i = 0; i < length; ++i) {
        result[i] = type.reify(buffer, offset);
        offset += type.size;
      }
      return result;
    };
    T.size = size;
    T.prototype = proto;

    proto.toJS = function() {
      return T.reify(this.buffer, 0);
    };

    return T;
  }

  global.StructType = StructType;
  global.ArrayType = ArrayType;
}(self));
