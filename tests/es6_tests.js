function verifyIterator(iterator, expected) {
  while (true) {
    var result = iterator.next();
    if (result.done) {
      ok(expected.length === 0, 'Iterator completed as expected');
      return;
    } else {
      var ex = expected.shift();
      equal(result.done, false, 'Iterator still going');
      deepEqual(result.value, ex, 'Iterator had expected: ' + ex);
    }
  }
}

test("Native implementations", function () {
  function isNative(t) {
    return String(eval(t)).indexOf('[native code]') !== -1;
  }
  function negate(f) { return function(x) { return !f(x); }; }

  var functions = [
    'Symbol',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Promise',
    'Reflect',

    'ArrayBuffer.isView',
    'Object.getOwnPropertyNames',
    'Object.getOwnPropertySymbols',
    'Object.keys',
    'Array.from',
    'Array.of',
    'Array.prototype.copyWithin',
    'Array.prototype.entries',
    'Array.prototype.fill',
    'Array.prototype.find',
    'Array.prototype.findIndex',
    'Array.prototype.keys',
    'Array.prototype.values',
    'Math.acosh',
    'Math.asinh',
    'Math.atanh',
    'Math.cbrt',
    'Math.clz32',
    'Math.cosh',
    'Math.expm1',
    'Math.fround',
    'Math.hypot',
    'Math.imul',
    'Math.log10',
    'Math.log1p',
    'Math.log2',
    'Math.sign',
    'Math.sinh',
    'Math.tanh',
    'Math.trunc',
    'Number.isFinite',
    'Number.isInteger',
    'Number.isNaN',
    'Number.isSafeInteger',
    'Number.parseFloat',
    'Number.parseInt',
    'Object.assign',
    'Object.is',
    'Object.setPrototypeOf',
    'String.fromCodePoint',
    'String.raw',
    'String.prototype.codePointAt',
    'String.prototype.includes',
    'String.prototype.endsWith',
    'String.prototype.repeat',
    'String.prototype.startsWith'
  ];

  var nativeFunctions = functions.filter(isNative);
  var polyfilledFunctions = functions.filter(negate(isNative));

  ok(nativeFunctions.length === 0,
     'Native implementations of the following functions exist, so the ' +
     'test results below do not reflect the behavior of the polyfill:\n' +
     nativeFunctions.join(' '));
  ok(true,
     'The following lack native implementations, so the polyfills are tested:\n' +
     polyfilledFunctions.join(' '));
});


module("Extras");

