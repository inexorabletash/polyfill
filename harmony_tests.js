
test("Approved Math extras", 152, function () {
  var EPSILON = 1e-5;

  // log10(x)
  assertEqual("Math.log10('')", -Infinity);
  assertEqual("Math.log10(NaN)", NaN);
  assertEqual("Math.log10(-1)", NaN);
  assertEqual("Math.log10(-0)", -Infinity);
  assertEqual("Math.log10(+0)", -Infinity);
  assertEqual("Math.log10(1)", +0);
  assertEqual("Math.log10(+Infinity)", +Infinity);
  assertEpsilon("Math.log10(0.5)", -0.30103, EPSILON);
  assertEpsilon("Math.log10(1.5)", 0.176091, EPSILON);

  // log2(x)
  assertEqual("Math.log2('')", -Infinity);
  assertEqual("Math.log2(NaN)", NaN);
  assertEqual("Math.log2(-1)", NaN);
  assertEqual("Math.log2(-0)", -Infinity);
  assertEqual("Math.log2(+0)", -Infinity);
  assertEqual("Math.log2(1)", +0);
  assertEqual("Math.log2(+Infinity)", +Infinity);
  assertEpsilon("Math.log2(0.5)", -1, EPSILON);
  assertEpsilon("Math.log2(1.5)", 0.584963, EPSILON);

  // log1p
  assertEqual("Math.log1p('')", +0);
  assertEqual("Math.log1p(NaN)", NaN);
  assertEqual("Math.log1p(-1)", -Infinity);
  assertEqual("Math.log1p(-0)", -0);
  assertEqual("Math.log1p(+0)", +0);
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
  assertEqual("Math.expm1('')", +0);
  assertEqual("Math.expm1(NaN)", NaN);
  assertEqual("Math.expm1(+0)", +0);
  assertEqual("Math.expm1(-0)", -0);
  assertEqual("Math.expm1(+Infinity)", +Infinity);
  assertEqual("Math.expm1(-Infinity)", +1);
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
  assertEqual("Math.cosh('')", 1);
  assertEqual("Math.cosh(NaN)", NaN);
  assertEqual("Math.cosh(+0)", 1);
  assertEqual("Math.cosh(-0)", 1);
  assertEqual("Math.cosh(+Infinity)", +Infinity);
  assertEqual("Math.cosh(-Infinity)", +Infinity);
  assertEpsilon("Math.cosh(0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(-0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(1.5)", 2.35241, EPSILON);

  // sinh(x)
  assertEqual("Math.sinh('')", +0);
  assertEqual("Math.sinh(NaN)", NaN);
  assertEqual("Math.sinh(+0)", +0);
  assertEqual("Math.sinh(-0)", -0);
  assertEqual("Math.sinh(+Infinity)", +Infinity);
  assertEqual("Math.sinh(-Infinity)", -Infinity);
  assertEpsilon("Math.sinh(0.5)", 0.521095, EPSILON);
  assertEpsilon("Math.sinh(-0.5)", -0.521095, EPSILON);
  assertEpsilon("Math.sinh(1.5)", 2.12928, EPSILON);

  // tanh(x)
  assertEqual("Math.tanh('')", 0);
  assertEqual("Math.tanh(NaN)", NaN);
  assertEqual("Math.tanh(+Infinity)", +1);
  assertEqual("Math.tanh(-Infinity)", -1);
  assertEpsilon("Math.tanh(0.5)", 0.462117, EPSILON);
  assertEpsilon("Math.tanh(-0.5)", -0.462117, EPSILON);
  assertEpsilon("Math.tanh(1.5)", 0.905148, EPSILON);

  // acosh(x)
  assertEqual("Math.acosh('')", NaN);
  assertEqual("Math.acosh(NaN)", NaN);
  assertEqual("Math.acosh(-1)", NaN);
  assertEqual("Math.acosh(1)", +0);
  assertEqual("Math.acosh(+Infinity)", +Infinity);
  assertEpsilon("Math.acosh(1.5)", 0.962424, EPSILON);

  // asinh(x)
  assertEqual("Math.asinh('')", +0);
  assertEqual("Math.asinh(NaN)", NaN);
  assertEqual("Math.asinh(-0)", -0);
  assertEqual("Math.asinh(+0)", +0);
  assertEqual("Math.asinh(+Infinity)", +Infinity);
  assertEqual("Math.asinh(-Infinity)", -Infinity);
  assertEpsilon("Math.asinh(0.5)", 0.481212, EPSILON);
  assertEpsilon("Math.asinh(-0.5)", -0.481212, EPSILON);
  assertEpsilon("Math.asinh(1.5)", 1.19476, EPSILON);

  // atanh(x)
  assertEqual("Math.atanh('')", +0);
  assertEqual("Math.atanh(NaN)", NaN);
  assertEqual("Math.atanh(-2)", NaN);
  assertEqual("Math.atanh(+2)", NaN);
  assertEqual("Math.atanh(-1)", -Infinity);
  assertEqual("Math.atanh(+1)", +Infinity);
  assertEqual("Math.atanh(-0)", -0);
  assertEqual("Math.atanh(+0)", +0);
  assertEpsilon("Math.atanh(0.5)", 0.549306, EPSILON);
  assertEpsilon("Math.atanh(-0.5)", -0.549306, EPSILON);

  // hypot(x)
  assertEqual("Math.hypot('', 0)", +0);
  assertEqual("Math.hypot(0, '')", +0);
  assertEqual("Math.hypot(NaN, 0)", NaN);
  assertEqual("Math.hypot(0, NaN)", NaN);
  assertEqual("Math.hypot(+0, -0)", +0);
  assertEqual("Math.hypot(+0, +0)", +0);
  assertEqual("Math.hypot(+0, +1)", +1);
  assertEqual("Math.hypot(+0, -1)", +1);
  assertEqual("Math.hypot(-0, -0)", +0);
  assertEqual("Math.hypot(-0, +0)", +0);
  assertEqual("Math.hypot(-0, +1)", +1);
  assertEqual("Math.hypot(-0, -1)", +1);
  assertEqual("Math.hypot(+Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(-Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(0, +Infinity)", +Infinity);
  assertEqual("Math.hypot(0, -Infinity)", +Infinity);
  assertEqual("Math.hypot(Infinity, NaN)", +Infinity);
  assertEqual("Math.hypot(NaN, -Infinity)", +Infinity);
  assertEqual("Math.hypot(0)", 0);
  assertEqual("Math.hypot(1)", 1);
  assertEqual("Math.hypot(2)", 2);
  assertEqual("Math.hypot(0,0,1)", 1);
  assertEqual("Math.hypot(0,1,0)", 1);
  assertEqual("Math.hypot(1,0,0)", 1);
  assertEqual("Math.hypot(2,3,4)", Math.sqrt(2*2 + 3*3 + 4*4));

  // trunc(x)
  assertEqual("Math.trunc('')", +0);
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
  assertEqual("Math.sign('')", +0);
  assertEqual("Math.sign(NaN)", NaN);
  assertEqual("Math.sign(-0)", -0);
  assertEqual("Math.sign(+0)", +0);
  assertEqual("Math.sign(-2)", -1);
  assertEqual("Math.sign(+2)", +1);

  // cbrt(x)
  assertEqual("Math.cbrt('')", 0);
  assertEqual("Math.cbrt(NaN)", NaN);
  assertEqual("Math.cbrt(-0)", -0);
  assertEqual("Math.cbrt(-0)", +0);
  assertEqual("Math.cbrt(-Infinity)", -Infinity);
  assertEqual("Math.cbrt(Infinity)", Infinity);
  assertEqual("Math.cbrt(-1)", -1);
  assertEqual("Math.cbrt(1)", 1);
  assertEqual("Math.cbrt(-27)", -3);
  assertEqual("Math.cbrt(27)", 3);
});

