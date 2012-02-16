
test("Math extras", 133, function () {
  var EPSILON = 1e-5;

  // log10(x)
  assertEqual("Math.log10('')", NaN);
  assertEqual("Math.log10(NaN)", NaN);
  assertEqual("Math.log10(-1)", NaN);
  assertEqual("Math.log10(-0)", -Infinity);
  assertEqual("Math.log10(+0)", -Infinity);
  assertEqual("Math.log10(1)", +0);
  assertEqual("Math.log10(+Infinity)", +Infinity);
  assertEpsilon("Math.log10(0.5)", -0.30103, EPSILON);
  assertEpsilon("Math.log10(1.5)", 0.176091, EPSILON);

  // log2(x)
  assertEqual("Math.log2('')", NaN);
  assertEqual("Math.log2(NaN)", NaN);
  assertEqual("Math.log2(-1)", NaN);
  assertEqual("Math.log2(-0)", -Infinity);
  assertEqual("Math.log2(+0)", -Infinity);
  assertEqual("Math.log2(1)", +0);
  assertEqual("Math.log2(+Infinity)", +Infinity);
  assertEpsilon("Math.log2(0.5)", -1, EPSILON);
  assertEpsilon("Math.log2(1.5)", 0.584963, EPSILON);

  // log1p
  assertEqual("Math.log1p('')", NaN);
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
  assertEqual("Math.expm1('')", NaN);
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
  assertEqual("Math.cosh('')", NaN);
  assertEqual("Math.cosh(NaN)", NaN);
  assertEqual("Math.cosh(+0)", 1);
  assertEqual("Math.cosh(-0)", 1);
  assertEqual("Math.cosh(+Infinity)", +Infinity);
  assertEqual("Math.cosh(-Infinity)", +Infinity);
  assertEpsilon("Math.cosh(0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(-0.5)", 1.12763, EPSILON);
  assertEpsilon("Math.cosh(1.5)", 2.35241, EPSILON);

  // sinh(x)
  assertEqual("Math.sinh('')", NaN);
  assertEqual("Math.sinh(NaN)", NaN);
  assertEqual("Math.sinh(+0)", +0);
  assertEqual("Math.sinh(-0)", -0);
  assertEqual("Math.sinh(+Infinity)", +Infinity);
  assertEqual("Math.sinh(-Infinity)", -Infinity);
  assertEpsilon("Math.sinh(0.5)", 0.521095, EPSILON);
  assertEpsilon("Math.sinh(-0.5)", -0.521095, EPSILON);
  assertEpsilon("Math.sinh(1.5)", 2.12928, EPSILON);

  // tanh(x)
  assertEqual("Math.tanh('')", NaN);
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
  assertEqual("Math.asinh('')", NaN);
  assertEqual("Math.asinh(NaN)", NaN);
  assertEqual("Math.asinh(-0)", -0);
  assertEqual("Math.asinh(+0)", +0);
  assertEqual("Math.asinh(+Infinity)", +Infinity);
  assertEqual("Math.asinh(-Infinity)", -Infinity);
  assertEpsilon("Math.asinh(0.5)", 0.481212, EPSILON);
  assertEpsilon("Math.asinh(-0.5)", -0.481212, EPSILON);
  assertEpsilon("Math.asinh(1.5)", 1.19476, EPSILON);

  // atanh(x)
  assertEqual("Math.atanh('')", NaN);
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
  assertEqual("Math.hypot('', 0)", NaN);
  assertEqual("Math.hypot(0, '')", NaN);
  assertEqual("Math.hypot(NaN, 0)", NaN);
  assertEqual("Math.hypot(0, NaN)", NaN);
  assertEqual("Math.hypot(+0, -0)", +0);
  assertEqual("Math.hypot(+0, +0)", +0);
  assertEqual("Math.hypot(+0, +1)", +1);
  assertEqual("Math.hypot(+0, -1)", +1); // spec error, should be |y| ??
  assertEqual("Math.hypot(-0, -0)", +0);
  assertEqual("Math.hypot(-0, +0)", +0);
  assertEqual("Math.hypot(-0, +1)", +1);
  assertEqual("Math.hypot(-0, -1)", +1); // spec error, should be |y| ??
  assertEqual("Math.hypot(+Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(-Infinity, 0)", +Infinity);
  assertEqual("Math.hypot(0, +Infinity)", +Infinity);
  assertEqual("Math.hypot(0, -Infinity)", +Infinity);

  // trunc(x)
  assertEqual("Math.trunc('')", NaN);
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
  assertEqual("Math.sign('')", NaN);
  assertEqual("Math.sign(NaN)", NaN);
  assertEqual("Math.sign(-0)", -0);
  assertEqual("Math.sign(+0)", +0);
  assertEqual("Math.sign(-2)", -1);
  assertEqual("Math.sign(+2)", +1);
});

test("Number extras", 28, function () {
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

  // Number.toInteger
  assertEqual("Number.toInteger('')", 0);
  assertEqual("Number.toInteger(NaN)", 0);
  assertEqual("Number.toInteger(-Infinity)", -Infinity);
  assertEqual("Number.toInteger(+Infinity)", Infinity);
  assertEqual("Number.toInteger(0)", 0);
  assertEqual("Number.toInteger(-1)", -1);
  assertEqual("Number.toInteger(+1)", 1);
  assertEqual("Number.toInteger(-1.1)", -1);
  assertEqual("Number.toInteger(+1.1)", 1);
});

test("String extras", 15, function () {
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

  // TODO: Other string extras
});

test("Identity Testing", 578, function () {

  window.testobj1 = {};
  window.testobj2 = {};

  var examples = [
    "(void 0)",
    "null",
    "-Infinity",
    "-Number.MAX_VALUE",
    "-Number.MIN_VALUE",
    "-0",
    "0",
    "Number.MIN_VALUE",
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
  set.remove(0);
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
  equal(wm1.get(x), wm2.get(y));

  delete wm1;
  delete wm2;
  delete x;
  delete y;
  delete v;
});

test("Array extras", 15, function () {
  ok('of' in Array);
  ok(typeof Array.of === 'function');
  deepEqual(Array.of(), []);
  deepEqual(Array.of(1), [1]);
  deepEqual(Array.of(1, 2), [1, 2]);
  deepEqual(Array.of(1, 2, 3), [1, 2, 3]);
  deepEqual(Array.of([]), [[]]);

  ok('from' in Array);
  ok(typeof Array.from === 'function');
  deepEqual(Array.from([1, 2, 3]), [1, 2, 3]);
  deepEqual(Array.from({length: 0}), []);
  deepEqual(Array.from({length: 1}), [(void 0)]);
  deepEqual(Array.from({length: 0, 0: 'a'}), []);
  deepEqual(Array.from({length: 1, 0: 'a'}), ['a']);
  deepEqual(Array.from({length: 2, 1: 'a'}), [(void 0), 'a']);
});