test("Math", function () {
  var EPSILON = 1e-5;

  // log10(x)
  assertEqual("Math.log10('')", Math.log10(0));
  assertEqual("Math.log10(NaN)", NaN);
  assertEqual("Math.log10(-1)", NaN);
  assertEqual("Math.log10(+0)", -Infinity);
  assertEqual("Math.log10(-0)", -Infinity);
  assertEqual("Math.log10(1)", +0);
  assertEqual("Math.log10(+Infinity)", +Infinity);

  assertEpsilon("Math.log10(0.5)", -0.30103, EPSILON);
  assertEpsilon("Math.log10(1.5)", 0.176091, EPSILON);

  // log2(x)
  assertEqual("Math.log2('')", Math.log2(0));
  assertEqual("Math.log2(NaN)", NaN);
  assertEqual("Math.log2(-1)", NaN);
  assertEqual("Math.log2(+0)", -Infinity);
  assertEqual("Math.log2(-0)", -Infinity);
  assertEqual("Math.log2(1)", +0);
  assertEqual("Math.log2(+Infinity)", +Infinity);

  assertEpsilon("Math.log2(0.5)", -1, EPSILON);
  assertEpsilon("Math.log2(1.5)", 0.584963, EPSILON);

  // log1p
  assertEqual("Math.log1p('')", Math.log1p(0));
  assertEqual("Math.log1p(NaN)", NaN);
  assertEqual("Math.log1p(-2)", NaN);
  assertEqual("Math.log1p(-1)", -Infinity);
  assertEqual("Math.log1p(+0)", +0);
  assertEqual("Math.log1p(-0)", -0);
  assertEqual("Math.log1p(+Infinity)", +Infinity);

  assertEpsilon("Math.log1p(0.5)", 0.405465, EPSILON);
  assertEpsilon("Math.log1p(-0.5)", -0.693147, EPSILON);
  assertEpsilon("Math.log1p(1.5)", 0.916291, EPSILON);
  // tests from: http://www.johndcook.com/cpp_expm1.html
  assertEpsilon("Math.log1p(-0.632120558828558)", -1, EPSILON);
  assertEpsilon("Math.log1p(0.0)", 0.0, EPSILON);
  assertEpsilon("Math.log1p(0.000009990049900216168)", 1e-5 - 1e-8, EPSILON);
  assertEpsilon("Math.log1p(0.00001001005010021717)", 1e-5 + 1e-8, EPSILON);
  assertEpsilon("Math.log1p(0.6487212707001282)", 0.5, EPSILON);

  // exp1m
  assertEqual("Math.expm1('')", Math.expm1(0));
  assertEqual("Math.expm1(NaN)", NaN);
  assertEqual("Math.expm1(+0)", +0);
  assertEqual("Math.expm1(-0)", -0);
  assertEqual("Math.expm1(+Infinity)", +Infinity);
  assertEqual("Math.expm1(-Infinity)", -1);

  assertEpsilon("Math.expm1(0.5)", 0.648721, EPSILON);
  assertEpsilon("Math.expm1(-0.5)", -0.393469, EPSILON);
  assertEpsilon("Math.expm1(1.5)", 3.48169, EPSILON);
  // tests from: http://www.johndcook.com/cpp_expm1.html
  assertEpsilon("Math.expm1(-1)", -0.632120558828558, EPSILON);
  assertEpsilon("Math.expm1(0.0)", 0.0, EPSILON);
  assertEpsilon("Math.expm1(1e-5 - 1e-8)", 0.000009990049900216168, EPSILON);
  assertEpsilon("Math.expm1(1e-5 + 1e-8)", 0.00001001005010021717, EPSILON);
  assertEpsilon("Math.expm1(0.5)", 0.6487212707001282, EPSILON);

  // cosh(x)
  assertEqual("Math.cosh('')", Math.cosh(0));
  assertEqual("Math.cosh(NaN)", NaN);
  assertEqual("Math.cosh(+0)", 1);
  assertEqual("Math.cosh(-0)", 1);
  assertEqual("Math.cosh(+Infinity)", +Infinity);
  assertEqual("Math.cosh(-Infinity)", +Infinity);
  assertEpsilon("Math.cosh(0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(-0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(1.5)", 2.35241, EPSILON);

  // sinh(x)
  assertEqual("Math.sinh('')", Math.sinh(0));
  assertEqual("Math.sinh(NaN)", NaN);
  assertEqual("Math.sinh(+0)", +0);
  assertEqual("Math.sinh(-0)", -0);
  assertEqual("Math.sinh(+Infinity)", +Infinity);
  assertEqual("Math.sinh(-Infinity)", -Infinity);
  assertEpsilon("Math.sinh(0.5)", 0.521095, EPSILON);
  assertEpsilon("Math.sinh(-0.5)", -0.521095, EPSILON);
  assertEpsilon("Math.sinh(1.5)", 2.12928, EPSILON);

  // tanh(x)
  assertEqual("Math.tanh('')", Math.tanh(0));
  assertEqual("Math.tanh(NaN)", NaN);
  assertEqual("Math.tanh(+0)", +0);
  assertEqual("Math.tanh(-0)", -0);
  assertEqual("Math.tanh(+Infinity)", +1);
  assertEqual("Math.tanh(-Infinity)", -1);
  assertEpsilon("Math.tanh(0.5)", 0.462117, EPSILON);
  assertEpsilon("Math.tanh(-0.5)", -0.462117, EPSILON);
  assertEpsilon("Math.tanh(1.5)", 0.905148, EPSILON);

  // acosh(x)
  assertEqual("Math.acosh('')", Math.acosh(0));
  assertEqual("Math.acosh(NaN)", NaN);
  assertEqual("Math.acosh(-1)", NaN);
  assertEqual("Math.acosh(1)", +0);
  assertEqual("Math.acosh(+Infinity)", +Infinity);
  assertEpsilon("Math.acosh(1.5)", 0.962424, EPSILON);

  // asinh(x)
  assertEqual("Math.asinh('')", Math.asinh(0));
  assertEqual("Math.asinh(NaN)", NaN);
  assertEqual("Math.asinh(+0)", +0);
  assertEqual("Math.asinh(-0)", -0);
  assertEqual("Math.asinh(+Infinity)", +Infinity);
  assertEqual("Math.asinh(-Infinity)", -Infinity);
  assertEpsilon("Math.asinh(0.5)", 0.481212, EPSILON);
  assertEpsilon("Math.asinh(-0.5)", -0.481212, EPSILON);
  assertEpsilon("Math.asinh(1.5)", 1.19476, EPSILON);

  // atanh(x)
  assertEqual("Math.atanh('')", Math.atanh(0));
  assertEqual("Math.atanh(NaN)", NaN);
  assertEqual("Math.atanh(-2)", NaN);
  assertEqual("Math.atanh(+2)", NaN);
  assertEqual("Math.atanh(-1)", -Infinity);
  assertEqual("Math.atanh(+1)", +Infinity);
  assertEqual("Math.atanh(+0)", +0);
  assertEqual("Math.atanh(-0)", -0);
  assertEpsilon("Math.atanh(0.5)", 0.549306, EPSILON);
  assertEpsilon("Math.atanh(-0.5)", -0.549306, EPSILON);

  // hypot(x)
  assertEqual("Math.hypot('', 0)", Math.hypot(0, 0));
  assertEqual("Math.hypot(0, '')", Math.hypot(0, 0));
  assertEqual("Math.hypot(+Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(-Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(0, +Infinity)", +Infinity);
  assertEqual("Math.hypot(0, -Infinity)", +Infinity);
  assertEqual("Math.hypot(Infinity, NaN)", +Infinity);
  assertEqual("Math.hypot(NaN, -Infinity)", +Infinity);
  assertEqual("Math.hypot(NaN, 0)", NaN);
  assertEqual("Math.hypot(0, NaN)", NaN);
  assertEqual("Math.hypot(+0, -0)", +0);
  assertEqual("Math.hypot(+0, +0)", +0);
  assertEqual("Math.hypot(-0, -0)", +0);
  assertEqual("Math.hypot(-0, +0)", +0);
  assertEqual("Math.hypot(+0, +1)", +1);
  assertEqual("Math.hypot(+0, -1)", +1);
  assertEqual("Math.hypot(-0, +1)", +1);
  assertEqual("Math.hypot(-0, -1)", +1);
  assertEqual("Math.hypot(0)", 0);
  assertEqual("Math.hypot(1)", 1);
  assertEqual("Math.hypot(2)", 2);
  assertEqual("Math.hypot(0,0,1)", 1);
  assertEqual("Math.hypot(0,1,0)", 1);
  assertEqual("Math.hypot(1,0,0)", 1);
  assertEqual("Math.hypot(2,3,4)", Math.sqrt(2*2 + 3*3 + 4*4));
  assertEqual("Math.hypot(2,3,4,5)", Math.sqrt(2*2 + 3*3 + 4*4 + 5*5));
  assertEqual("Math.hypot(1e+300, 1e+300)", 1.4142135623730952e+300);
  assertEqual("Math.hypot(1e+300, 1e+300, 1e+300)", 1.7320508075688774e+300);
  assertEqual("Math.hypot(1e-300, 1e-300)", 1.4142135623730952e-300);
  assertEqual("Math.hypot(1e-300, 1e-300, 1e-300)", 1.7320508075688774e-300);
  c = 0;
  assertEqual("Math.hypot({valueOf:function() { if (c++) throw c; return c; }})", 1);
  delete c;

  // trunc(x)
  assertEqual("Math.trunc('')", Math.trunc(0));
  assertEqual("Math.trunc(NaN)", NaN);
  assertEqual("Math.trunc(-0)", -0);
  assertEqual("Math.trunc(+0)", +0);
  assertEqual("Math.trunc(+Infinity)", +Infinity);
  assertEqual("Math.trunc(-Infinity)", -Infinity);
  assertEqual("Math.trunc(-2)", -2);
  assertEqual("Math.trunc(-1.5)", -1);
  assertEqual("Math.trunc(-1)", -1);
  assertEqual("Math.trunc(-0.5)", -0);
  assertEqual("Math.trunc(0)", 0);
  assertEqual("Math.trunc(0.5)", 0);
  assertEqual("Math.trunc(1)", 1);
  assertEqual("Math.trunc(1.5)", 1);
  assertEqual("Math.trunc(2)", 2);

  // sign(x)
  assertEqual("Math.sign('')", Math.sign(0));
  assertEqual("Math.sign(NaN)", NaN);
  assertEqual("Math.sign(-0)", -0);
  assertEqual("Math.sign(+0)", +0);
  assertEqual("Math.sign(-2)", -1);
  assertEqual("Math.sign(+2)", +1);

  // cbrt(x)
  assertEqual("Math.cbrt('')", Math.cbrt(0));
  assertEqual("Math.cbrt(NaN)", NaN);
  assertEqual("Math.cbrt(+0)", +0);
  assertEqual("Math.cbrt(-0)", -0);
  assertEqual("Math.cbrt(+Infinity)", +Infinity);
  assertEqual("Math.cbrt(-Infinity)", -Infinity);
  assertEqual("Math.cbrt(-1)", -1);
  assertEqual("Math.cbrt(1)", 1);
  assertEqual("Math.cbrt(-27)", -3);
  assertEqual("Math.cbrt(27)", 3);

  // imul(x,y)
  assertEqual("Math.imul(0,0)", 0);
  assertEqual("Math.imul(123,456)", 56088);
  assertEqual("Math.imul(-123,456)", -56088);
  assertEqual("Math.imul(123,-456)", -56088);
  assertEqual("Math.imul(0x01234567, 0xfedcba98)", 602016552);


  // Number.prototype.clz()
  assertEqual("Math.clz32(-1)", 0);
  assertEqual("Math.clz32(0xffffffff)", 0);
  assertEqual("Math.clz32(0x80000000)", 0);
  assertEqual("Math.clz32(1<<31)", 0);
  assertEqual("Math.clz32(1<<30)", 1);
  assertEqual("Math.clz32(1<<29)", 2);
  assertEqual("Math.clz32(1<<28)", 3);
  assertEqual("Math.clz32(1<<27)", 4);
  assertEqual("Math.clz32(1<<26)", 5);
  assertEqual("Math.clz32(1<<25)", 6);
  assertEqual("Math.clz32(1<<24)", 7);
  assertEqual("Math.clz32(1<<23)", 8);
  assertEqual("Math.clz32(1<<22)", 9);
  assertEqual("Math.clz32(1<<21)", 10);
  assertEqual("Math.clz32(1<<20)", 11);
  assertEqual("Math.clz32(1<<19)", 12);
  assertEqual("Math.clz32(1<<18)", 13);
  assertEqual("Math.clz32(1<<17)", 14);
  assertEqual("Math.clz32(1<<16)", 15);
  assertEqual("Math.clz32(1<<15)", 16);
  assertEqual("Math.clz32(1<<14)", 17);
  assertEqual("Math.clz32(1<<13)", 18);
  assertEqual("Math.clz32(1<<12)", 19);
  assertEqual("Math.clz32(1<<11)", 20);
  assertEqual("Math.clz32(1<<10)", 21);
  assertEqual("Math.clz32(1<<9)", 22);
  assertEqual("Math.clz32(1<<8)", 23);
  assertEqual("Math.clz32(1<<7)", 24);
  assertEqual("Math.clz32(1<<6)", 25);
  assertEqual("Math.clz32(1<<5)", 26);
  assertEqual("Math.clz32(1<<4)", 27);
  assertEqual("Math.clz32(1<<3)", 28);
  assertEqual("Math.clz32(1<<2)", 29);
  assertEqual("Math.clz32(1<<1)", 30);
  assertEqual("Math.clz32(1)", 31);
  assertEqual("Math.clz32(0)", 32);
});

