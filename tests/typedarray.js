/*global QUnit*/
// FF doesn't implement |call| for DOMException, so QUnit's "is this a function?" test fails
function isDOMException(x) { return x instanceof DOMException; }

// e.g. extractbits([0xff, 0x80, 0x00, 0x00], 23, 30); inclusive
function extractbits(bytes, lo, hi) {
  var out = 0;
  bytes = bytes.slice(); // make a copy
  var lsb = bytes.pop(), sc = 0, sh = 0;

  for (; lo > 0;  lo--, hi--) {
    lsb >>= 1;
    if (++sc === 8) { sc = 0; lsb = bytes.pop(); }
  }

  for (; hi >= 0;  hi--) {
    out = out | (lsb & 0x01) << sh++;
    lsb >>= 1;
    if (++sc === 8) { sc = 0; lsb = bytes.pop(); }
  }

  return out;
}

QUnit.assert.arrayEqual = function(a, b, m) {
  function toArray(a) {
    var r = [];
    for (var i = 0; i < a.length; ++i)
      r[i] = a[i];
    return r;
  }
  this.deepEqual(toArray(a), toArray(b), m);
};

QUnit.test('ArrayBuffer', function(assert) {
  assert.expect(7);

  var b;

  assert.deepEqual(new ArrayBuffer().byteLength, 0, 'no length');
  assert.ok(b = new ArrayBuffer(0), 'creation');
  assert.ok(b = new ArrayBuffer(1), 'creation');
  assert.ok(b = new ArrayBuffer(123), 'creation');

  b = new ArrayBuffer(123);
  assert.deepEqual(b.byteLength, 123, 'length');

  assert.throws(function() { return new ArrayBuffer(-1); }, RangeError, 'negative length');
  assert.throws(function() { return new ArrayBuffer(0x80000000); }, RangeError, 'absurd length');
});


QUnit.test('ArrayBufferView', function(assert) {
  assert.expect(6);

  var ab = new ArrayBuffer(48);
  var i32 = new Int32Array(ab, 16);
  i32.set([1, 2, 3, 4, 5, 6, 7, 8]);

  assert.deepEqual(i32.buffer, ab);
  assert.deepEqual(i32.byteOffset, 16);
  assert.deepEqual(i32.byteLength, 32);

  var da = new DataView(i32.buffer, 8);
  assert.deepEqual(da.buffer, ab);
  assert.deepEqual(da.byteOffset, 8);
  assert.deepEqual(da.byteLength, 40);
});


QUnit.test('TypedArrays', function(assert) {
  assert.expect(32);

  var a;

  assert.deepEqual(Int8Array.BYTES_PER_ELEMENT, 1, 'Int8Array.BYTES_PER_ELEMENT');
  a = new Int8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 1);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 8);

  assert.deepEqual(Uint8Array.BYTES_PER_ELEMENT, 1, 'Uint8Array.BYTES_PER_ELEMENT');
  a = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 1);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 8);

  assert.deepEqual(Int16Array.BYTES_PER_ELEMENT, 2, 'Int16Array.BYTES_PER_ELEMENT');
  a = new Int16Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 2);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 16);

  assert.deepEqual(Uint16Array.BYTES_PER_ELEMENT, 2, 'Uint16Array.BYTES_PER_ELEMENT');
  a = new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 2);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 16);

  assert.deepEqual(Int32Array.BYTES_PER_ELEMENT, 4, 'Int32Array.BYTES_PER_ELEMENT');
  a = new Int32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 4);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 32);

  assert.deepEqual(Uint32Array.BYTES_PER_ELEMENT, 4, 'Uint32Array.BYTES_PER_ELEMENT');
  a = new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 4);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 32);

  assert.deepEqual(Float32Array.BYTES_PER_ELEMENT, 4, 'Float32Array.BYTES_PER_ELEMENT');
  a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 4);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 32);

  assert.deepEqual(Float64Array.BYTES_PER_ELEMENT, 8, 'Float64Array.BYTES_PER_ELEMENT');
  a = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 8);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 64);
});


