
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


test('ArrayBuffer', 7, function () {
  var b;

  stricterEqual(new ArrayBuffer().byteLength, 0, 'no length');
  ok(b = new ArrayBuffer(0), 'creation');
  ok(b = new ArrayBuffer(1), 'creation');
  ok(b = new ArrayBuffer(123), 'creation');

  b = new ArrayBuffer(123);
  stricterEqual(b.byteLength, 123, 'length');

  raises(function () { return new ArrayBuffer(-1); }, RangeError, 'negative length');
  raises(function () { return new ArrayBuffer(0x80000000); }, RangeError, 'absurd length');
});


test('ArrayBufferView', 6, function () {
  var ab = new ArrayBuffer(48);
  var i32 = new Int32Array(ab, 16);
  i32.set([1, 2, 3, 4, 5, 6, 7, 8]);

  stricterEqual(i32.buffer, ab);
  stricterEqual(i32.byteOffset, 16);
  stricterEqual(i32.byteLength, 32);

  var da = new DataView(i32.buffer, 8);
  stricterEqual(da.buffer, ab);
  stricterEqual(da.byteOffset, 8);
  stricterEqual(da.byteLength, 40);
});


test('TypedArrays', 32, function () {
  var a;

  stricterEqual(Int8Array.BYTES_PER_ELEMENT, 1, 'Int8Array.BYTES_PER_ELEMENT');
  a = new Int8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 1);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 8);

  stricterEqual(Uint8Array.BYTES_PER_ELEMENT, 1, 'Uint8Array.BYTES_PER_ELEMENT');
  a = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 1);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 8);

  stricterEqual(Int16Array.BYTES_PER_ELEMENT, 2, 'Int16Array.BYTES_PER_ELEMENT');
  a = new Int16Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 2);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 16);

  stricterEqual(Uint16Array.BYTES_PER_ELEMENT, 2, 'Uint16Array.BYTES_PER_ELEMENT');
  a = new Uint16Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 2);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 16);

  stricterEqual(Int32Array.BYTES_PER_ELEMENT, 4, 'Int32Array.BYTES_PER_ELEMENT');
  a = new Int32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 4);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 32);

  stricterEqual(Uint32Array.BYTES_PER_ELEMENT, 4, 'Uint32Array.BYTES_PER_ELEMENT');
  a = new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 4);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 32);

  stricterEqual(Float32Array.BYTES_PER_ELEMENT, 4, 'Float32Array.BYTES_PER_ELEMENT');
  a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 4);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 32);

  stricterEqual(Float64Array.BYTES_PER_ELEMENT, 8, 'Float64Array.BYTES_PER_ELEMENT');
  a = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8]);
  stricterEqual(a.BYTES_PER_ELEMENT, 8);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 64);
});