test("Number", function () {
  // Number.EPSILON
  assertTrue("'EPSILON' in Number");
  assertEqual("typeof Number.EPSILON", 'number');
  assertTrue("(1 + Number.EPSILON) !== 1");
  assertFalse("(1 + Number.EPSILON/2) !== 1");

  // Number.MAX_SAFE_INTEGER
  assertTrue("'MAX_SAFE_INTEGER' in Number");
  assertEqual("typeof Number.MAX_SAFE_INTEGER", 'number');
  assertFalse("(Number.MAX_SAFE_INTEGER + 2) > (Number.MAX_SAFE_INTEGER + 1)");

  // Number.MIN_SAFE_INTEGER
  assertTrue("'MIN_SAFE_INTEGER' in Number");
  assertEqual("typeof Number.MIN_SAFE_INTEGER", 'number');
  assertEqual("Number.MIN_SAFE_INTEGER", -Number.MAX_SAFE_INTEGER);

  equal(Number.parseInt, parseInt, 'Number.parseInt is the same function as parseInt');
  equal(Number.parseFloat, parseFloat, 'Number.parseFloat is the same function as parseFloat');

  // Number.isNaN
  assertFalse("Number.isNaN('')");
  assertTrue("Number.isNaN(NaN)");
  assertFalse("Number.isNaN(0)");

  // Number.isFinite
  assertFalse("Number.isFinite('')");
  assertFalse("Number.isFinite(NaN)");
  assertFalse("Number.isFinite(-Infinity)");
  assertFalse("Number.isFinite(+Infinity)");
  assertTrue("Number.isFinite(0)");
  assertTrue("Number.isFinite(-1)");
  assertTrue("Number.isFinite(+1)");

  // Number.isInteger
  assertFalse("Number.isInteger('')");
  assertFalse("Number.isInteger(NaN)");
  assertFalse("Number.isInteger(-Infinity)");
  assertFalse("Number.isInteger(+Infinity)");
  assertTrue("Number.isInteger(0)");
  assertTrue("Number.isInteger(-1)");
  assertTrue("Number.isInteger(+1)");
  assertFalse("Number.isInteger(-1.1)");
  assertFalse("Number.isInteger(+1.1)");

  // Number.isSafeInteger
  assertFalse("Number.isSafeInteger('')", 0);
  assertFalse("Number.isSafeInteger(NaN)", 0);
  assertFalse("Number.isSafeInteger(-Infinity)", -Infinity);
  assertFalse("Number.isSafeInteger(+Infinity)", Infinity);
  assertTrue("Number.isSafeInteger(0)", 0);
  assertTrue("Number.isSafeInteger(-1)", -1);
  assertTrue("Number.isSafeInteger(+1)", 1);
  assertFalse("Number.isSafeInteger(-1.1)", -1);
  assertFalse("Number.isSafeInteger(+1.1)", 1);
  assertTrue("Number.isSafeInteger(Math.pow(2,53)-1)", 1);
  assertTrue("Number.isSafeInteger(-Math.pow(2,53)+1)", 1);
  assertFalse("Number.isSafeInteger(Math.pow(2,53))", 1);
  assertFalse("Number.isSafeInteger(-Math.pow(2,53))", 1);
});


test("String", function () {
  // String.prototype.repeat
  assertEqual("''.repeat(NaN)", '');
  assertEqual("''.repeat(0)", '');
  assertThrows("''.repeat(-1)");
  assertThrows("'a'.repeat(Infinity)");
  assertEqual("''.repeat(1)", '');
  assertEqual("''.repeat(10)", '');
  assertEqual("'a'.repeat(NaN)", '');
  assertEqual("'a'.repeat(0)", '');
  assertThrows("'a'.repeat(-1)");
  assertThrows("'a'.repeat(Infinity)");
  assertEqual("'a'.repeat(1)", 'a');
  assertEqual("'a'.repeat(10)", 'aaaaaaaaaa');
  assertEqual("'ab'.repeat(NaN)", '');
  assertEqual("'ab'.repeat(0)", '');
  assertThrows("'ab'.repeat(-1)");
  assertThrows("'ab'.repeat(Infinity)");
  assertEqual("'ab'.repeat(1)", 'ab');
  assertEqual("'ab'.repeat(10)", 'abababababababababab');
  assertEqual("String.prototype.repeat.length", 1);

  // String.prototype.startsWith
  assertTrue("'abcdef'.startsWith('abc')");
  assertFalse("'abcdef'.startsWith('def')");
  assertTrue("'abcdef'.startsWith('')");
  assertTrue("'abcdef'.startsWith('bc', 1)");
  assertTrue("String.prototype.startsWith.length", 1);

  // String.prototype.endsWith
  assertTrue("'abcdef'.endsWith('def')");
  assertFalse("'abcdef'.endsWith('abc')");
  assertTrue("'abcdef'.endsWith('')");
  assertTrue("'abcdef'.endsWith('de', 5)");
  assertTrue("String.prototype.endsWith.length", 1);

  // String.prototype.includes
  assertTrue("'abcdef'.includes('bcd')");
  assertFalse("'abcdef'.includes('mno')");
  assertTrue("'abcdef'.includes('')");
  assertTrue("String.prototype.includes.length", 1);
});