QUnit.test('typed array constructors', function(assert) {
  assert.expect(45);

  assert.arrayEqual(new Int8Array({ length: 3 }), [0, 0, 0]);
  var rawbuf = (new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])).buffer;

  var int8 = new Int8Array();
  assert.deepEqual(int8.length, 0, 'no args');
  assert.throws(function() { return new Int8Array(-1); }, /*Range*/Error, 'bogus length');
  assert.throws(function() { return new Int8Array(0x80000000); }, /*Range*/Error, 'bogus length');

  int8 = new Int8Array(4);
  assert.deepEqual(int8.BYTES_PER_ELEMENT, 1);
  assert.deepEqual(int8.length, 4, 'length');
  assert.deepEqual(int8.byteLength, 4, 'length');
  assert.deepEqual(int8.byteOffset, 0, 'length');
  assert.deepEqual(int8.get(-1), undefined, 'length, out of bounds');
  assert.deepEqual(int8.get(4), undefined, 'length, out of bounds');

  int8 = new Int8Array([1, 2, 3, 4, 5, 6]);
  assert.deepEqual(int8.length, 6, 'array');
  assert.deepEqual(int8.byteLength, 6, 'array');
  assert.deepEqual(int8.byteOffset, 0, 'array');
  assert.deepEqual(int8.get(3), 4, 'array');
  assert.deepEqual(int8.get(-1), undefined, 'array, out of bounds');
  assert.deepEqual(int8.get(6), undefined, 'array, out of bounds');

  int8 = new Int8Array(rawbuf);
  assert.deepEqual(int8.length, 8, 'buffer');
  assert.deepEqual(int8.byteLength, 8, 'buffer');
  assert.deepEqual(int8.byteOffset, 0, 'buffer');
  assert.deepEqual(int8.get(7), 7, 'buffer');
  int8.set([111]);
  assert.deepEqual(int8.get(0), 111, 'buffer');
  assert.deepEqual(int8.get(-1), undefined, 'buffer, out of bounds');
  assert.deepEqual(int8.get(8), undefined, 'buffer, out of bounds');

  int8 = new Int8Array(rawbuf, 2);
  assert.deepEqual(int8.length, 6, 'buffer, byteOffset');
  assert.deepEqual(int8.byteLength, 6, 'buffer, byteOffset');
  assert.deepEqual(int8.byteOffset, 2, 'buffer, byteOffset');
  assert.deepEqual(int8.get(5), 7, 'buffer, byteOffset');
  int8.set([112]);
  assert.deepEqual(int8.get(0), 112, 'buffer');
  assert.deepEqual(int8.get(-1), undefined, 'buffer, byteOffset, out of bounds');
  assert.deepEqual(int8.get(6), undefined, 'buffer, byteOffset, out of bounds');

  int8 = new Int8Array(rawbuf, 8);
  assert.deepEqual(int8.length, 0, 'buffer, byteOffset');

  assert.throws(function() { return new Int8Array(rawbuf, -1); }, 'invalid byteOffset');
  assert.throws(function() { return new Int8Array(rawbuf, 9); }, 'invalid byteOffset');
  assert.throws(function() { return new Int8Array(rawbuf, -1); }, 'invalid byteOffset');
  assert.throws(function() { return new Int32Array(rawbuf, 5); }, 'invalid byteOffset');

  int8 = new Int8Array(rawbuf, 2, 4);
  assert.deepEqual(int8.length, 4, 'buffer, byteOffset, length');
  assert.deepEqual(int8.byteLength, 4, 'buffer, byteOffset, length');
  assert.deepEqual(int8.byteOffset, 2, 'buffer, byteOffset, length');
  assert.deepEqual(int8.get(3), 5, 'buffer, byteOffset, length');
  int8.set([113]);
  assert.deepEqual(int8.get(0), 113, 'buffer, byteOffset, length');
  assert.deepEqual(int8.get(-1), undefined, 'buffer, byteOffset, length, out of bounds');
  assert.deepEqual(int8.get(4), undefined, 'buffer, byteOffset, length, out of bounds');

  assert.throws(function() { return new Int8Array(rawbuf, 0, 9); }, 'invalid byteOffset+length');
  assert.throws(function() { return new Int8Array(rawbuf, 8, 1); }, 'invalid byteOffset+length');
  assert.throws(function() { return new Int8Array(rawbuf, 9, -1); }, 'invalid byteOffset+length');
});


QUnit.test('TypedArray clone constructor', function(assert) {
  assert.expect(3);

  var src = new Int32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  var dst = new Int32Array(src);
  assert.arrayEqual(dst, [1, 2, 3, 4, 5, 6, 7, 8]);
  src.set([99]);
  assert.arrayEqual(src, [99, 2, 3, 4, 5, 6, 7, 8]);
  assert.arrayEqual(dst, [1, 2, 3, 4, 5, 6, 7, 8]);
});


QUnit.test('conversions', function(assert) {
  assert.expect(6);

  var uint8 = new Uint8Array([1, 2, 3, 4]),
      uint16 = new Uint16Array(uint8.buffer),
      uint32 = new Uint32Array(uint8.buffer);

  // Note: can't probe individual bytes without endianness awareness
  assert.arrayEqual(uint8, [1, 2, 3, 4]);
  uint16.set([0xffff]);
  assert.arrayEqual(uint8, [0xff, 0xff, 3, 4]);
  uint16.set([0xeeee], 1);
  assert.arrayEqual(uint8, [0xff, 0xff, 0xee, 0xee]);
  uint32.set([0x11111111]);
  assert.deepEqual(uint16.get(0), 0x1111);
  assert.deepEqual(uint16.get(1), 0x1111);
  assert.arrayEqual(uint8, [0x11, 0x11, 0x11, 0x11]);
});