test("Approved Number extras", 28, function () {
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

  // Number.toInt
  assertEqual("Number.toInt('')", 0);
  assertEqual("Number.toInt(NaN)", 0);
  assertEqual("Number.toInt(-Infinity)", -Infinity);
  assertEqual("Number.toInt(+Infinity)", Infinity);
  assertEqual("Number.toInt(0)", 0);
  assertEqual("Number.toInt(-1)", -1);
  assertEqual("Number.toInt(+1)", 1);
  assertEqual("Number.toInt(-1.1)", -1);
  assertEqual("Number.toInt(+1.1)", 1);
});

test("Approved String extras", function () {
  // String.prototype.repeat
  assertEqual("''.repeat(NaN)", '');
  assertEqual("''.repeat(0)", '');
  assertEqual("''.repeat(-1)", '');
  assertEqual("''.repeat(1)", '');
  assertEqual("''.repeat(10)", '');
  assertEqual("'a'.repeat(NaN)", '');
  assertEqual("'a'.repeat(0)", '');
  assertEqual("'a'.repeat(-1)", '');
  assertEqual("'a'.repeat(1)", 'a');
  assertEqual("'a'.repeat(10)", 'aaaaaaaaaa');
  assertEqual("'ab'.repeat(NaN)", '');
  assertEqual("'ab'.repeat(0)", '');
  assertEqual("'ab'.repeat(-1)", '');
  assertEqual("'ab'.repeat(1)", 'ab');
  assertEqual("'ab'.repeat(10)", 'abababababababababab');

  // String.prototype.startsWith
  assertTrue("'abcdef'.startsWith('abc')");
  assertFalse("'abcdef'.startsWith('def')");
  assertTrue("'abcdef'.startsWith('')");

  // String.prototype.endsWith
  assertTrue("'abcdef'.endsWith('def')");
  assertFalse("'abcdef'.endsWith('abc')");
  assertTrue("'abcdef'.endsWith('')");

  // String.prototype.contains
  assertTrue("'abcdef'.contains('bcd')");
  assertFalse("'abcdef'.contains('mno')");
  assertTrue("'abcdef'.contains('')");

  // String.prototype.toArray
  deepEqual(''.toArray(), []);
  deepEqual('abcdef'.toArray(), ['a', 'b', 'c', 'd', 'e', 'f']);
});