test("String - Unicode helpers", function () {
  // String.fromCodePoint
  assertEqual("String.fromCodePoint(0)", "\x00");
  assertEqual("String.fromCodePoint(65)", "A");
  assertEqual("String.fromCodePoint(65, 66, 67)", "ABC");
  assertEqual("String.fromCodePoint(0x0100)", "\u0100");
  assertEqual("String.fromCodePoint(0x1000)", "\u1000");
  assertEqual("String.fromCodePoint(0xd800)", "\ud800");
  assertEqual("String.fromCodePoint(0xdc00)", "\udc00");
  assertEqual("String.fromCodePoint(0xfffd)", "\ufffd");
  assertEqual("String.fromCodePoint(0x010000)", "\ud800\udc00");
  assertEqual("String.fromCodePoint(0x10ffff)", "\udbff\udfff");

  // String.prototype.codePointAt
  assertEqual("'\\x00'.codePointAt(0)", 0);
  assertEqual("'A'.codePointAt(0)", 65);
  assertEqual("'\\u0100'.codePointAt(0)", 0x100);
  assertEqual("'\\u1000'.codePointAt(0)", 0x1000);
  assertEqual("'\\ud800'.codePointAt(0)", 0xd800);
  assertEqual("'\\udc00'.codePointAt(0)", 0xdc00);
  assertEqual("'\\ufffd'.codePointAt(0)", 0xfffd);
  assertEqual("'\\ud800\\udc00'.codePointAt(0)", 0x10000);
  assertEqual("'\\udbff\\udfff'.codePointAt(0)", 0x10ffff);
  assertEqual("''.codePointAt(0)", undefined);
  assertEqual("'A'.codePointAt(1)", undefined);
  assertEqual("'AB'.codePointAt(1)", 66);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(0)", 0x10000);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(1)", 0xdc00);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(2)", 0x10ffff);
});

test("String Iterators", function () {
  ok(Symbol.iterator in String.prototype);
  verifyIterator(('ABC')[Symbol.iterator](), ['A', 'B', 'C']);
});

test("Array", function () {
  assertTrue("'of' in Array");
  assertEqual("typeof Array.of", 'function');
  assertEqual("Array.of.length", 0);
  assertEqual("Array.of(1,2,3).length", 3);
  assertEqual("Array.of([1,2,3]).length", 1);
  deepEqual(Array.of(), [], 'Array.of with no arguments');
  deepEqual(Array.of(1), [1], 'Array.of with one argument');
  deepEqual(Array.of(1, 2), [1, 2], 'Array.of with two arguments');
  deepEqual(Array.of(1, 2, 3), [1, 2, 3], 'Array.of with three arguments');
  deepEqual(Array.of([]), [[]], 'Array.of with array argument');

  assertTrue("'from' in Array");
  assertEqual("typeof Array.from", 'function');
  assertEqual("Array.from.length", 1);
  assertThrows("Array.from(1,2,3)");
  assertEqual("Array.from([1,2,3]).length", 3);
  deepEqual(Array.from([1, 2, 3]), [1, 2, 3], 'Array.from on array');
  deepEqual(Array.from({length: 0}), [], 'Array.from on empty arraylike');
  deepEqual(Array.from({length: 1}), [(void 0)], 'Array.from on empty sparse arraylike');
  deepEqual(Array.from({length: 0, 0: 'a'}), [], 'Array.from on arraylike');
  deepEqual(Array.from({length: 1, 0: 'a'}), ['a'], 'Array.from on arraylike');
  deepEqual(Array.from({length: 2, 1: 'a'}), [(void 0), 'a'], 'Array.from on sparse arraylike');
  deepEqual(Array.from([1,2,3], function(x) { return x * x; }), [1, 4, 9], 'Array.from with mapfn');

  deepEqual([1,2,3,4].fill(5), [5,5,5,5], 'Array.fill');
  deepEqual([1,2,3,4].fill(5, 1), [1,5,5,5], 'Array.fill with start');
  deepEqual([1,2,3,4].fill(5, 1, 3), [1,5,5,4], 'Array.fill with start and end');
  deepEqual([1,2,3,4].fill(5, -3), [1,5,5,5], 'Array.fill with negative start');
  deepEqual([1,2,3,4].fill(5, -3, -1), [1,5,5,4], 'Array.fill with negative start and end');
  assertEqual("Array.prototype.fill.length", 1, 'Array.fill function length');

  deepEqual([0,1,2,3,4].copyWithin(3, 0, 2), [0,1,2,0,1], 'Array.copyWithin with start and end');
  deepEqual([0,1,2,3,4].copyWithin(0, 3), [3,4,2,3,4], 'Array.copyWithin with start');
  deepEqual([0,1,2,3,4].copyWithin(0, 2, 5), [2,3,4,3,4], 'Array.copyWithin');
  deepEqual([0,1,2,3,4].copyWithin(2, 0, 3), [0,1,0,1,2], 'Array.copyWithin');
  assertEqual("Array.prototype.copyWithin.length", 2, 'Array.copyWithin function length');

  assertEqual("String([].entries())", "[object Array Iterator]");
  assertEqual("Object.prototype.toString.call([].entries())", "[object Array Iterator]");
});

test("Array Iterators", function () {
  ok(Symbol.iterator in Array.prototype);
  verifyIterator([1,2,3][Symbol.iterator](), [1,2,3]);
  verifyIterator(['A','B','C'].keys(), [0,1,2]);
  verifyIterator(['A','B','C'].values(), ['A','B','C']);
  verifyIterator(['A','B','C'].entries(), [[0,'A'],[1,'B'],[2,'C']]);
});

test("Array.prototype.find/findIndex", function() {
  array = ["a", "b", NaN];

  assertEqual("array.find(function(v) { return v === 'a'; })", "a");
  assertEqual("array.find(function(v) { return v !== v; })", NaN);
  assertEqual("array.find(function(v) { return v === 'z'; })", undefined);

  assertEqual("array.findIndex(function(v) { return v === 'a'; })", 0);
  assertEqual("array.findIndex(function(v) { return v !== v; })", 2);
  assertEqual("array.findIndex(function(v) { return v === 'z'; })", -1);

  delete array;
});