QUnit.test('signed/unsigned conversions', function(assert) {
  assert.expect(11);

  var int8 = new Int8Array(1), uint8 = new Uint8Array(int8.buffer);
  uint8.set([123]);
  assert.deepEqual(int8.get(0), 123, 'int8/uint8');
  uint8.set([161]);
  assert.deepEqual(int8.get(0), -95, 'int8/uint8');
  int8.set([-120]);
  assert.deepEqual(uint8.get(0), 136, 'uint8/int8');
  int8.set([-1]);
  assert.deepEqual(uint8.get(0), 0xff, 'uint8/int8');

  var int16 = new Int16Array(1), uint16 = new Uint16Array(int16.buffer);
  uint16.set([3210]);
  assert.deepEqual(int16.get(0), 3210, 'int16/uint16');
  uint16.set([49232]);
  assert.deepEqual(int16.get(0), -16304, 'int16/uint16');
  int16.set([-16384]);
  assert.deepEqual(uint16.get(0), 49152, 'uint16/int16');
  int16.set([-1]);
  assert.deepEqual(uint16.get(0), 0xffff, 'uint16/int16');

  var int32 = new Int32Array(1), uint32 = new Uint32Array(int32.buffer);
  uint32.set([0x80706050]);
  assert.deepEqual(int32.get(0), -2140118960, 'int32/uint32');
  int32.set([-2023406815]);
  assert.deepEqual(uint32.get(0), 0x87654321, 'uint32/int32');
  int32.set([-1]);
  assert.deepEqual(uint32.get(0), 0xffffffff, 'uint32/int32');
});


QUnit.test('IEEE754 single precision unpacking', function(assert) {

  function fromBytes(bytes) {
    var uint8 = new Uint8Array(bytes),
        dv = new DataView(uint8.buffer);
    return dv.getFloat32(0);
  }

  assert.deepEqual(fromBytes([0xff, 0xff, 0xff, 0xff]), NaN, 'Q-NaN');
  assert.deepEqual(fromBytes([0xff, 0xc0, 0x00, 0x01]), NaN, 'Q-NaN');

  assert.deepEqual(fromBytes([0xff, 0xc0, 0x00, 0x00]), NaN, 'Indeterminate');

  assert.deepEqual(fromBytes([0xff, 0xbf, 0xff, 0xff]), NaN, 'S-NaN');
  assert.deepEqual(fromBytes([0xff, 0x80, 0x00, 0x01]), NaN, 'S-NaN');

  assert.deepEqual(fromBytes([0xff, 0x80, 0x00, 0x00]), -Infinity, '-Infinity');

  assert.deepEqual(fromBytes([0xff, 0x7f, 0xff, 0xff]), -3.4028234663852886E+38, '-Normalized');
  assert.deepEqual(fromBytes([0x80, 0x80, 0x00, 0x00]), -1.1754943508222875E-38, '-Normalized');
  assert.deepEqual(fromBytes([0xff, 0x7f, 0xff, 0xff]), -3.4028234663852886E+38, '-Normalized');
  assert.deepEqual(fromBytes([0x80, 0x80, 0x00, 0x00]), -1.1754943508222875E-38, '-Normalized');

  // TODO: Denormalized values fail on Safari on iOS/ARM
  assert.deepEqual(fromBytes([0x80, 0x7f, 0xff, 0xff]), -1.1754942106924411E-38, '-Denormalized');
  assert.deepEqual(fromBytes([0x80, 0x00, 0x00, 0x01]), -1.4012984643248170E-45, '-Denormalized');

  assert.deepEqual(fromBytes([0x80, 0x00, 0x00, 0x00]), -0, '-0');
  assert.deepEqual(fromBytes([0x00, 0x00, 0x00, 0x00]), +0, '+0');

  // TODO: Denormalized values fail on Safari on iOS/ARM
  assert.deepEqual(fromBytes([0x00, 0x00, 0x00, 0x01]), 1.4012984643248170E-45, '+Denormalized');
  assert.deepEqual(fromBytes([0x00, 0x7f, 0xff, 0xff]), 1.1754942106924411E-38, '+Denormalized');

  assert.deepEqual(fromBytes([0x00, 0x80, 0x00, 0x00]), 1.1754943508222875E-38, '+Normalized');
  assert.deepEqual(fromBytes([0x7f, 0x7f, 0xff, 0xff]), 3.4028234663852886E+38, '+Normalized');

  assert.deepEqual(fromBytes([0x7f, 0x80, 0x00, 0x00]), +Infinity, '+Infinity');

  assert.deepEqual(fromBytes([0x7f, 0x80, 0x00, 0x01]), NaN, 'S+NaN');
  assert.deepEqual(fromBytes([0x7f, 0xbf, 0xff, 0xff]), NaN, 'S+NaN');

  assert.deepEqual(fromBytes([0x7f, 0xc0, 0x00, 0x00]), NaN, 'Q+NaN');
  assert.deepEqual(fromBytes([0x7f, 0xff, 0xff, 0xff]), NaN, 'Q+NaN');
});