test("Identity Testing", function () {

  window.testobj1 = {};
  window.testobj2 = {};

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
        assertFalse("Object.isnt(" + examples[i] + "," + examples[j] + ")");
      } else {
        assertFalse("Object.is(" + examples[i] + "," + examples[j] + ")");
        assertTrue("Object.isnt(" + examples[i] + "," + examples[j] + ")");
      }
    }
  }

  delete window.testobj1;
  delete window.testobj2;
});

test("Simple Maps and Sets", 15, function () {

  map = new Map();
  assertFalse("map.has(-0)");
  assertFalse("map.has(0)");
  map.set(0, 1234);
  assertFalse("map.has(-0)");
  assertTrue("map.has(0)");
  assertEqual("map.get(0)", 1234);
  map['delete'](0);
  assertFalse("map.has(-0)");
  assertFalse("map.has(0)");
  map.set(0, 1234);
  map.clear();
  assertFalse("map.has(0)");
  delete map;

  set = new Set();
  assertFalse("set.has(-0)");
  assertFalse("set.has(0)");
  set.add(0);
  assertFalse("set.has(-0)");
  assertTrue("set.has(0)");
  set['delete'](0);
  assertFalse("set.has(-0)");
  assertFalse("set.has(0)");
  set.add(0);
  set.clear();
  assertFalse("set.has(0)");
  delete set;
});

test("WeakMap", function () {

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

  delete wm1;
  delete wm2;
  delete x;
  delete y;
  delete v;
});