test("Object", function () {

  testobj1 = {};
  testobj2 = {};

  var examples = [
    "(void 0)",
    "null",
    "-Infinity",
    "-Number.MAX_VALUE",
    //"-Number.MIN_VALUE", // Safari on iOS/ARM thinks 0 === Number.MIN_VALUE
    "-0",
    "0",
    //"Number.MIN_VALUE", // Safari on iOS/ARM thinks 0 === Number.MIN_VALUE
    "Number.MAX_VALUE",
    "Infinity",
    "true",
    "false",
    "''",
    "'abc'",
    "'abd'",
    "testobj1",
    "testobj2"
  ];

  var i, j;

  for (i = 0; i < examples.length; i += 1) {
    for (j = 0; j < examples.length; j += 1) {
      if (i === j) {
        assertTrue("Object.is(" + examples[i] + "," + examples[j] + ")");
      } else {
        assertFalse("Object.is(" + examples[i] + "," + examples[j] + ")");
      }
    }
  }

  delete testobj1;
  delete testobj2;

  var q = 1;
  var s = { a: 1 };
  Object.defineProperty(
    s, 'b', { get: function() { return q * 2; }, configurable: true, enumerable: true });
  var t = Object.assign({c: 3}, s);
  q = 5;
  equal(t.a, 1, "Object.assign copies basic properties");
  equal(t.b, 2, "Object.assign copies getters by value");
  equal(t.c, 3, "Object.assign leaves existing properties intact");

  t = Object.assign({a: 1}, {b: 2}, {c: 3});
  deepEqual(t, {a: 1, b: 2, c: 3}, "Object.assign copies multiple sources");

  deepEqual(Object.keys(Object.assign({a:1}, null)), ['a'],
        'Object.assign(o, null) does not throw');
  deepEqual(Object.keys(Object.assign({a:1}, undefined)), ['a'],
        'Object.assign(o, undefined) does not throw');
});

test("Typed Array", function() {
  deepEqual(Uint8Array.from([1,2,3]), new Uint8Array([1,2,3]), 'Typed Array from() array');
  deepEqual(Uint8Array.from({0:1,1:2,2:3,length:3}), new Uint8Array([1,2,3]), 'Typed Array from() arraylike');

  deepEqual(Uint8Array.of(1,2,3), new Uint8Array([1,2,3]), 'Typed Array of()');

  deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(3, 0, 2), new Uint8Array([0,1,2,0,1]), 'Typed Array copyWithin()');
  deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(0, 3), new Uint8Array([3,4,2,3,4]), 'Typed Array copyWithin()');
  deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(0, 2, 5), new Uint8Array([2,3,4,3,4]), 'Typed Array copyWithin()');
  deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(2, 0, 3), new Uint8Array([0,1,0,1,2]), 'Typed Array copyWithin()');

  assertTrue("new Uint8Array([1,3,5]).every(function(n){return n%2;})");
  assertFalse("new Uint8Array([1,3,6]).every(function(n){return n%2;})");

  arrayEqual(new Uint8Array(3).fill(9), [9,9,9], 'Typed Array fill()');
  arrayEqual(new Uint8Array([0,1,2,3,4]).filter(function(n){return n%2;}), [1,3], 'Typed Array fillter()');
  deepEqual(new Uint8Array([1,2,3,4]).find(function(n){return n>2;}), 3, 'Typed Array find()');
  deepEqual(new Uint8Array([1,2,3,4]).findIndex(function(n){return n>2;}), 2, 'Typed Array findIndex()');

  var data = [11, 22, 33], count = 0;
  var array = new Uint8Array(data);
  array.forEach(function(v, k, a) {
    equal(v, data[count], 'Typed Array forEach() value argument');
    equal(k, count, 'Typed Array forEach() key argument');
    equal(a, array, 'Typed Array forEach() array argument');
    ++count;
  });
  equal(count, data.length, 'Typed Array forEach() correct count');

  deepEqual(new Uint8Array([1,2,3,1,2,3]).indexOf(3), 2, 'Typed Array indexOf()');
  deepEqual(new Uint8Array([1,2,3,4]).join('-'), "1-2-3-4", 'Typed Array join()');

  deepEqual(new Uint8Array([1,2,3,1,2,3]).lastIndexOf(3), 5, 'Typed Array lastIndexOf()');
  arrayEqual(new Uint8Array([0,1,2,3]).map(function(n){return n*2;}), [0,2,4,6], 'Typed Array map()');
  deepEqual(new Uint8Array([0,1,2,3]).reduce(function(a,b){return a-b;}), -6, 'Typed Array reduce()');
  deepEqual(new Uint8Array([0,1,2,3]).reduceRight(function(a,b){return a-b;}), 0, 'Typed Array reduceRight()');
  arrayEqual(new Uint8Array([0,1,2,3]).reverse(), [3,2,1,0], 'Typed Array reverse');

  arrayEqual(new Uint8Array([1,2,3,4]).slice(), [1,2,3,4], 'Typed Array slice()');
  arrayEqual(new Uint8Array([1,2,3,4]).slice(2,4), [3,4], 'Typed Array slice() range');

  assertFalse("new Uint8Array([1,3,5]).some(function(n){return n%2===0;})");
  assertTrue("new Uint8Array([1,3,6]).some(function(n){return n%2===0;})");

  arrayEqual(new Float32Array([Infinity,NaN,10,2]).sort(), [2,10,Infinity,NaN]);

  verifyIterator(new Uint8Array([11,22,33]).values(), [11,22,33]);
  verifyIterator(new Uint8Array([11,22,33]).keys(), [0,1,2]);
  verifyIterator(new Uint8Array([11,22,33]).entries(), [[0,11], [1,22], [2,33]]);

  ['Int8Array', 'Uint8Array', 'Uint8ClampedArray',
   'Int16Array', 'Uint16Array',
   'Int32Array', 'Uint32Array',
   'Float32Array', 'Float64Array'].forEach(function(typeName) {
     var type = self[typeName];
     ['from', 'of'].forEach(function(member) {
       ok(member in type, typeName + ' has ' + member);
     });
     ['copyWithin', 'entries', 'every', 'fill', 'filter',
      'find','findIndex', 'forEach', 'indexOf', 'join',
      'keys', 'lastIndexOf', 'map', 'reduce', 'reduceRight',
      'reverse', 'slice', 'some', 'sort', 'values' ].forEach(function(member) {
        ok(member in type.prototype, typeName + ' has ' + member);
      });
   });
});

test("RegExp", function() {
  assertTrue("Symbol.replace in /.*/");

  assertEqual("/a/[Symbol.replace]('california', 'x')", 'cxlifornia');
  assertEqual("/a/g[Symbol.replace]('california', 'x')", 'cxlifornix');

  assertTrue("Symbol.search in /.*/");
  assertEqual("/a/[Symbol.search]('california', 'x')", 1);

  assertTrue("Symbol.split in /.*/");
  deepEqual(/a/[Symbol.split]('california'), ['c', 'liforni', ''], 'RegExp split()');

  assertTrue("Symbol.match in /.*/");
  deepEqual(/(.a)/g[Symbol.match]('california'), ['ca', 'ia'], 'RegExp match()');

  assertEqual('(/abc/).flags', '');
  assertEqual('(/abc/g).flags', 'g');
  assertEqual('(/abc/gim).flags', 'gim');
  assertEqual('(/abc/mig).flags', 'gim');
});