test('typed array constructors', 45, function () {

  arrayEqual(new Int8Array({ length: 3 }), [0, 0, 0]);
  var rawbuf = (new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])).buffer;

  var int8 = new Int8Array();
  stricterEqual(int8.length, 0, 'no args');
  raises(function () { return new Int8Array(-1); }, /*Range*/Error, 'bogus length');
  raises(function () { return new Int8Array(0x80000000); }, /*Range*/Error, 'bogus length');

  int8 = new Int8Array(4);
  stricterEqual(int8.BYTES_PER_ELEMENT, 1);
  stricterEqual(int8.length, 4, 'length');
  stricterEqual(int8.byteLength, 4, 'length');
  stricterEqual(int8.byteOffset, 0, 'length');
  stricterEqual(int8.get(-1), undefined, 'length, out of bounds');
  stricterEqual(int8.get(4), undefined, 'length, out of bounds');

  int8 = new Int8Array([1, 2, 3, 4, 5, 6]);
  stricterEqual(int8.length, 6, 'array');
  stricterEqual(int8.byteLength, 6, 'array');
  stricterEqual(int8.byteOffset, 0, 'array');
  stricterEqual(int8.get(3), 4, 'array');
  stricterEqual(int8.get(-1), undefined, 'array, out of bounds');
  stricterEqual(int8.get(6), undefined, 'array, out of bounds');

  int8 = new Int8Array(rawbuf);
  stricterEqual(int8.length, 8, 'buffer');
  stricterEqual(int8.byteLength, 8, 'buffer');
  stricterEqual(int8.byteOffset, 0, 'buffer');
  stricterEqual(int8.get(7), 7, 'buffer');
  int8.set([111]);
  stricterEqual(int8.get(0), 111, 'buffer');
  stricterEqual(int8.get(-1), undefined, 'buffer, out of bounds');
  stricterEqual(int8.get(8), undefined, 'buffer, out of bounds');

  int8 = new Int8Array(rawbuf, 2);
  stricterEqual(int8.length, 6, 'buffer, byteOffset');
  stricterEqual(int8.byteLength, 6, 'buffer, byteOffset');
  stricterEqual(int8.byteOffset, 2, 'buffer, byteOffset');
  stricterEqual(int8.get(5), 7, 'buffer, byteOffset');
  int8.set([112]);
  stricterEqual(int8.get(0), 112, 'buffer');
  stricterEqual(int8.get(-1), undefined, 'buffer, byteOffset, out of bounds');
  stricterEqual(int8.get(6), undefined, 'buffer, byteOffset, out of bounds');

  int8 = new Int8Array(rawbuf, 8);
  stricterEqual(int8.length, 0, 'buffer, byteOffset');

  raises(function () { return new Int8Array(rawbuf, -1); }, 'invalid byteOffset');
  raises(function () { return new Int8Array(rawbuf, 9); }, 'invalid byteOffset');
  raises(function () { return new Int8Array(rawbuf, -1); }, 'invalid byteOffset');
  raises(function () { return new Int32Array(rawbuf, 5); }, 'invalid byteOffset');

  int8 = new Int8Array(rawbuf, 2, 4);
  stricterEqual(int8.length, 4, 'buffer, byteOffset, length');
  stricterEqual(int8.byteLength, 4, 'buffer, byteOffset, length');
  stricterEqual(int8.byteOffset, 2, 'buffer, byteOffset, length');
  stricterEqual(int8.get(3), 5, 'buffer, byteOffset, length');
  int8.set([113]);
  stricterEqual(int8.get(0), 113, 'buffer, byteOffset, length');
  stricterEqual(int8.get(-1), undefined, 'buffer, byteOffset, length, out of bounds');
  stricterEqual(int8.get(4), undefined, 'buffer, byteOffset, length, out of bounds');

  raises(function () { return new Int8Array(rawbuf, 0, 9); }, 'invalid byteOffset+length');
  raises(function () { return new Int8Array(rawbuf, 8, 1); }, 'invalid byteOffset+length');
  raises(function () { return new Int8Array(rawbuf, 9, -1); }, 'invalid byteOffset+length');
});


test('TypedArray clone constructor', 3, function () {
  var src = new Int32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  var dst = new Int32Array(src);
  arrayEqual(dst, [1, 2, 3, 4, 5, 6, 7, 8]);
  src.set([99]);
  arrayEqual(src, [99, 2, 3, 4, 5, 6, 7, 8]);
  arrayEqual(dst, [1, 2, 3, 4, 5, 6, 7, 8]);
});


test('conversions', 6, function () {
  var uint8 = new Uint8Array([1, 2, 3, 4]),
      uint16 = new Uint16Array(uint8.buffer),
      uint32 = new Uint32Array(uint8.buffer);

  // Note: can't probe individual bytes without endianness awareness
  arrayEqual(uint8, [1, 2, 3, 4]);
  uint16.set([0xffff]);
  arrayEqual(uint8, [0xff, 0xff, 3, 4]);
  uint16.set([0xeeee], 1);
  arrayEqual(uint8, [0xff, 0xff, 0xee, 0xee]);
  uint32.set([0x11111111]);
  stricterEqual(uint16.get(0), 0x1111);
  stricterEqual(uint16.get(1), 0x1111);
  arrayEqual(uint8, [0x11, 0x11, 0x11, 0x11]);
});


