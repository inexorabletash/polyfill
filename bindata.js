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

  // TODO: function Data()
  // TODO: .repeat()
  // TODO: .updateRef()
  // TODO: .fill()
  // TODO: .subarray()
  // TODO: .update()
  // TODO: read/write into ArrayBuffer
  // TODO: int64/uint64
  // TODO: bytes vs. byteLength
  // TODO: __Value__ as ArrayBufferView?

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
      this.__Value__ = new Uint8Array(desc.byteLength).buffer;
      if (value !== (void 0)) {
        t.__Convert__(value, this.__Value__, 0);
      }
    };
    t.__Convert__ = function Convert(value, buffer, offset) {
      (new DataView(buffer, offset))[desc.setter](0, value, true);
    };
    t.__Reify__ = function Reify(buffer, offset) {
      return (new DataView(buffer, offset))[desc.getter](0, true);
    };

    t.prototype = proto;
    t.__Class__ = 'DataType';
    t.__DataType__ = desc.name;
    t.bytes = t.byteLength = desc.byteLength;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this.__Value__, 0);
    };

    global[desc.name] = t;
  });

  function StructType(fields) {

    var proto = {};
    var byteLength = 0;

    Object.keys(fields).forEach(function(name) {
      var type = fields[name];
      if (!('byteLength' in type && '__Convert__' in type && '__Reify__' in type)) {
        throw new TypeError();
      }

      (function(name, type, offset){
        Object.defineProperty(proto, name, {
          get: function() {
            return type.__Reify__(this.__Value__, offset);
          },
          set: function(value) {
            type.__Convert__(value, this.__Value__, offset);
          }
        });
      }(name, type, byteLength));
      byteLength += type.byteLength;
    });

    var t = function SomeStructType(value) {
      return t.__Construct__(value, this);
    };
    t.__Construct__ = function Construct(val, s) {
      s.__Value__ = new Uint8Array(byteLength).buffer;
      s.__Class__ = 'Block';
      s.__DataType__ = t;
      if (val !== (void 0)) {
        t.__Convert__(val, s.__Value__, 0);
      }
    };
    t.__Convert__ = function Convert(value, buffer, offset) {
      Object.keys(fields).forEach(function(name) {
        var type = fields[name];
        type.__Convert__(value[name], buffer, offset);
        offset += type.byteLength;
      });
    };
    t.__Reify__ = function Reify(buffer, offset) {
      var result = {};
      Object.keys(fields).forEach(function(name) {
        var type = fields[name];
        result[name] = type.__Reify__(buffer, offset);
        offset += type.byteLength;
      });
      return result;
    };

    t.prototype = proto;
    t.__Class__ = 'DataType';
    t.__DataType__ = 'struct';
    t.prototype.constructor = t;
    t.fields = fields; // TODO: copy/freeze
    t.bytes = t.byteLength = byteLength;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this.__Value__, 0);
    };

    return t;
  }


  function ArrayType(type, length) {
    var proto = {};
    length = length | 0;

    if (!('byteLength' in type && '__Convert__' in type && '__Reify__' in type)) {
      throw new TypeError();
    }

    var byteLength = type.byteLength * length;

    for (var i = 0; i < length; ++i) {
      (function(type, index) {

        Object.defineProperty(proto, index, {
          get: function() {
            return type.__Reify__(this.__Value__, type.byteLength * index);
          },
          set: function(value) {
            type.__Convert__(value, this.__Value__, type.byteLength * index);
          }
        });

      }(type, i));
    }

    var t = function SomeArrayType(value) {
      t.__Construct__(value, this);
    };
    t.__Construct__ = function Construct(val, a) {
      a.__Class__ = 'Data';
      a.__Value__ = new Uint8Array(byteLength).buffer;
      a.__DataType__ = t;
      a.length = length;
      if (val !== (void 0)) {
        t.__Convert__(val, a.__Value__, 0);
      }
    };
    t.__Convert__ = function Convert(value, buffer, offset) {
      for (var i = 0; i < length; ++i) {
        type.__Convert__(value[i], buffer, offset);
        offset += type.byteLength;
      };
    };
    t.__Reify__ = function Reify(buffer, offset) {
      var result = [];
      for (var i = 0; i < length; ++i) {
        result[i] = type.__Reify__(buffer, offset);
        offset += type.byteLength;
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
    t.prototype.fill = function fill(val) {
      for (var i = 0; i < t.__Length__; ++i) {
        type.__Convert__(val, this.__Value__, i * t.__ElementType__.bytes);
      }
    };
    t.elementType = type;
    t.length = length; // TODO: Fails because t is a Function
    t.bytes = t.byteLength = byteLength;
    t.prototype.valueOf = function valueOf() {
      return t.__Reify__(this.__Value__, 0);
    };

    return t;
  }

  global.StructType = StructType;
  global.ArrayType = ArrayType;
}(self));