test("RegExp dispatch", function() {
  var calls = [];
  var rx = {};
  rx[Symbol.match] = function() {
    calls.push('match');
    return 1;
  };
  rx[Symbol.replace] = function() {
    calls.push('replace');
    return 2;
  };
  rx[Symbol.search] = function() {
    calls.push('search');
    return 3;
  };
  rx[Symbol.split] = function() {
    calls.push('split');
    return 4;
  };

  equal('abc'.match(rx), 1);
  equal('abc'.replace(rx), 2);
  equal('abc'.search(rx), 3);
  equal('abc'.split(rx), 4);

  deepEqual(calls, ['match', 'replace', 'search', 'split']);
});

module("Symbols");

test("Symbol", function() {
  assertThrows("new Symbol");
  s = Symbol();
  t = Symbol();
  o = {};
  assertEqual("o[s] = 1", 1);
  assertTrue("s in o");
  assertFalse("t in o");
  assertFalse("s === t");
  assertEqual("o[s]", 1);

  assertTrue('Symbol.toStringTag !== null');
  assertTrue('Symbol.iterator !== null');

  assertTrue('Symbol.iterator in Array.prototype');
  assertTrue('Symbol.iterator in Map.prototype');
  assertTrue('Symbol.iterator in Set.prototype');

  assertEqual("Symbol.keyFor(Symbol.for('key'))", 'key');

  o = {};
  o['a'] = 1;
  Object.defineProperty(o, 'b', {value: 2});
  o[s] = 3;
  Object.defineProperty(o, t, {value: 2});
  assertEqual('Object.getOwnPropertyNames(o).length', 2);
  assertFalse('Object.getOwnPropertyNames(o).indexOf("a") === -1');
  assertFalse('Object.getOwnPropertyNames(o).indexOf("b") === -1');
  assertEqual('Object.getOwnPropertyNames(o).indexOf(s)', -1);
  assertEqual('Object.getOwnPropertySymbols(o).length', 2);
  assertFalse('Object.getOwnPropertySymbols(o).indexOf(s) === -1');
  assertFalse('Object.getOwnPropertySymbols(o).indexOf(t) === -1');
  assertEqual('Object.getOwnPropertySymbols(o).indexOf("a")', -1);
  assertEqual('Object.keys(o).length', 1);
  assertFalse('Object.keys(o).indexOf("a") === -1');
  assertEqual('Object.keys(o).indexOf("b")', -1);
  assertEqual('Object.keys(o).indexOf(s)', -1);

  delete s;
  delete t;
  delete o;

  assertEqual("Symbol.prototype[Symbol.toStringTag]", "Symbol");
  assertEqual("Object.prototype.toString.call(Symbol())", "[object Symbol]");

  // Conversions:
  // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-07/jul-29.md
  (function() {
    var aSymbol = Symbol();
    equal(aSymbol === "not a symbol", false, 'symbols not equal to string'); // == does valueOf conversion and throws
    var s = Symbol();
    ok(s == Object(s), 'Object(symbol) yields the symbol');
    throws(function() { return "foo" + aSymbol; }, TypeError, 'Symbols don\'t auto-convert to strings');
    throws(function() { return aSymbol + "foo"; }, TypeError, 'Symbols don\'t auto-convert to strings');
    throws(function() { return Number(aSymbol); }, TypeError, 'Symbols don\'t auto-convert to numbers');
  }());

  assertTrue('Symbol.match !== undefined');
  assertTrue('Symbol.replace !== undefined');
  assertTrue('Symbol.search !== undefined');
  assertTrue('Symbol.split !== undefined');

  assertTrue('Symbol.match in RegExp.prototype');
  assertTrue('Symbol.replace in RegExp.prototype');
  assertTrue('Symbol.search in RegExp.prototype');
  assertTrue('Symbol.split in RegExp.prototype');
});

module("Containers and Iterators");

test("Map", function () {
  assertEqual("Map.length", 0);

  map = new Map();
  assertFalse("map.has(-0)");
  assertFalse("map.has(0)");
  map.set(0, 1234);
  assertEqual("map.size", 1);
  assertTrue("map.has(-0)");
  assertTrue("map.has(0)");
  assertEqual("map.get(0)", 1234);
  assertEqual("map.get(-0)", 1234);
  map['delete'](-0);
  assertFalse("map.has(-0)");
  assertFalse("map.has(0)");
  map.set(-0, 1234);
  map.clear();
  assertFalse("map.has(0)");
  assertFalse("map.has(-0)");
  assertEqual("map.size", 0);
  assertEqual("map.set('key', 'value')", map);

  assertEqual("1/(new Map([['key', 0]]).values().next().value)", Infinity);
  assertEqual("1/(new Map([['key', -0]]).values().next().value)", -Infinity);

  assertEqual("1/(new Map([[0, 'value']]).keys().next().value)", Infinity);
  assertEqual("1/(new Map([[-0, 'value']]).keys().next().value)", Infinity);

  var data = [[0, "a"], [1, "b"]], count = 0;
  map = new Map(data);
  map.forEach(function(v, k, m) {
    assertEqual("map", m);
    self.k = k;
    self.v = v;
    assertEqual("k", data[count][0]);
    assertEqual("v", data[count][1]);
    ++count;
    delete self.k;
    delete self.v;
  });
  equal(2, count, 'two items seen during Map forEach()');

  verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).keys(), [1,2,3]);
  verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).values(), ['a','b','c']);
  verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).entries(), [[1,'a'], [2,'b'], [3,'c']]);

  // Verify |empty| behavior
  map = new Map().set('a', 1).set('b', 2).set('c', 3).set('d', 4);
  var keys = [];
  var iterator = map.keys();
  keys.push(iterator.next().value);
  map["delete"]('a');
  map["delete"]('b');
  map["delete"]('c');
  map.set('e');
  keys.push(iterator.next().value);
  keys.push(iterator.next().value);
  assertEqual('JSON.stringify(["a","d","e"])', JSON.stringify(keys));

  map = new Map();
  map.set('a', 1);
  map.set('b', 2);
  map['delete']('a');
  count = 0;
  map.forEach(function (k, v) {
    ++count;
  });
  equal(1, count, 'Map iteration should skip deleted items');

  delete map;

  assertThrows('Map()');

  assertEqual("Map.prototype[Symbol.toStringTag]", "Map");
  assertEqual("String(new Map)", "[object Map]");
  assertEqual("Object.prototype.toString.call(new Map)", "[object Map]");
  assertEqual("String((new Map).entries())", "[object Map Iterator]");
  assertEqual("Object.prototype.toString.call((new Map).entries())", "[object Map Iterator]");
});