test('signed/unsigned conversions', 11, function () {

  var int8 = new Int8Array(1), uint8 = new Uint8Array(int8.buffer);
  uint8.set([123]);
  stricterEqual(int8.get(0), 123, 'int8/uint8');
  uint8.set([161]);
  stricterEqual(int8.get(0), -95, 'int8/uint8');
  int8.set([-120]);
  stricterEqual(uint8.get(0), 136, 'uint8/int8');
  int8.set([-1]);
  stricterEqual(uint8.get(0), 0xff, 'uint8/int8');

  var int16 = new Int16Array(1), uint16 = new Uint16Array(int16.buffer);
  uint16.set([3210]);
  stricterEqual(int16.get(0), 3210, 'int16/uint16');
  uint16.set([49232]);
  stricterEqual(int16.get(0), -16304, 'int16/uint16');
  int16.set([-16384]);
  stricterEqual(uint16.get(0), 49152, 'uint16/int16');
  int16.set([-1]);
  stricterEqual(uint16.get(0), 0xffff, 'uint16/int16');

  var int32 = new Int32Array(1), uint32 = new Uint32Array(int32.buffer);
  uint32.set([0x80706050]);
  stricterEqual(int32.get(0), -2140118960, 'int32/uint32');
  int32.set([-2023406815]);
  stricterEqual(uint32.get(0), 0x87654321, 'uint32/int32');
  int32.set([-1]);
  stricterEqual(uint32.get(0), 0xffffffff, 'uint32/int32');
});


test('IEEE754 single precision unpacking', function () {

  function fromBytes(bytes) {
    var uint8 = new Uint8Array(bytes),
        dv = new DataView(uint8.buffer);
    return dv.getFloat32(0);
  }

  stricterEqual(fromBytes([0xff, 0xff, 0xff, 0xff]), NaN, 'Q-NaN');
  stricterEqual(fromBytes([0xff, 0xc0, 0x00, 0x01]), NaN, 'Q-NaN');

  stricterEqual(fromBytes([0xff, 0xc0, 0x00, 0x00]), NaN, 'Indeterminate');

  stricterEqual(fromBytes([0xff, 0xbf, 0xff, 0xff]), NaN, 'S-NaN');
  stricterEqual(fromBytes([0xff, 0x80, 0x00, 0x01]), NaN, 'S-NaN');

  stricterEqual(fromBytes([0xff, 0x80, 0x00, 0x00]), -Infinity, '-Infinity');

  stricterEqual(fromBytes([0xff, 0x7f, 0xff, 0xff]), -3.4028234663852886E+38, '-Normalized');
  stricterEqual(fromBytes([0x80, 0x80, 0x00, 0x00]), -1.1754943508222875E-38, '-Normalized');
  stricterEqual(fromBytes([0xff, 0x7f, 0xff, 0xff]), -3.4028234663852886E+38, '-Normalized');
  stricterEqual(fromBytes([0x80, 0x80, 0x00, 0x00]), -1.1754943508222875E-38, '-Normalized');

  // TODO: Denormalized values fail on Safari on iOS/ARM
  stricterEqual(fromBytes([0x80, 0x7f, 0xff, 0xff]), -1.1754942106924411E-38, '-Denormalized');
  stricterEqual(fromBytes([0x80, 0x00, 0x00, 0x01]), -1.4012984643248170E-45, '-Denormalized');

  stricterEqual(fromBytes([0x80, 0x00, 0x00, 0x00]), -0, '-0');
  stricterEqual(fromBytes([0x00, 0x00, 0x00, 0x00]), +0, '+0');

  // TODO: Denormalized values fail on Safari on iOS/ARM
  stricterEqual(fromBytes([0x00, 0x00, 0x00, 0x01]), 1.4012984643248170E-45, '+Denormalized');
  stricterEqual(fromBytes([0x00, 0x7f, 0xff, 0xff]), 1.1754942106924411E-38, '+Denormalized');

  stricterEqual(fromBytes([0x00, 0x80, 0x00, 0x00]), 1.1754943508222875E-38, '+Normalized');
  stricterEqual(fromBytes([0x7f, 0x7f, 0xff, 0xff]), 3.4028234663852886E+38, '+Normalized');

  stricterEqual(fromBytes([0x7f, 0x80, 0x00, 0x00]), +Infinity, '+Infinity');

  stricterEqual(fromBytes([0x7f, 0x80, 0x00, 0x01]), NaN, 'S+NaN');
  stricterEqual(fromBytes([0x7f, 0xbf, 0xff, 0xff]), NaN, 'S+NaN');

  stricterEqual(fromBytes([0x7f, 0xc0, 0x00, 0x00]), NaN, 'Q+NaN');
  stricterEqual(fromBytes([0x7f, 0xff, 0xff, 0xff]), NaN, 'Q+NaN');
});