QUnit.test('IEEE754 single precision packing', function(assert) {

  function toBytes(v) {
    var uint8 = new Uint8Array(4), dv = new DataView(uint8.buffer);
    dv.setFloat32(0, v);
    var bytes = [];
    for (var i = 0; i < 4; i += 1) {
      bytes.push(uint8.get(i));
    }
    return bytes;
  }

  assert.deepEqual(toBytes(-Infinity), [0xff, 0x80, 0x00, 0x00], '-Infinity');

  assert.deepEqual(toBytes(-3.4028235677973366e+38), [0xff, 0x80, 0x00, 0x00], '-Overflow');
  assert.deepEqual(toBytes(-3.402824E+38), [0xff, 0x80, 0x00, 0x00], '-Overflow');

  assert.deepEqual(toBytes(-3.4028234663852886E+38), [0xff, 0x7f, 0xff, 0xff], '-Normalized');
  assert.deepEqual(toBytes(-1.1754943508222875E-38), [0x80, 0x80, 0x00, 0x00], '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(toBytes(-1.1754942106924411E-38), [0x80, 0x7f, 0xff, 0xff], '-Denormalized');
  assert.deepEqual(toBytes(-1.4012984643248170E-45), [0x80, 0x00, 0x00, 0x01], '-Denormalized');

  assert.deepEqual(toBytes(-7.006492321624085e-46), [0x80, 0x00, 0x00, 0x00], '-Underflow');

  assert.deepEqual(toBytes(-0), [0x80, 0x00, 0x00, 0x00], '-0');
  assert.deepEqual(toBytes(0), [0x00, 0x00, 0x00, 0x00], '+0');

  assert.deepEqual(toBytes(7.006492321624085e-46), [0x00, 0x00, 0x00, 0x00], '+Underflow');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(toBytes(1.4012984643248170E-45), [0x00, 0x00, 0x00, 0x01], '+Denormalized');
  assert.deepEqual(toBytes(1.1754942106924411E-38), [0x00, 0x7f, 0xff, 0xff], '+Denormalized');

  assert.deepEqual(toBytes(1.1754943508222875E-38), [0x00, 0x80, 0x00, 0x00], '+Normalized');
  assert.deepEqual(toBytes(3.4028234663852886E+38), [0x7f, 0x7f, 0xff, 0xff], '+Normalized');

  assert.deepEqual(toBytes(+3.402824E+38), [0x7f, 0x80, 0x00, 0x00], '+Overflow');
  assert.deepEqual(toBytes(+3.402824E+38), [0x7f, 0x80, 0x00, 0x00], '+Overflow');
  assert.deepEqual(toBytes(+Infinity), [0x7f, 0x80, 0x00, 0x00], '+Infinity');

  // Allow any NaN pattern (exponent all 1's, fraction non-zero)
  var nanbytes = toBytes(NaN),
      sign = extractbits(nanbytes, 31, 31),
      exponent = extractbits(nanbytes, 23, 30),
      fraction = extractbits(nanbytes, 0, 22);
  assert.ok(exponent === 255 && fraction !== 0, 'NaN');
});


QUnit.test('IEEE754 double precision unpacking', function(assert) {

  function fromBytes(bytes) {
    var uint8 = new Uint8Array(bytes),
        dv = new DataView(uint8.buffer);
    return dv.getFloat64(0);
  }

  assert.deepEqual(fromBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'Q-NaN');
  assert.deepEqual(fromBytes([0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'Q-NaN');

  assert.deepEqual(fromBytes([0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), NaN, 'Indeterminate');

  assert.deepEqual(fromBytes([0xff, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'S-NaN');
  assert.deepEqual(fromBytes([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'S-NaN');

  assert.deepEqual(fromBytes([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -Infinity, '-Infinity');

  assert.deepEqual(fromBytes([0xff, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), -1.7976931348623157E+308, '-Normalized');
  assert.deepEqual(fromBytes([0x80, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -2.2250738585072014E-308, '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(fromBytes([0x80, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), -2.2250738585072010E-308, '-Denormalized');
  assert.deepEqual(fromBytes([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), -4.9406564584124654E-324, '-Denormalized');

  assert.deepEqual(fromBytes([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -0, '-0');
  assert.deepEqual(fromBytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), +0, '+0');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(fromBytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), 4.9406564584124654E-324, '+Denormalized');
  assert.deepEqual(fromBytes([0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 2.2250738585072010E-308, '+Denormalized');

  assert.deepEqual(fromBytes([0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 2.2250738585072014E-308, '+Normalized');
  assert.deepEqual(fromBytes([0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 1.7976931348623157E+308, '+Normalized');

  assert.deepEqual(fromBytes([0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), +Infinity, '+Infinity');

  assert.deepEqual(fromBytes([0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'S+NaN');
  assert.deepEqual(fromBytes([0x7f, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'S+NaN');

  assert.deepEqual(fromBytes([0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), NaN, 'Q+NaN');
  assert.deepEqual(fromBytes([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'Q+NaN');
});


QUnit.test('IEEE754 double precision packing', function(assert) {

  function toBytes(v) {
    var uint8 = new Uint8Array(8),
        dv = new DataView(uint8.buffer);
    dv.setFloat64(0, v);
    var bytes = [];
    for (var i = 0; i < 8; i += 1) {
      bytes.push(uint8.get(i));
    }
    return bytes;
  }

  assert.deepEqual(toBytes(-Infinity), [0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-Infinity');

  assert.deepEqual(toBytes(-1.7976931348623157E+308), [0xff, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '-Normalized');
  assert.deepEqual(toBytes(-2.2250738585072014E-308), [0x80, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(toBytes(-2.2250738585072010E-308), [0x80, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '-Denormalized');
  assert.deepEqual(toBytes(-4.9406564584124654E-324), [0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], '-Denormalized');

  assert.deepEqual(toBytes(-0), [0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-0');
  assert.deepEqual(toBytes(0), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+0');

  // TODO: Denormalized values fail on Safari iOS/ARM
  assert.deepEqual(toBytes(4.9406564584124654E-324), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], '+Denormalized');
  assert.deepEqual(toBytes(2.2250738585072010E-308), [0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '+Denormalized');

  assert.deepEqual(toBytes(2.2250738585072014E-308), [0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+Normalized');
  assert.deepEqual(toBytes(1.7976931348623157E+308), [0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '+Normalized');

  assert.deepEqual(toBytes(+Infinity), [0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+Infinity');

  // Allow any NaN pattern (exponent all 1's, fraction non-zero)
  var nanbytes = toBytes(NaN),
      sign = extractbits(nanbytes, 63, 63),
      exponent = extractbits(nanbytes, 52, 62),
      fraction = extractbits(nanbytes, 0, 51);
  assert.ok(exponent === 2047 && fraction !== 0, 'NaN');
});


QUnit.test('Int32Array round trips', function(assert) {
  assert.expect(9);

  var i32 = new Int32Array([0]);
  var data = [
    0,
    1,
      -1,
    123,
      -456,
    0x80000000 >> 0,
    0x7fffffff >> 0,
    0x12345678 >> 0,
    0x87654321 >> 0
  ];

  for (var i = 0; i < data.length; i += 1) {
    var datum = data[i];
    i32.set([datum]);
    assert.deepEqual(datum, i32.get(0), String(datum));
  }
});


QUnit.test('Int16Array round trips', function(assert) {
  assert.expect(9);

  var i16 = new Int16Array([0]);
  var data = [
    0,
    1,
      -1,
    123,
      -456,
    0xffff8000 >> 0,
    0x00007fff >> 0,
    0x00001234 >> 0,
    0xffff8765 >> 0
  ];

  for (var i = 0; i < data.length; i += 1) {
    var datum = data[i];
    i16.set([datum]);
    assert.deepEqual(datum, i16.get(0), String(datum));
  }
});


QUnit.test('Int8Array round trips', function(assert) {
  assert.expect(9);

  var i8 = new Int8Array([0]);
  var data = [
    0,
    1,
      -1,
    123,
      -45,
    0xffffff80 >> 0,
    0x0000007f >> 0,
    0x00000012 >> 0,
    0xffffff87 >> 0
  ];

  for (var i = 0; i < data.length; i += 1) {
    var datum = data[i];
    i8.set([datum]);
    assert.deepEqual(datum, i8.get(0), String(datum));
  }
});


QUnit.test('IEEE754 single precision round trips', function(assert) {
  assert.expect(28);

  var f32 = new Float32Array([0]);

  var data = [
    0,
    1,
      -1,
    123,
      -456,

    2147483647,
    -2147483647,

    2147483648,
    -2147483648,

    1.2,
    1.23,
    1.234,

    1.234e-30,
    1.234e-20,
    1.234e-10,
    1.234e10,
    1.234e20,
    1.234e30,

    3.1415,
    6.0221415e+23,
    6.6260693e-34,
    6.67428e-11,
    299792458,

    0,
      -0,
    Infinity,
      -Infinity,
    NaN
  ];

  // Round p to n binary places of binary
  function precision(n, p) {
    if (p >= 52 || isNaN(n) || n === 0 || n === Infinity || n === -Infinity) {
      return n;
    }
    else {
      var m = Math.pow(2, p - Math.floor(Math.log(n) / Math.LN2));
      return Math.round(n * m) / m;
    }
  }

  function single(n) { return precision(n, 23); }

  for (var i = 0; i < data.length; i += 1) {
    var datum = data[i];
    f32.set([datum]);
    assert.deepEqual(single(datum), single(f32.get(0)), 'value: ' + String(datum));
  }
});


QUnit.test('IEEE754 double precision round trips', function(assert) {
  assert.expect(24);

  var f64 = new Float64Array([0]);

  var data = [
    0,
    1,
      -1,
    123,
      -456,

    1.2,
    1.23,
    1.234,

    1.234e-30,
    1.234e-20,
    1.234e-10,
    1.234e10,
    1.234e20,
    1.234e30,

    3.1415,
    6.0221415e+23,
    6.6260693e-34,
    6.67428e-11,
    299792458,

    0,
      -0,
    Infinity,
      -Infinity,
    NaN
  ];

  for (var i = 0; i < data.length; i += 1) {
    var datum = data[i];
    f64.set([datum]);
    assert.deepEqual(datum, f64.get(0), String(datum));
  }
});


QUnit.test('TypedArray setting', function(assert) {
  assert.expect(8);

  var a = new Int32Array([1, 2, 3, 4, 5]);
  var b = new Int32Array(5);
  b.set(a);
  assert.arrayEqual(b, [1, 2, 3, 4, 5]);
  assert.throws(function() { b.set(a, 1); });

  b.set(new Int32Array([99, 98]), 2);
  assert.arrayEqual(b, [1, 2, 99, 98, 5]);

  b.set(new Int32Array([99, 98, 97]), 2);
  assert.arrayEqual(b, [1, 2, 99, 98, 97]);

  assert.throws(function() { b.set(new Int32Array([99, 98, 97, 96]), 2); });
  assert.throws(function() { b.set([101, 102, 103, 104], 4); });

  //  ab = [ 0, 1, 2, 3, 4, 5, 6, 7 ]
  //  a1 = [ ^, ^, ^, ^, ^, ^, ^, ^ ]
  //  a2 =             [ ^, ^, ^, ^ ]
  var ab = new ArrayBuffer(8);
  var a1 = new Uint8Array(ab);
  for (var i = 0; i < a1.length; i += 1) { a1.set([i], i); }
  var a2 = new Uint8Array(ab, 4);
  a1.set(a2, 2);
  assert.arrayEqual(a1, [0, 1, 4, 5, 6, 7, 6, 7]);
  assert.arrayEqual(a2, [6, 7, 6, 7]);
});


QUnit.test('TypedArray.subarray', function(assert) {
  assert.expect(10);

  var a = new Int32Array([1, 2, 3, 4, 5]);
  assert.arrayEqual(a.subarray(3), [4, 5]);
  assert.arrayEqual(a.subarray(1, 3), [2, 3]);
  assert.arrayEqual(a.subarray(-3), [3, 4, 5]);
  assert.arrayEqual(a.subarray(-3, -1), [3, 4]);
  assert.arrayEqual(a.subarray(3, 2), []);
  assert.arrayEqual(a.subarray(-2, -3), []);
  assert.arrayEqual(a.subarray(4, 1), []);
  assert.arrayEqual(a.subarray(-1, -4), []);
  assert.arrayEqual(a.subarray(1).subarray(1), [3, 4, 5]);
  assert.arrayEqual(a.subarray(1, 4).subarray(1, 2), [3]);
});


QUnit.test('DataView constructors', function(assert) {
  assert.expect(6);

  var d = new DataView(new ArrayBuffer(8));

  d.setUint32(0, 0x12345678);
  assert.deepEqual(d.getUint32(0), 0x12345678, isDOMException, 'big endian/big endian');

  d.setUint32(0, 0x12345678, true);
  assert.deepEqual(d.getUint32(0, true), 0x12345678, 'little endian/little endian');

  d.setUint32(0, 0x12345678, true);
  assert.deepEqual(d.getUint32(0), 0x78563412, 'little endian/big endian');

  d.setUint32(0, 0x12345678);
  assert.deepEqual(d.getUint32(0, true), 0x78563412, 'big endian/little endian');

  // Chrome allows no arguments, throws if non-ArrayBuffer
  //assert.deepEqual(new DataView().buffer.byteLength, 0, 'no arguments');

  // Safari (iOS 5) does not
  //raises(function() { return new DataView(); }, TypeError, 'no arguments');

  // Chrome raises TypeError, Safari iOS5 raises isDOMException(INDEX_SIZE_ERR)
  assert.throws(function() { return new DataView({}); }, 'non-ArrayBuffer argument');

  assert.throws(function() { return new DataView("bogus"); }, TypeError, 'non-ArrayBuffer argument');
});


QUnit.test('DataView accessors', function(assert) {
  assert.expect(17);

  var u = new Uint8Array(8), d = new DataView(u.buffer);
  assert.arrayEqual(u, [0, 0, 0, 0, 0, 0, 0, 0]);

  d.setUint8(0, 255);
  assert.arrayEqual(u, [0xff, 0, 0, 0, 0, 0, 0, 0]);

  d.setInt8(1, -1);
  assert.arrayEqual(u, [0xff, 0xff, 0, 0, 0, 0, 0, 0]);

  d.setUint16(2, 0x1234);
  assert.arrayEqual(u, [0xff, 0xff, 0x12, 0x34, 0, 0, 0, 0]);

  d.setInt16(4, -1);
  assert.arrayEqual(u, [0xff, 0xff, 0x12, 0x34, 0xff, 0xff, 0, 0]);

  d.setUint32(1, 0x12345678);
  assert.arrayEqual(u, [0xff, 0x12, 0x34, 0x56, 0x78, 0xff, 0, 0]);

  d.setInt32(4, -2023406815);
  assert.arrayEqual(u, [0xff, 0x12, 0x34, 0x56, 0x87, 0x65, 0x43, 0x21]);

  d.setFloat32(2, 1.2E+38);
  assert.arrayEqual(u, [0xff, 0x12, 0x7e, 0xb4, 0x8e, 0x52, 0x43, 0x21]);

  d.setFloat64(0, -1.2345678E+301);
  assert.arrayEqual(u, [0xfe, 0x72, 0x6f, 0x51, 0x5f, 0x61, 0x77, 0xe5]);

  u.set([0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87]);
  assert.deepEqual(d.getUint8(0), 128);
  assert.deepEqual(d.getInt8(1), -127);
  assert.deepEqual(d.getUint16(2), 33411);
  assert.deepEqual(d.getInt16(3), -31868);
  assert.deepEqual(d.getUint32(4), 2223343239);
  assert.deepEqual(d.getInt32(2), -2105310075);
  assert.deepEqual(d.getFloat32(2), -1.932478247535851e-37);
  assert.deepEqual(d.getFloat64(0), -3.116851295377095e-306);

});


QUnit.test('DataView endian', function(assert) {
  assert.expect(27);

  var rawbuf = (new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])).buffer;
  var d;

  d = new DataView(rawbuf);
  assert.deepEqual(d.byteLength, 8, 'buffer');
  assert.deepEqual(d.byteOffset, 0, 'buffer');
  assert.throws(function() { d.getUint8(-2); }); // Chrome bug for index -, DOMException, 'bounds for buffer'?
  assert.throws(function() { d.getUint8(8); }, 'bounds for buffer');
  assert.throws(function() { d.setUint8(-2, 0); }, 'bounds for buffer');
  assert.throws(function() { d.setUint8(8, 0); }, 'bounds for buffer');

  d = new DataView(rawbuf, 2);
  assert.deepEqual(d.byteLength, 6, 'buffer, byteOffset');
  assert.deepEqual(d.byteOffset, 2, 'buffer, byteOffset');
  assert.deepEqual(d.getUint8(5), 7, 'buffer, byteOffset');
  assert.throws(function() { d.getUint8(-2); }, 'bounds for buffer, byteOffset');
  assert.throws(function() { d.getUint8(6); }, 'bounds for buffer, byteOffset');
  assert.throws(function() { d.setUint8(-2, 0); }, 'bounds for buffer, byteOffset');
  assert.throws(function() { d.setUint8(6, 0); }, 'bounds for buffer, byteOffset');

  d = new DataView(rawbuf, 8);
  assert.deepEqual(d.byteLength, 0, 'buffer, byteOffset');

  assert.throws(function() { return new DataView(rawbuf, -1); }, 'invalid byteOffset');
  assert.throws(function() { return new DataView(rawbuf, 9); }, 'invalid byteOffset');
  assert.throws(function() { return new DataView(rawbuf, -1); }, 'invalid byteOffset');

  d = new DataView(rawbuf, 2, 4);
  assert.deepEqual(d.byteLength, 4, 'buffer, byteOffset, length');
  assert.deepEqual(d.byteOffset, 2, 'buffer, byteOffset, length');
  assert.deepEqual(d.getUint8(3), 5, 'buffer, byteOffset, length');
  assert.throws(function() { return d.getUint8(-2); }, 'bounds for buffer, byteOffset, length');
  assert.throws(function() { d.getUint8(4); }, 'bounds for buffer, byteOffset, length');
  assert.throws(function() { d.setUint8(-2, 0); }, 'bounds for buffer, byteOffset, length');
  assert.throws(function() { d.setUint8(4, 0); }, 'bounds for buffer, byteOffset, length');

  assert.throws(function() { return new DataView(rawbuf, 0, 9); }, 'invalid byteOffset+length');
  assert.throws(function() { return new DataView(rawbuf, 8, 1); }, 'invalid byteOffset+length');
  assert.throws(function() { return new DataView(rawbuf, 9, -1); }, 'invalid byteOffset+length');
});


QUnit.test('Typed Array getters/setters', function(assert) {
  // Only supported if Object.defineProperty() is fully supported on non-DOM objects.
  try {
    var o = {};
    Object.defineProperty(o, 'x', { get: function() { return 1; } });
    if (o.x !== 1) throw Error();
  } catch (_) {
    assert.ok(true);
    return;
  }

  var bytes = new Uint8Array([1, 2, 3, 4]),
      uint32s = new Uint32Array(bytes.buffer);

  assert.deepEqual(bytes[1], 2);
  uint32s[0] = 0xffffffff;
  assert.deepEqual(bytes[1], 0xff);
});

QUnit.test('Uint8ClampedArray', function(assert) {
  assert.expect(5);

  assert.deepEqual(Uint8ClampedArray.BYTES_PER_ELEMENT, 1, 'Uint8ClampedArray.BYTES_PER_ELEMENT');
  var a = new Uint8ClampedArray([-Infinity, -Number.MAX_VALUE, -1, -Number.MIN_VALUE, -0,
                                 0, Number.MIN_VALUE, 1, 1.1, 1.9, 255, 255.1, 255.9, 256, Number.MAX_VALUE, Infinity,
                                 NaN]);
  assert.deepEqual(a.BYTES_PER_ELEMENT, 1);
  assert.deepEqual(a.byteOffset, 0);
  assert.deepEqual(a.byteLength, 17);
  assert.arrayEqual(a, [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0]);
});

QUnit.test('Regression Tests', function(assert) {
  // Bug: https://github.com/inexorabletash/polyfill/issues/16
  var minFloat32 = 1.401298464324817e-45;
  var truncated = new Float32Array([-minFloat32 / 2 - Math.pow(2, -202)]).get(0);
  assert.deepEqual(truncated, -minFloat32, 'smallest 32 bit float should not truncate to zero');

  // Bug: https://github.com/inexorabletash/polyfill/issues/66
  var y = Number.MAX_VALUE / 2, x = new Float64Array([y]);
  assert.deepEqual(x.get(0), y, 'rounding for exponent edge cases');

});

QUnit.test('ES2015 Typed Array Extras', function(assert) {
  assert.arrayEqual(Uint16Array.from([1, 2, 3]), [1, 2, 3]);
  assert.equal(Uint16Array.from([1, 2, 3]).byteLength, 6);

  assert.arrayEqual(Uint16Array.of(1, 2, 3), [1, 2, 3]);
  assert.equal(Uint16Array.of(1, 2, 3).byteLength, 6);

  var sample = new Uint16Array([1,2,3]);

  assert.ok(sample.every(function(n) { return n < 5; }));
  assert.ok(!sample.every(function(n) { return n < 2; }));

  assert.ok(sample.some(function(n) { return n === 2; }));
  assert.ok(!sample.some(function(n) { return n === 5; }));

  var sum = 0;
  sample.forEach(function(n) { sum += n; });
  assert.equal(sum, 6);

  var search = new Uint8Array([1, 2, 3, 1, 2, 3]);
  assert.equal(search.indexOf(0), -1);
  assert.equal(search.indexOf(1), 0);
  assert.equal(search.indexOf(2), 1);

  assert.equal(search.lastIndexOf(0), -1);
  assert.equal(search.lastIndexOf(1), 3);
  assert.equal(search.lastIndexOf(2), 4);

  assert.equal(sample.reduce(function(a, b) { return a / b; }), 1/6);
  assert.equal(sample.reduce(function(a, b) { return a + b; }, ''), '123');

  assert.equal(sample.reduceRight(function(a, b) { return a / b; }), 1.5);
  assert.equal(sample.reduceRight(function(a, b) { return a + b; }, ''), '321');

  assert.arrayEqual(sample.filter(function(n) { return n % 2; }), [1, 3]);
  assert.equal(sample.filter(function(n) { return n % 2; }).byteLength, 4);

  assert.arrayEqual(sample.map(function(n) { return n * 2; }), [2, 4, 6]);
  assert.equal(sample.map(function(n) { return n * 2; }).byteLength, 6);

  assert.arrayEqual(new Uint16Array([1,2,3]).reverse(), [3, 2, 1]);
  assert.arrayEqual(new Uint16Array([1,2,3,4]).reverse(), [4, 3, 2, 1]);

  assert.arrayEqual(new Uint16Array([4,3,2,1]).sort(), [1, 2, 3, 4]);
  assert.arrayEqual(new Uint16Array([1,2,3,4]).sort(function(a, b) { return b - a;}), [4, 3, 2, 1]);

  assert.arrayEqual(new Uint16Array([1,2,3,4]).fill(9), [9,9,9,9]);
  assert.arrayEqual(new Uint16Array([1,2,3,4]).fill(9, 2), [1,2,9,9]);
  assert.arrayEqual(new Uint16Array([1,2,3,4]).fill(9, 2, 3), [1,2,9,4]);

  assert.equal(sample.find(function(n) { return n > 2; }), 3);
  assert.equal(sample.find(function(n) { return n === 5; }), undefined);
  assert.equal(sample.findIndex(function(n) { return n > 2; }), 2);
  assert.equal(sample.findIndex(function(n) { return n === 5; }), -1);

  assert.equal(sample.join(), "1,2,3");
  assert.equal(sample.join(''), "123");

  assert.arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(3, 0, 2), [0,1,2,0,1]);
  assert.arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(0, 3), [3,4,2,3,4]);
  assert.arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(0, 2, 5), [2,3,4,3,4]);
  assert.arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(2, 0, 3), [0,1,0,1,2]);

  assert.arrayEqual(new Uint16Array([1,2,3,4]).slice(), [1,2,3,4]);
  assert.arrayEqual(new Uint16Array([1,2,3,4]).slice(2,4), [3,4]);
});