test("Set", function () {
  assertEqual("Set.length", 0);

  set = new Set();
  assertFalse("set.has(-0)");
  assertFalse("set.has(0)");
  assertEqual("set.size", 0);
  set.add(0);
  assertTrue("set.has(-0)");
  assertTrue("set.has(0)");
  assertEqual("set.size", 1);
  set['delete'](-0);
  assertFalse("set.has(-0)");
  assertFalse("set.has(0)");
  assertEqual("set.size", 0);
  set.add(-0);
  set.clear();
  assertFalse("set.has(0)");
  assertEqual("set.size", 0);
  assertEqual("set.add('key')", set);

  assertEqual("1/(new Set([0]).values().next().value)", Infinity);
  assertEqual("1/(new Set([-0]).values().next().value)", Infinity);

  var data = [1, 2, 3], count = 0;
  set = new Set(data);
  set.forEach(function(e1, e2, s) {
    assertEqual("set", s);
    self.e1 = e1;
    self.e2 = e2;
    assertEqual("e1", data[count]);
    assertEqual("e2", data[count]);
    delete self.e1;
    delete self.e2;
    ++count;
  });
  equal(3, count, 'Set iteration yields expected number of items');

  set = new Set(('ABC')[Symbol.iterator]());
  verifyIterator(set.values(), ['A', 'B', 'C']);
  verifyIterator(set.keys(), ['A', 'B', 'C']);
  verifyIterator(set.entries(), [['A', 'A'], ['B', 'B'], ['C', 'C']]);

  // Verify |empty| behavior
  set = new Set();
  set.add('a');
  set.add('b');
  set.add('c');
  set.add('d');
  var keys = [];
  var iterator = set.values();
  keys.push(iterator.next().value);
  set["delete"]('a');
  set["delete"]('b');
  set["delete"]('c');
  set.add('e');
  keys.push(iterator.next().value);
  keys.push(iterator.next().value);
  assertEqual('JSON.stringify(["a","d","e"])', JSON.stringify(keys));

  set = new Set();
  set.add('a');
  set.add('b');
  set['delete']('a');
  count = 0;
  set.forEach(function(v) {
    ++count;
  });
  equal(1, count, 'Set iteration skips deleted items');

  delete set;

  assertThrows('Set()');

  assertEqual("Set.prototype[Symbol.toStringTag]", "Set");
  assertEqual("String(new Set)", "[object Set]");
  assertEqual("Object.prototype.toString.call(new Set)", "[object Set]");
  assertEqual("String((new Set).values())", "[object Set Iterator]");
  assertEqual("Object.prototype.toString.call((new Set).values())", "[object Set Iterator]");
});

test("WeakMap", function () {
  assertEqual("WeakMap.length", 0);

  wm1 = new WeakMap();
  wm2 = new WeakMap();
  x = {};
  y = {};
  v = {};

  assertFalse("wm1.has(x)");
  assertFalse("wm2.has(x)");
  assertFalse("wm1.has(y)");
  assertFalse("wm2.has(y)");

  wm1.set(x, "x-value");
  assertTrue("wm1.has(x)");
  assertFalse("wm2.has(x)");
  assertFalse("wm1.has(y)");
  assertFalse("wm2.has(y)");
  assertEqual("wm1.get(x)", "x-value");

  wm1.set(y, "y-value");
  assertTrue("wm1.has(x)");
  assertFalse("wm2.has(x)");
  assertTrue("wm1.has(y)");
  assertFalse("wm2.has(y)");
  assertEqual("wm1.get(x)", "x-value");
  assertEqual("wm1.get(y)", "y-value");

  wm2.set(x, "x-value-2");
  assertTrue("wm1.has(x)");
  assertTrue("wm2.has(x)");
  assertTrue("wm1.has(y)");
  assertFalse("wm2.has(y)");
  assertEqual("wm1.get(x)", "x-value");
  assertEqual("wm2.get(x)", "x-value-2");
  assertEqual("wm1.get(y)", "y-value");

  wm1['delete'](x);
  assertFalse("wm1.has(x)");
  assertTrue("wm2.has(x)");
  assertTrue("wm1.has(y)");
  assertFalse("wm2.has(y)");
  assertEqual("wm2.get(x)", "x-value-2");
  assertEqual("wm1.get(y)", "y-value");

  wm1.set(y, "y-value-new");
  assertFalse("wm1.has(x)");
  assertTrue("wm2.has(x)");
  assertTrue("wm1.has(y)");
  assertFalse("wm2.has(y)");
  assertEqual("wm2.get(x)", "x-value-2");
  assertEqual("wm1.get(y)", "y-value-new");

  wm1.set(x, v);
  wm2.set(y, v);
  assertTrue("wm1.get(x) === wm2.get(y)");

  assertEqual("wm1.set(x, v)", wm1);

  delete wm1;
  delete wm2;
  delete x;
  delete y;
  delete v;

  assertThrows('WeakMap()');

  assertEqual("WeakMap.prototype[Symbol.toStringTag]", "WeakMap");
  assertEqual("String(new WeakMap)", "[object WeakMap]");
  assertEqual("Object.prototype.toString.call(new WeakMap)", "[object WeakMap]");

  assertEqual("new WeakMap().get(Object.create(null))", undefined);
});

test("WeakSet", function () {
  assertEqual("WeakSet.length", 0);

  set = new WeakSet();
  x = {};
  y = {};
  assertFalse("set.has(x)");
  assertFalse("set.has(y)");
  set.add(x);
  assertTrue("set.has(x)");
  assertFalse("set.has(y)");
  set['delete'](x);
  assertFalse("set.has(x)");
  assertFalse("set.has(y)");
  set.add(x);

  set = new WeakSet([x, y]);
  assertTrue("set.has(x)");
  assertTrue("set.has(y)");

  assertEqual("set.add(x)", set);
  assertTrue("set['delete'](x)");
  assertFalse("set['delete'](x)");

  delete set;
  delete x;
  delete y;

  assertThrows('WeakSet()');

  assertEqual("WeakSet.prototype[Symbol.toStringTag]", "WeakSet");
  assertEqual("String(new WeakSet)", "[object WeakSet]");
  assertEqual("Object.prototype.toString.call(new WeakSet)", "[object WeakSet]");
});