test('IEEE754 single precision packing', function () {

  function toBytes(v) {
    var uint8 = new Uint8Array(4), dv = new DataView(uint8.buffer);
    dv.setFloat32(0, v);
    var bytes = [];
    for (var i = 0; i < 4; i += 1) {
      bytes.push(uint8.get(i));
    }
    return bytes;
  }

  deepEqual(toBytes(-Infinity), [0xff, 0x80, 0x00, 0x00], '-Infinity');

  deepEqual(toBytes(-3.4028235677973366e+38), [0xff, 0x80, 0x00, 0x00], '-Overflow');
  deepEqual(toBytes(-3.402824E+38), [0xff, 0x80, 0x00, 0x00], '-Overflow');

  deepEqual(toBytes(-3.4028234663852886E+38), [0xff, 0x7f, 0xff, 0xff], '-Normalized');
  deepEqual(toBytes(-1.1754943508222875E-38), [0x80, 0x80, 0x00, 0x00], '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  deepEqual(toBytes(-1.1754942106924411E-38), [0x80, 0x7f, 0xff, 0xff], '-Denormalized');
  deepEqual(toBytes(-1.4012984643248170E-45), [0x80, 0x00, 0x00, 0x01], '-Denormalized');

  deepEqual(toBytes(-7.006492321624085e-46), [0x80, 0x00, 0x00, 0x00], '-Underflow');

  deepEqual(toBytes(-0), [0x80, 0x00, 0x00, 0x00], '-0');
  deepEqual(toBytes(0), [0x00, 0x00, 0x00, 0x00], '+0');

  deepEqual(toBytes(7.006492321624085e-46), [0x00, 0x00, 0x00, 0x00], '+Underflow');

  // TODO: Denormalized values fail on Safari iOS/ARM
  deepEqual(toBytes(1.4012984643248170E-45), [0x00, 0x00, 0x00, 0x01], '+Denormalized');
  deepEqual(toBytes(1.1754942106924411E-38), [0x00, 0x7f, 0xff, 0xff], '+Denormalized');

  deepEqual(toBytes(1.1754943508222875E-38), [0x00, 0x80, 0x00, 0x00], '+Normalized');
  deepEqual(toBytes(3.4028234663852886E+38), [0x7f, 0x7f, 0xff, 0xff], '+Normalized');

  deepEqual(toBytes(+3.402824E+38), [0x7f, 0x80, 0x00, 0x00], '+Overflow');
  deepEqual(toBytes(+3.402824E+38), [0x7f, 0x80, 0x00, 0x00], '+Overflow');
  deepEqual(toBytes(+Infinity), [0x7f, 0x80, 0x00, 0x00], '+Infinity');

  // Allow any NaN pattern (exponent all 1's, fraction non-zero)
  var nanbytes = toBytes(NaN),
      sign = extractbits(nanbytes, 31, 31),
      exponent = extractbits(nanbytes, 23, 30),
      fraction = extractbits(nanbytes, 0, 22);
  ok(exponent === 255 && fraction !== 0, 'NaN');
});


test('IEEE754 double precision unpacking', function () {

  function fromBytes(bytes) {
    var uint8 = new Uint8Array(bytes),
        dv = new DataView(uint8.buffer);
    return dv.getFloat64(0);
  }

  stricterEqual(fromBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'Q-NaN');
  stricterEqual(fromBytes([0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'Q-NaN');

  stricterEqual(fromBytes([0xff, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), NaN, 'Indeterminate');

  stricterEqual(fromBytes([0xff, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'S-NaN');
  stricterEqual(fromBytes([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'S-NaN');

  stricterEqual(fromBytes([0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -Infinity, '-Infinity');

  stricterEqual(fromBytes([0xff, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), -1.7976931348623157E+308, '-Normalized');
  stricterEqual(fromBytes([0x80, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -2.2250738585072014E-308, '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  stricterEqual(fromBytes([0x80, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), -2.2250738585072010E-308, '-Denormalized');
  stricterEqual(fromBytes([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), -4.9406564584124654E-324, '-Denormalized');

  stricterEqual(fromBytes([0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), -0, '-0');
  stricterEqual(fromBytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), +0, '+0');

  // TODO: Denormalized values fail on Safari iOS/ARM
  stricterEqual(fromBytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), 4.9406564584124654E-324, '+Denormalized');
  stricterEqual(fromBytes([0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 2.2250738585072010E-308, '+Denormalized');

  stricterEqual(fromBytes([0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 2.2250738585072014E-308, '+Normalized');
  stricterEqual(fromBytes([0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), 1.7976931348623157E+308, '+Normalized');

  stricterEqual(fromBytes([0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), +Infinity, '+Infinity');

  stricterEqual(fromBytes([0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]), NaN, 'S+NaN');
  stricterEqual(fromBytes([0x7f, 0xf7, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'S+NaN');

  stricterEqual(fromBytes([0x7f, 0xf8, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), NaN, 'Q+NaN');
  stricterEqual(fromBytes([0x7f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]), NaN, 'Q+NaN');
});


test('IEEE754 double precision packing', function () {

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

  deepEqual(toBytes(-Infinity), [0xff, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-Infinity');

  deepEqual(toBytes(-1.7976931348623157E+308), [0xff, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '-Normalized');
  deepEqual(toBytes(-2.2250738585072014E-308), [0x80, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-Normalized');

  // TODO: Denormalized values fail on Safari iOS/ARM
  deepEqual(toBytes(-2.2250738585072010E-308), [0x80, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '-Denormalized');
  deepEqual(toBytes(-4.9406564584124654E-324), [0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], '-Denormalized');

  deepEqual(toBytes(-0), [0x80, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '-0');
  deepEqual(toBytes(0), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+0');

  // TODO: Denormalized values fail on Safari iOS/ARM
  deepEqual(toBytes(4.9406564584124654E-324), [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01], '+Denormalized');
  deepEqual(toBytes(2.2250738585072010E-308), [0x00, 0x0f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '+Denormalized');

  deepEqual(toBytes(2.2250738585072014E-308), [0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+Normalized');
  deepEqual(toBytes(1.7976931348623157E+308), [0x7f, 0xef, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff], '+Normalized');

  deepEqual(toBytes(+Infinity), [0x7f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], '+Infinity');

  // Allow any NaN pattern (exponent all 1's, fraction non-zero)
  var nanbytes = toBytes(NaN),
      sign = extractbits(nanbytes, 63, 63),
      exponent = extractbits(nanbytes, 52, 62),
      fraction = extractbits(nanbytes, 0, 51);
  ok(exponent === 2047 && fraction !== 0, 'NaN');
});


test('Int32Array round trips', 9, function () {
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
    stricterEqual(datum, i32.get(0), String(datum));
  }
});


test('Int16Array round trips', 9, function () {
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
    stricterEqual(datum, i16.get(0), String(datum));
  }
});


test('Int8Array round trips', 9, function () {
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
    stricterEqual(datum, i8.get(0), String(datum));
  }
});


test('IEEE754 single precision round trips', 24, function () {

  var f32 = new Float32Array([0]);

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
    stricterEqual(single(datum), single(f32.get(0)), 'value: ' + String(datum));
  }
});


test('IEEE754 double precision round trips', 24, function () {

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
    stricterEqual(datum, f64.get(0), String(datum));
  }
});


test('TypedArray setting', 8, function () {

  var a = new Int32Array([1, 2, 3, 4, 5]);
  var b = new Int32Array(5);
  b.set(a);
  arrayEqual(b, [1, 2, 3, 4, 5]);
  raises(function () { b.set(a, 1); });

  b.set(new Int32Array([99, 98]), 2);
  arrayEqual(b, [1, 2, 99, 98, 5]);

  b.set(new Int32Array([99, 98, 97]), 2);
  arrayEqual(b, [1, 2, 99, 98, 97]);

  raises(function () { b.set(new Int32Array([99, 98, 97, 96]), 2); });
  raises(function () { b.set([101, 102, 103, 104], 4); });

  //  ab = [ 0, 1, 2, 3, 4, 5, 6, 7 ]
  //  a1 = [ ^, ^, ^, ^, ^, ^, ^, ^ ]
  //  a2 =             [ ^, ^, ^, ^ ]
  var ab = new ArrayBuffer(8);
  var a1 = new Uint8Array(ab);
  for (var i = 0; i < a1.length; i += 1) { a1.set([i], i); }
  var a2 = new Uint8Array(ab, 4);
  a1.set(a2, 2);
  arrayEqual(a1, [0, 1, 4, 5, 6, 7, 6, 7]);
  arrayEqual(a2, [6, 7, 6, 7]);
});


test('TypedArray.subarray', 10, function () {

  var a = new Int32Array([1, 2, 3, 4, 5]);
  arrayEqual(a.subarray(3), [4, 5]);
  arrayEqual(a.subarray(1, 3), [2, 3]);
  arrayEqual(a.subarray(-3), [3, 4, 5]);
  arrayEqual(a.subarray(-3, -1), [3, 4]);
  arrayEqual(a.subarray(3, 2), []);
  arrayEqual(a.subarray(-2, -3), []);
  arrayEqual(a.subarray(4, 1), []);
  arrayEqual(a.subarray(-1, -4), []);
  arrayEqual(a.subarray(1).subarray(1), [3, 4, 5]);
  arrayEqual(a.subarray(1, 4).subarray(1, 2), [3]);
});


test('DataView constructors', 6, function () {

  var d = new DataView(new ArrayBuffer(8));

  d.setUint32(0, 0x12345678);
  stricterEqual(d.getUint32(0), 0x12345678, isDOMException, 'big endian/big endian');

  d.setUint32(0, 0x12345678, true);
  stricterEqual(d.getUint32(0, true), 0x12345678, 'little endian/little endian');

  d.setUint32(0, 0x12345678, true);
  stricterEqual(d.getUint32(0), 0x78563412, 'little endian/big endian');

  d.setUint32(0, 0x12345678);
  stricterEqual(d.getUint32(0, true), 0x78563412, 'big endian/little endian');

  // Chrome allows no arguments, throws if non-ArrayBuffer
  //stricterEqual(new DataView().buffer.byteLength, 0, 'no arguments');

  // Safari (iOS 5) does not
  //raises(function () { return new DataView(); }, TypeError, 'no arguments');

  // Chrome raises TypeError, Safari iOS5 raises isDOMException(INDEX_SIZE_ERR)
  raises(function () { return new DataView({}); }, 'non-ArrayBuffer argument');

  raises(function () { return new DataView("bogus"); }, TypeError, 'non-ArrayBuffer argument');
});


test('DataView accessors', 17, function () {
  var u = new Uint8Array(8), d = new DataView(u.buffer);
  arrayEqual(u, [0, 0, 0, 0, 0, 0, 0, 0]);

  d.setUint8(0, 255);
  arrayEqual(u, [0xff, 0, 0, 0, 0, 0, 0, 0]);

  d.setInt8(1, -1);
  arrayEqual(u, [0xff, 0xff, 0, 0, 0, 0, 0, 0]);

  d.setUint16(2, 0x1234);
  arrayEqual(u, [0xff, 0xff, 0x12, 0x34, 0, 0, 0, 0]);

  d.setInt16(4, -1);
  arrayEqual(u, [0xff, 0xff, 0x12, 0x34, 0xff, 0xff, 0, 0]);

  d.setUint32(1, 0x12345678);
  arrayEqual(u, [0xff, 0x12, 0x34, 0x56, 0x78, 0xff, 0, 0]);

  d.setInt32(4, -2023406815);
  arrayEqual(u, [0xff, 0x12, 0x34, 0x56, 0x87, 0x65, 0x43, 0x21]);

  d.setFloat32(2, 1.2E+38);
  arrayEqual(u, [0xff, 0x12, 0x7e, 0xb4, 0x8e, 0x52, 0x43, 0x21]);

  d.setFloat64(0, -1.2345678E+301);
  arrayEqual(u, [0xfe, 0x72, 0x6f, 0x51, 0x5f, 0x61, 0x77, 0xe5]);

  u.set([0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87]);
  stricterEqual(d.getUint8(0), 128);
  stricterEqual(d.getInt8(1), -127);
  stricterEqual(d.getUint16(2), 33411);
  stricterEqual(d.getInt16(3), -31868);
  stricterEqual(d.getUint32(4), 2223343239);
  stricterEqual(d.getInt32(2), -2105310075);
  stricterEqual(d.getFloat32(2), -1.932478247535851e-37);
  stricterEqual(d.getFloat64(0), -3.116851295377095e-306);

});


test('DataView endian', 27, function () {
  var rawbuf = (new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])).buffer;
  var d;

  d = new DataView(rawbuf);
  stricterEqual(d.byteLength, 8, 'buffer');
  stricterEqual(d.byteOffset, 0, 'buffer');
  raises(function () { d.getUint8(-2); }); // Chrome bug for index -, DOMException, 'bounds for buffer'?
  raises(function () { d.getUint8(8); }, 'bounds for buffer');
  raises(function () { d.setUint8(-2, 0); }, 'bounds for buffer');
  raises(function () { d.setUint8(8, 0); }, 'bounds for buffer');

  d = new DataView(rawbuf, 2);
  stricterEqual(d.byteLength, 6, 'buffer, byteOffset');
  stricterEqual(d.byteOffset, 2, 'buffer, byteOffset');
  stricterEqual(d.getUint8(5), 7, 'buffer, byteOffset');
  raises(function () { d.getUint8(-2); }, 'bounds for buffer, byteOffset');
  raises(function () { d.getUint8(6); }, 'bounds for buffer, byteOffset');
  raises(function () { d.setUint8(-2, 0); }, 'bounds for buffer, byteOffset');
  raises(function () { d.setUint8(6, 0); }, 'bounds for buffer, byteOffset');

  d = new DataView(rawbuf, 8);
  stricterEqual(d.byteLength, 0, 'buffer, byteOffset');

  raises(function () { return new DataView(rawbuf, -1); }, 'invalid byteOffset');
  raises(function () { return new DataView(rawbuf, 9); }, 'invalid byteOffset');
  raises(function () { return new DataView(rawbuf, -1); }, 'invalid byteOffset');

  d = new DataView(rawbuf, 2, 4);
  stricterEqual(d.byteLength, 4, 'buffer, byteOffset, length');
  stricterEqual(d.byteOffset, 2, 'buffer, byteOffset, length');
  stricterEqual(d.getUint8(3), 5, 'buffer, byteOffset, length');
  raises(function () { return d.getUint8(-2); }, 'bounds for buffer, byteOffset, length');
  raises(function () { d.getUint8(4); }, 'bounds for buffer, byteOffset, length');
  raises(function () { d.setUint8(-2, 0); }, 'bounds for buffer, byteOffset, length');
  raises(function () { d.setUint8(4, 0); }, 'bounds for buffer, byteOffset, length');

  raises(function () { return new DataView(rawbuf, 0, 9); }, 'invalid byteOffset+length');
  raises(function () { return new DataView(rawbuf, 8, 1); }, 'invalid byteOffset+length');
  raises(function () { return new DataView(rawbuf, 9, -1); }, 'invalid byteOffset+length');
});


test('Typed Array getters/setters', function () {
  // Only supported if Object.defineProperty() is fully supported on non-DOM objects.
  try {
    var o = {};
    Object.defineProperty(o, 'x', { get: function() { return 1; } });
    if (o.x !== 1) throw Error();
  } catch (_) {
    ok(true);
    return;
  }

  var bytes = new Uint8Array([1, 2, 3, 4]),
      uint32s = new Uint32Array(bytes.buffer);

  stricterEqual(bytes[1], 2);
  uint32s[0] = 0xffffffff;
  stricterEqual(bytes[1], 0xff);
});

test('Uint8ClampedArray', 5, function () {
  stricterEqual(Uint8ClampedArray.BYTES_PER_ELEMENT, 1, 'Uint8ClampedArray.BYTES_PER_ELEMENT');
  var a = new Uint8ClampedArray([-Infinity, -Number.MAX_VALUE, -1, -Number.MIN_VALUE, -0,
                                 0, Number.MIN_VALUE, 1, 1.1, 1.9, 255, 255.1, 255.9, 256, Number.MAX_VALUE, Infinity,
                                 NaN]);
  stricterEqual(a.BYTES_PER_ELEMENT, 1);
  stricterEqual(a.byteOffset, 0);
  stricterEqual(a.byteLength, 17);
  arrayEqual(a, [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0]);
});

test('Regression Tests', function() {
  // Bug: https://github.com/inexorabletash/polyfill/issues/16
  var minFloat32 = 1.401298464324817e-45;
  var truncated = new Float32Array([-minFloat32 / 2 - Math.pow(2, -202)]).get(0);
  stricterEqual(truncated, -minFloat32, 'smallest 32 bit float should not truncate to zero');
});

test('ES6 Typed Array Extras', function() {
  arrayEqual(Uint16Array.from([1, 2, 3]), [1, 2, 3]);
  equal(Uint16Array.from([1, 2, 3]).byteLength, 6);

  arrayEqual(Uint16Array.of(1, 2, 3), [1, 2, 3]);
  equal(Uint16Array.of(1, 2, 3).byteLength, 6);

  var sample = new Uint16Array([1,2,3]);

  ok(sample.every(function(n) { return n < 5; }));
  ok(!sample.every(function(n) { return n < 2; }));

  ok(sample.some(function(n) { return n === 2; }));
  ok(!sample.some(function(n) { return n === 5; }));

  var sum = 0;
  sample.forEach(function(n) { sum += n; });
  equal(sum, 6);

  var search = new Uint8Array([1, 2, 3, 1, 2, 3]);
  equal(search.indexOf(0), -1);
  equal(search.indexOf(1), 0);
  equal(search.indexOf(2), 1);

  equal(search.lastIndexOf(0), -1);
  equal(search.lastIndexOf(1), 3);
  equal(search.lastIndexOf(2), 4);

  equal(sample.reduce(function(a, b) { return a / b; }), 1/6);
  equal(sample.reduce(function(a, b) { return a + b; }, ''), '123');

  equal(sample.reduceRight(function(a, b) { return a / b; }), 1.5);
  equal(sample.reduceRight(function(a, b) { return a + b; }, ''), '321');

  arrayEqual(sample.filter(function(n) { return n % 2; }), [1, 3]);
  equal(sample.filter(function(n) { return n % 2; }).byteLength, 4);

  arrayEqual(sample.map(function(n) { return n * 2; }), [2, 4, 6]);
  equal(sample.map(function(n) { return n * 2; }).byteLength, 6);

  arrayEqual(new Uint16Array([1,2,3]).reverse(), [3, 2, 1]);
  arrayEqual(new Uint16Array([1,2,3,4]).reverse(), [4, 3, 2, 1]);

  arrayEqual(new Uint16Array([4,3,2,1]).sort(), [1, 2, 3, 4]);
  arrayEqual(new Uint16Array([1,2,3,4]).sort(function(a, b) { return b - a;}), [4, 3, 2, 1]);

  arrayEqual(new Uint16Array([1,2,3,4]).fill(9), [9,9,9,9]);
  arrayEqual(new Uint16Array([1,2,3,4]).fill(9, 2), [1,2,9,9]);
  arrayEqual(new Uint16Array([1,2,3,4]).fill(9, 2, 3), [1,2,9,4]);

  equal(sample.find(function(n) { return n > 2; }), 3);
  equal(sample.find(function(n) { return n === 5; }), undefined);
  equal(sample.findIndex(function(n) { return n > 2; }), 2);
  equal(sample.findIndex(function(n) { return n === 5; }), -1);

  equal(sample.join(), "1,2,3");
  equal(sample.join(''), "123");

  arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(3, 0, 2), [0,1,2,0,1]);
  arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(0, 3), [3,4,2,3,4]);
  arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(0, 2, 5), [2,3,4,3,4]);
  arrayEqual(new Uint16Array([0,1,2,3,4]).copyWithin(2, 0, 3), [0,1,0,1,2]);

  arrayEqual(new Uint16Array([1,2,3,4]).slice(), [1,2,3,4]);
  arrayEqual(new Uint16Array([1,2,3,4]).slice(2,4), [3,4]);
});