test("Proposed Number extras", function () {
  // Number.compare
  assertTrue("'compare' in Number");
  assertTrue("typeof Number.compare === 'function'");
  assertTrue("Number.compare(0, 0) === 0");
  assertTrue("Number.compare(1, 0) === 1");
  assertTrue("Number.compare(0, 1) === -1");
  assertTrue("Number.compare(0, 0, 1) === 0");
  assertTrue("Number.compare(1, 0, 1) === 0");
  assertTrue("Number.compare(0, 1, 1) === 0");

  // Number.EPSILON
  assertTrue("'EPSILON' in Number");
  assertTrue("typeof Number.EPSILON === 'number'");
  assertTrue("(1 + Number.EPSILON) !== 1");
  assertFalse("(1 + Number.EPSILON/2) !== 1");

  // Number.MAX_INTEGER
  assertTrue("'MAX_INTEGER' in Number");
  assertTrue("typeof Number.MAX_INTEGER === 'number'");
  assertFalse("(Number.MAX_INTEGER + 1) > Number.MAX_INTEGER");
});

test("Proposed Array extras", function () {
  assertTrue("'of' in Array");
  assertTrue("typeof Array.of === 'function'");
  assertTrue("Array.of().length === 0");
  assertTrue("Array.of(1,2,3).length === 3");
  assertTrue("Array.of([1,2,3]).length === 1");
  deepEqual(Array.of(), []);
  deepEqual(Array.of(1), [1]);
  deepEqual(Array.of(1, 2), [1, 2]);
  deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  deepEqual(Array.of([]), [[]]);

  assertTrue("'from' in Array");
  assertTrue("typeof Array.from === 'function'");
  assertTrue("Array.from().length === 0");
  assertTrue("Array.from(1,2,3).length === 0");
  assertTrue("Array.from([1,2,3]).length === 3");
  deepEqual(Array.from([1, 2, 3]), [1, 2, 3]);
  deepEqual(Array.from({length: 0}), []);
  deepEqual(Array.from({length: 1}), [(void 0)]);
  deepEqual(Array.from({length: 0, 0: 'a'}), []);
  deepEqual(Array.from({length: 1, 0: 'a'}), ['a']);
  deepEqual(Array.from({length: 2, 1: 'a'}), [(void 0), 'a']);

  assertTrue("'pushAll' in Array.prototype");
  assertTrue("typeof Array.prototype.pushAll === 'function'");
  var a;
  a = []; a.pushAll([]); deepEqual(a, []);
  a = [1,2]; a.pushAll([]); deepEqual(a, [1,2]);
  a = []; a.pushAll([1,2]); deepEqual(a, [1,2]);
  a = [1,2]; a.pushAll([1,2]); deepEqual(a, [1,2,1,2]);

  assertTrue("'contains' in Array.prototype");
  assertTrue("typeof Array.prototype.contains === 'function'");
  assertTrue("[1,2,3].contains(1)");
  assertFalse("[1,2,3].contains(0)");
  assertTrue("[1,NaN,3].contains(NaN)");
  assertFalse("[1,2,3].contains(NaN)");
  assertTrue("[1,-0,3].contains(-0)");
  assertFalse("[1,-0,3].contains(0)");
  assertFalse("[1,[],3].contains([])");
  assertFalse("[1,{},3].contains({})");
  assertFalse("[1,2,3].contains(Math)");
  assertTrue("[1,Math,3].contains(Math)");
  assertFalse("[1,2,3].contains(undefined)");
  assertTrue("[1,undefined,3].contains(undefined)");
  assertFalse("[1,2,3].contains(null)");
  assertTrue("[1,null,3].contains(null)");

});

test("Proposed Unicode support String extras", function () {
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
  assertEqual("''.codePointAt(0)", NaN);
  assertEqual("'A'.codePointAt(1)", NaN);
  assertEqual("'AB'.codePointAt(1)", 66);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(0)", 0x10000);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(1)", 0xdc00);
  assertEqual("'\\ud800\\udc00\\udbff\\udfff'.codePointAt(2)", 0x10ffff);
});