test("Branding", function() {
  assertEqual("ArrayBuffer.prototype[Symbol.toStringTag]", "ArrayBuffer");
  assertEqual("Object.prototype.toString.call(new Uint8Array().buffer)", "[object ArrayBuffer]");

  assertEqual("DataView.prototype[Symbol.toStringTag]", "DataView");
  assertEqual("Object.prototype.toString.call(new DataView(new Uint8Array().buffer))", "[object DataView]");

  assertEqual("JSON[Symbol.toStringTag]", "JSON");
  assertEqual("Object.prototype.toString.call(JSON)", "[object JSON]");

  assertEqual("Math[Symbol.toStringTag]", "Math");
  assertEqual("Object.prototype.toString.call(Math)", "[object Math]");

  // Make sure these aren't broken:
  assertEqual("Object.prototype.toString.call(undefined)", "[object Undefined]");

  // Fails in IE9-; in non-strict mode, |this| is the global and can't be distinguished from undefined
  assertEqual("Object.prototype.toString.call(null)", "[object Null]");

  assertEqual("Object.prototype.toString.call(0)", "[object Number]");
  assertEqual("Object.prototype.toString.call(1)", "[object Number]");
  assertEqual("Object.prototype.toString.call(NaN)", "[object Number]");

  assertEqual("Object.prototype.toString.call('')", "[object String]");
  assertEqual("Object.prototype.toString.call('x')", "[object String]");

  assertEqual("Object.prototype.toString.call(true)", "[object Boolean]");
  assertEqual("Object.prototype.toString.call(false)", "[object Boolean]");

  assertEqual("Object.prototype.toString.call({})", "[object Object]");
  assertEqual("Object.prototype.toString.call([])", "[object Array]");
  assertEqual("Object.prototype.toString.call(function(){})", "[object Function]");
  // etc.
});



module("Promises");
test("Basics", function() {
  expect(4);
  new Promise(function (resolve, reject) {
    equal(typeof resolve, 'function', 'resolve capability is a function');
    equal(typeof reject, 'function', 'reject capability is a function');
  });

  assertEqual("Promise.prototype[Symbol.toStringTag]", "Promise");
  assertEqual("Object.prototype.toString.call(new Promise(function(){}))", "[object Promise]");
});

asyncTest("Fulfill", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    equal(value, 5);
    start();
  }, function(reason) {
    ok(false);
    start();
  });

  fulfill(5);
});

asyncTest("Reject", function() {
  expect(1);
  var reject;
  new Promise(function (a, b) {
    reject = b;
  }).then(function(value) {
    ok(false, 'unexpected code reached');
    start();
  }, function(reason) {
    equal(reason, 5, 'rejection reason should match rejection value');
    start();
  });

  reject(5);
});

asyncTest("Catch", function() {
  var reject;
  var p = new Promise(function (a, b) {
    reject = b;
  })['catch'](function(reason) {
    equal(reason, 5, 'catch reason should match rejection value');
    start();
  });

  reject(5);
});

asyncTest("Multiple thens", function() {
  var fulfill;
  var p = new Promise(function (a, b) {
    fulfill = a;
  });

  var saw = [];
  p.then(function(value) {
    saw.push(value);
  });
  p.then(function(value) {
    saw.push(value);
    deepEqual(saw, [5, 5], 'multiple thens should be called with same value');
    start();
  });

  fulfill(5);
});

asyncTest("Catch returns Promise", function() {
  var p = Promise.reject().catch(function(reason) { return 123; });
  ok(p instanceof Promise, 'catch() should return a Promise');
  p.then(function(result) {
    equal(result, 123, 'Returned promise should resolve to returned value');
    start();
  });
});

asyncTest("Promise.resolve()", function() {

  var p = new Promise(function(){});
  ok(Promise.resolve(p) === p, 'Promise.resolve(promise) should return same promise');

  Promise.resolve(5).then(function(value) {
    equal(value, 5, 'Promise.resolve(value) should resolve');
    start();
  });
});

asyncTest("Promise.reject()", function() {
  Promise.reject(5)['catch'](function(reason) {
    equal(reason, 5, 'Promise.reject(reason) should reject');
    start();
  });
});

asyncTest("Promise resolved with Promise", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    equal(value, 5, 'Promise fulfilled with Promise should resolve to actual value');
    start();
  });
  fulfill(Promise.resolve(5));
});

asyncTest("Promise rejected with promise", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  })['catch'](function(value) {
    equal(value, 5, 'Promise rejected with Promise should resolve to actual value');
    start();
  });
  fulfill(Promise.reject(5));
});

asyncTest("Promise.race()", function() {
  var f1, f2, f3;
  var p1 = new Promise(function(f, r) { f1 = f; });
  var p2 = new Promise(function(f, r) { f2 = f; });
  var p3 = new Promise(function(f, r) { f3 = f; });
  Promise.race([p1, p2, p3]).then(function(value) {
    equal(value, 2, 'Promise.race() should resolve to first fulfilled value');
    start();
  });
  f2(2);
});

asyncTest("Promise.all() fulfill", function() {
  Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
    ]).then(function(value) {
      deepEqual(value, [1,2,3], 'Promise.all should resolve to completed promises');
      start();
    });
});

asyncTest("Promise.all() fulfill async", function() {
  var f1, f2, f3;
  var p1 = new Promise(function(f, r) { f1 = f; });
  var p2 = new Promise(function(f, r) { f2 = f; });
  var p3 = new Promise(function(f, r) { f3 = f; });
  Promise.all([p1, p2, p3]).then(function(value) {
      deepEqual(value, [1,2,3], 'Promise.all should resolve to completed promises');
      start();
    });
  f3(3);
  f2(2);
  f1(1);
});

asyncTest("Promise.all() reject", function() {
  Promise.all([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3)
    ])['catch'](function(reason) {
      equal(reason, 2, 'Promise.all should reject if any promise rejects');
      start();
    });
});

module("Reflection");

test("Reflect", function() {
  assertEqual('Reflect.construct(Date, [1970, 1]).getMonth()', 1);
  assertEqual('Reflect.enumerate({a:1}).next().value', 'a');

  var o = {};
  Object.defineProperty(o, 'p', {configurable: true, writable: true, value: 123});
  Object.defineProperty(o, 'q', {configurable: false, value: 456});
  equal(Reflect.get(o, 'p'), 123);
  equal(Reflect.get(o, 'q'), 456);

  equal(Reflect.defineProperty(o, 'p', {configurable: true, writable: true, value: 789}), true,
        'Reflect.defineProperty should return true if it succeeds');
  equal(Reflect.defineProperty(o, 'q', {configurable: true, value: 012}), false,
        'Reflect.defineProperty should return false if it fails');
  equal(Reflect.get(o, 'p'), 789);
  equal(Reflect.get(o, 'q'), 456);

  equal(Reflect.set(o, 'p', 111), true,
        'Reflect.set should return true if it succeeds');
  equal(Reflect.set(o, 'q', 222), false,
        'Reflect.set should return false if it fails');
  equal(Reflect.get(o, 'p'), 111);
  equal(Reflect.get(o, 'q'), 456);

  equal(Reflect.deleteProperty(o, 'p'), true,
        'Reflect.deleteProperty should return true if it succeeds');
  equal(Reflect.deleteProperty(o, 'q'), false,
        'Reflect.deleteProperty should return false if it fails');
  equal(Reflect.get(o, 'p'), undefined);
  equal(Reflect.get(o, 'q'), 456);

  var p = {};
  equal(Reflect.getPrototypeOf(o), Object.prototype);
  equal(Reflect.setPrototypeOf(o, p), true);
  equal(Reflect.getPrototypeOf(o), p);

  var f = Object.freeze(o);
  equal(Reflect.setPrototypeOf(f, p), false);

});
