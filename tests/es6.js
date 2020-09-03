/*global QUnit*/
QUnit.assert.verifyIterator = function(iterator, expected) {
  while (true) {
    var result = iterator.next();
    if (result.done) {
      this.ok(expected.length === 0, 'Iterator completed as expected');
      return;
    } else {
      var ex = expected.shift();
      this.equal(result.done, false, 'Iterator still going');
      this.deepEqual(result.value, ex, 'Iterator had expected: ' + ex);
    }
  }
};

QUnit.assert.epsilon = function(actual, expected, epsilon) {
  var ok = actual === expected ||
        Math.abs((actual - expected)/Math.max(Math.abs(actual), Math.abs(expected))) < epsilon;
  this.pushResult({ result: ok,
                    actual: actual,
                    expected: expected,
                    message: String(actual) + ' ~= ' + String(expected)});
};


(function() {
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
    'String.prototype.startsWith',

    'Reflect.apply',
    'Reflect.construct',
    'Reflect.defineProperty',
    'Reflect.deleteProperty',
    'Reflect.enumerate', // Removed in later editions, so this is expected.
    'Reflect.get',
    'Reflect.getOwnPropertyDescriptor',
    'Reflect.getPrototypeOf',
    'Reflect.has',
    'Reflect.isExtensible',
    'Reflect.ownKeys',
    'Reflect.preventExtensions',
    'Reflect.set',
    'Reflect.setPrototypeOf'

  ];

  var nativeFunctions = functions.filter(isNative);
  var polyfilledFunctions = functions.filter(negate(isNative));

  document.querySelector('#nativeFunctions').appendChild(document.createTextNode(
            nativeFunctions.join(' ')));
  document.querySelector('#polyfilledFunctions').appendChild(document.createTextNode(
            polyfilledFunctions.join(' ')));
})();


QUnit.module("Extras");

QUnit.test("Math", function(assert) {
  var EPSILON = 1e-5;

  // log10(x)
  assert.equal(Math.log10(''), Math.log10(0));
  assert.deepEqual(Math.log10(NaN), NaN);
  assert.deepEqual(Math.log10(-1), NaN);
  assert.equal(Math.log10(+0), -Infinity);
  assert.equal(Math.log10(-0), -Infinity);
  assert.equal(Math.log10(1), +0);
  assert.equal(Math.log10(+Infinity), +Infinity);

  assert.epsilon(Math.log10(0.5), -0.30103, EPSILON);
  assert.epsilon(Math.log10(1.5), 0.176091, EPSILON);

  // log2(x)
  assert.equal(Math.log2(''), Math.log2(0));
  assert.deepEqual(Math.log2(NaN), NaN);
  assert.deepEqual(Math.log2(-1), NaN);
  assert.equal(Math.log2(+0), -Infinity);
  assert.equal(Math.log2(-0), -Infinity);
  assert.equal(Math.log2(1), +0);
  assert.equal(Math.log2(+Infinity), +Infinity);

  assert.epsilon(Math.log2(0.5), -1, EPSILON);
  assert.epsilon(Math.log2(1.5), 0.584963, EPSILON);

  // log1p
  assert.equal(Math.log1p(''), Math.log1p(0));
  assert.deepEqual(Math.log1p(NaN), NaN);
  assert.deepEqual(Math.log1p(-2), NaN);
  assert.equal(Math.log1p(-1), -Infinity);
  assert.equal(Math.log1p(+0), +0);
  assert.equal(Math.log1p(-0), -0);
  assert.equal(Math.log1p(+Infinity), +Infinity);

  assert.epsilon(Math.log1p(0.5), 0.405465, EPSILON);
  assert.epsilon(Math.log1p(-0.5), -0.693147, EPSILON);
  assert.epsilon(Math.log1p(1.5), 0.916291, EPSILON);
  // tests from: http://www.johndcook.com/cpp_expm1.html
  assert.epsilon(Math.log1p(-0.632120558828558), -1, EPSILON);
  assert.epsilon(Math.log1p(0.0), 0.0, EPSILON);
  assert.epsilon(Math.log1p(0.000009990049900216168), 1e-5 - 1e-8, EPSILON);
  assert.epsilon(Math.log1p(0.00001001005010021717), 1e-5 + 1e-8, EPSILON);
  assert.epsilon(Math.log1p(0.6487212707001282), 0.5, EPSILON);

  // exp1m
  assert.equal(Math.expm1(''), Math.expm1(0));
  assert.deepEqual(Math.expm1(NaN), NaN);
  assert.equal(Math.expm1(+0), +0);
  assert.equal(Math.expm1(-0), -0);
  assert.equal(Math.expm1(+Infinity), +Infinity);
  assert.equal(Math.expm1(-Infinity), -1);

  assert.epsilon(Math.expm1(0.5), 0.648721, EPSILON);
  assert.epsilon(Math.expm1(-0.5), -0.393469, EPSILON);
  assert.epsilon(Math.expm1(1.5), 3.48169, EPSILON);
  // tests from: http://www.johndcook.com/cpp_expm1.html
  assert.epsilon(Math.expm1(-1), -0.632120558828558, EPSILON);
  assert.epsilon(Math.expm1(0.0), 0.0, EPSILON);
  assert.epsilon(Math.expm1(1e-5 - 1e-8), 0.000009990049900216168, EPSILON);
  assert.epsilon(Math.expm1(1e-5 + 1e-8), 0.00001001005010021717, EPSILON);
  assert.epsilon(Math.expm1(0.5), 0.6487212707001282, EPSILON);

  // cosh(x)
  assert.equal(Math.cosh(''), Math.cosh(0));
  assert.deepEqual(Math.cosh(NaN), NaN);
  assert.equal(Math.cosh(+0), 1);
  assert.equal(Math.cosh(-0), 1);
  assert.equal(Math.cosh(+Infinity), +Infinity);
  assert.equal(Math.cosh(-Infinity), +Infinity);
  assert.epsilon(Math.cosh(0.5), 1.12763, EPSILON);
  assert.epsilon(Math.cosh(-0.5), 1.12763, EPSILON);
  assert.epsilon(Math.cosh(1.5), 2.35241, EPSILON);

  // sinh(x)
  assert.equal(Math.sinh(''), Math.sinh(0));
  assert.deepEqual(Math.sinh(NaN), NaN);
  assert.equal(Math.sinh(+0), +0);
  assert.equal(Math.sinh(-0), -0);
  assert.equal(Math.sinh(+Infinity), +Infinity);
  assert.equal(Math.sinh(-Infinity), -Infinity);
  assert.epsilon(Math.sinh(0.5), 0.521095, EPSILON);
  assert.epsilon(Math.sinh(-0.5), -0.521095, EPSILON);
  assert.epsilon(Math.sinh(1.5), 2.12928, EPSILON);

  // tanh(x)
  assert.equal(Math.tanh(''), Math.tanh(0));
  assert.deepEqual(Math.tanh(NaN), NaN);
  assert.equal(Math.tanh(+0), +0);
  assert.equal(Math.tanh(-0), -0);
  assert.equal(Math.tanh(+Infinity), +1);
  assert.equal(Math.tanh(-Infinity), -1);
  assert.epsilon(Math.tanh(0.5), 0.462117, EPSILON);
  assert.epsilon(Math.tanh(-0.5), -0.462117, EPSILON);
  assert.epsilon(Math.tanh(1.5), 0.905148, EPSILON);

  // acosh(x)
  assert.deepEqual(Math.acosh(''), Math.acosh(0));
  assert.deepEqual(Math.acosh(NaN), NaN);
  assert.deepEqual(Math.acosh(-1), NaN);
  assert.equal(Math.acosh(1), +0);
  assert.equal(Math.acosh(+Infinity), +Infinity);
  assert.epsilon(Math.acosh(1.5), 0.962424, EPSILON);

  // asinh(x)
  assert.equal(Math.asinh(''), Math.asinh(0));
  assert.deepEqual(Math.asinh(NaN), NaN);
  assert.equal(Math.asinh(+0), +0);
  assert.equal(Math.asinh(-0), -0);
  assert.equal(Math.asinh(+Infinity), +Infinity);
  assert.equal(Math.asinh(-Infinity), -Infinity);
  assert.epsilon(Math.asinh(0.5), 0.481212, EPSILON);
  assert.epsilon(Math.asinh(-0.5), -0.481212, EPSILON);
  assert.epsilon(Math.asinh(1.5), 1.19476, EPSILON);

  // atanh(x)
  assert.equal(Math.atanh(''), Math.atanh(0));
  assert.deepEqual(Math.atanh(NaN), NaN);
  assert.deepEqual(Math.atanh(-2), NaN);
  assert.deepEqual(Math.atanh(+2), NaN);
  assert.equal(Math.atanh(-1), -Infinity);
  assert.equal(Math.atanh(+1), +Infinity);
  assert.equal(Math.atanh(+0), +0);
  assert.equal(Math.atanh(-0), -0);
  assert.epsilon(Math.atanh(0.5), 0.549306, EPSILON);
  assert.epsilon(Math.atanh(-0.5), -0.549306, EPSILON);

  // hypot(x)
  assert.equal(Math.hypot('', 0), Math.hypot(0, 0));
  assert.equal(Math.hypot(0, ''), Math.hypot(0, 0));
  assert.equal(Math.hypot(+Infinity, 0), +Infinity);
  assert.equal(Math.hypot(-Infinity, 0), +Infinity);
  assert.equal(Math.hypot(0, +Infinity), +Infinity);
  assert.equal(Math.hypot(0, -Infinity), +Infinity);
  assert.equal(Math.hypot(Infinity, NaN), +Infinity);
  assert.deepEqual(Math.hypot(NaN, -Infinity), +Infinity);
  assert.deepEqual(Math.hypot(NaN, 0), NaN);
  assert.deepEqual(Math.hypot(0, NaN), NaN);
  assert.equal(Math.hypot(+0, -0), +0);
  assert.equal(Math.hypot(+0, +0), +0);
  assert.equal(Math.hypot(-0, -0), +0);
  assert.equal(Math.hypot(-0, +0), +0);
  assert.equal(Math.hypot(+0, +1), +1);
  assert.equal(Math.hypot(+0, -1), +1);
  assert.equal(Math.hypot(-0, +1), +1);
  assert.equal(Math.hypot(-0, -1), +1);
  assert.equal(Math.hypot(0), 0);
  assert.equal(Math.hypot(1), 1);
  assert.equal(Math.hypot(2), 2);
  assert.equal(Math.hypot(0,0,1), 1);
  assert.equal(Math.hypot(0,1,0), 1);
  assert.equal(Math.hypot(1,0,0), 1);
  assert.equal(Math.hypot(2,3,4), Math.sqrt(2*2 + 3*3 + 4*4));
  assert.equal(Math.hypot(2,3,4,5), Math.sqrt(2*2 + 3*3 + 4*4 + 5*5));
  assert.equal(Math.hypot(1e+300, 1e+300), 1.4142135623730952e+300);
  assert.equal(Math.hypot(1e+300, 1e+300, 1e+300), 1.7320508075688774e+300);
  assert.equal(Math.hypot(1e-300, 1e-300), 1.4142135623730952e-300);
  assert.equal(Math.hypot(1e-300, 1e-300, 1e-300), 1.7320508075688774e-300);
  var c = 0;
  assert.equal(Math.hypot({valueOf:function() { if (c++) throw c; return c; }}), 1);

  // trunc(x)
  assert.equal(Math.trunc(''), Math.trunc(0));
  assert.deepEqual(Math.trunc(NaN), NaN);
  assert.equal(Math.trunc(-0), -0);
  assert.equal(Math.trunc(+0), +0);
  assert.equal(Math.trunc(+Infinity), +Infinity);
  assert.equal(Math.trunc(-Infinity), -Infinity);
  assert.equal(Math.trunc(-2), -2);
  assert.equal(Math.trunc(-1.5), -1);
  assert.equal(Math.trunc(-1), -1);
  assert.equal(Math.trunc(-0.5), -0);
  assert.equal(Math.trunc(0), 0);
  assert.equal(Math.trunc(0.5), 0);
  assert.equal(Math.trunc(1), 1);
  assert.equal(Math.trunc(1.5), 1);
  assert.equal(Math.trunc(2), 2);

  // sign(x)
  assert.equal(Math.sign(''), Math.sign(0));
  assert.deepEqual(Math.sign(NaN), NaN);
  assert.equal(Math.sign(-0), -0);
  assert.equal(Math.sign(+0), +0);
  assert.equal(Math.sign(-2), -1);
  assert.equal(Math.sign(+2), +1);

  // cbrt(x)
  assert.equal(Math.cbrt(''), Math.cbrt(0));
  assert.deepEqual(Math.cbrt(NaN), NaN);
  assert.equal(Math.cbrt(+0), +0);
  assert.equal(Math.cbrt(-0), -0);
  assert.equal(Math.cbrt(+Infinity), +Infinity);
  assert.equal(Math.cbrt(-Infinity), -Infinity);
  assert.equal(Math.cbrt(-1), -1);
  assert.equal(Math.cbrt(1), 1);
  assert.equal(Math.cbrt(-27), -3);
  assert.equal(Math.cbrt(27), 3);

  // imul(x,y)
  assert.equal(Math.imul(0,0), 0);
  assert.equal(Math.imul(123,456), 56088);
  assert.equal(Math.imul(-123,456), -56088);
  assert.equal(Math.imul(123,-456), -56088);
  assert.equal(Math.imul(0x01234567, 0xfedcba98), 602016552);


  // Number.prototype.clz()
  assert.equal(Math.clz32(-1), 0);
  assert.equal(Math.clz32(0xffffffff), 0);
  assert.equal(Math.clz32(0x80000000), 0);
  assert.equal(Math.clz32(1<<31), 0);
  assert.equal(Math.clz32(1<<30), 1);
  assert.equal(Math.clz32(1<<29), 2);
  assert.equal(Math.clz32(1<<28), 3);
  assert.equal(Math.clz32(1<<27), 4);
  assert.equal(Math.clz32(1<<26), 5);
  assert.equal(Math.clz32(1<<25), 6);
  assert.equal(Math.clz32(1<<24), 7);
  assert.equal(Math.clz32(1<<23), 8);
  assert.equal(Math.clz32(1<<22), 9);
  assert.equal(Math.clz32(1<<21), 10);
  assert.equal(Math.clz32(1<<20), 11);
  assert.equal(Math.clz32(1<<19), 12);
  assert.equal(Math.clz32(1<<18), 13);
  assert.equal(Math.clz32(1<<17), 14);
  assert.equal(Math.clz32(1<<16), 15);
  assert.equal(Math.clz32(1<<15), 16);
  assert.equal(Math.clz32(1<<14), 17);
  assert.equal(Math.clz32(1<<13), 18);
  assert.equal(Math.clz32(1<<12), 19);
  assert.equal(Math.clz32(1<<11), 20);
  assert.equal(Math.clz32(1<<10), 21);
  assert.equal(Math.clz32(1<<9), 22);
  assert.equal(Math.clz32(1<<8), 23);
  assert.equal(Math.clz32(1<<7), 24);
  assert.equal(Math.clz32(1<<6), 25);
  assert.equal(Math.clz32(1<<5), 26);
  assert.equal(Math.clz32(1<<4), 27);
  assert.equal(Math.clz32(1<<3), 28);
  assert.equal(Math.clz32(1<<2), 29);
  assert.equal(Math.clz32(1<<1), 30);
  assert.equal(Math.clz32(1), 31);
  assert.equal(Math.clz32(0), 32);
});

QUnit.test("Number", function(assert) {
  // Number.EPSILON
  assert.ok('EPSILON' in Number);
  assert.equal(typeof Number.EPSILON, 'number');
  assert.ok((1 + Number.EPSILON) !== 1);
  assert.notOk((1 + Number.EPSILON/2) !== 1);

  // Number.MAX_SAFE_INTEGER
  assert.ok('MAX_SAFE_INTEGER' in Number);
  assert.equal(typeof Number.MAX_SAFE_INTEGER, 'number');
  assert.notOk((Number.MAX_SAFE_INTEGER + 2) > (Number.MAX_SAFE_INTEGER + 1));

  // Number.MIN_SAFE_INTEGER
  assert.ok('MIN_SAFE_INTEGER' in Number);
  assert.equal(typeof Number.MIN_SAFE_INTEGER, 'number');
  assert.equal(Number.MIN_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER);

  assert.equal(Number.parseInt, parseInt, 'Number.parseInt is the same function as parseInt');
  assert.equal(Number.parseFloat, parseFloat, 'Number.parseFloat is the same function as parseFloat');

  // Number.isNaN
  assert.notOk(Number.isNaN(''));
  assert.ok(Number.isNaN(NaN));
  assert.notOk(Number.isNaN(0));

  // Number.isFinite
  assert.notOk(Number.isFinite(''));
  assert.notOk(Number.isFinite(NaN));
  assert.notOk(Number.isFinite(-Infinity));
  assert.notOk(Number.isFinite(+Infinity));
  assert.ok(Number.isFinite(0));
  assert.ok(Number.isFinite(-1));
  assert.ok(Number.isFinite(+1));

  // Number.isInteger
  assert.notOk(Number.isInteger(''));
  assert.notOk(Number.isInteger(NaN));
  assert.notOk(Number.isInteger(-Infinity));
  assert.notOk(Number.isInteger(+Infinity));
  assert.ok(Number.isInteger(0));
  assert.ok(Number.isInteger(-1));
  assert.ok(Number.isInteger(+1));
  assert.notOk(Number.isInteger(-1.1));
  assert.notOk(Number.isInteger(+1.1));

  // Number.isSafeInteger
  assert.notOk(Number.isSafeInteger(''), 0);
  assert.notOk(Number.isSafeInteger(NaN), 0);
  assert.notOk(Number.isSafeInteger(-Infinity), -Infinity);
  assert.notOk(Number.isSafeInteger(+Infinity), Infinity);
  assert.ok(Number.isSafeInteger(0), 0);
  assert.ok(Number.isSafeInteger(-1), -1);
  assert.ok(Number.isSafeInteger(+1), 1);
  assert.notOk(Number.isSafeInteger(-1.1), -1);
  assert.notOk(Number.isSafeInteger(+1.1), 1);
  assert.ok(Number.isSafeInteger(Math.pow(2,53)-1), 1);
  assert.ok(Number.isSafeInteger(-Math.pow(2,53)+1), 1);
  assert.notOk(Number.isSafeInteger(Math.pow(2,53)), 1);
  assert.notOk(Number.isSafeInteger(-Math.pow(2,53)), 1);
});


QUnit.test("String", function(assert) {
  // String.prototype.repeat
  assert.equal(''.repeat(NaN), '');
  assert.equal(''.repeat(0), '');
  assert.throws(function() { ''.repeat(-1); });
  assert.throws(function() { 'a'.repeat(Infinity); });
  assert.equal(''.repeat(1), '');
  assert.equal(''.repeat(10), '');
  assert.equal('a'.repeat(NaN), '');
  assert.equal('a'.repeat(0), '');
  assert.throws(function() { 'a'.repeat(-1); });
  assert.throws(function() { 'a'.repeat(Infinity); });
  assert.equal('a'.repeat(1), 'a');
  assert.equal('a'.repeat(10), 'aaaaaaaaaa');
  assert.equal('ab'.repeat(NaN), '');
  assert.equal('ab'.repeat(0), '');
  assert.throws(function() { 'ab'.repeat(-1); });
  assert.throws(function() { 'ab'.repeat(Infinity); });
  assert.equal('ab'.repeat(1), 'ab');
  assert.equal('ab'.repeat(10), 'abababababababababab');
  assert.equal(String.prototype.repeat.length, 1);

  // String.prototype.startsWith
  assert.ok('abcdef'.startsWith('abc'));
  assert.notOk('abcdef'.startsWith('def'));
  assert.ok('abcdef'.startsWith(''));
  assert.ok('abcdef'.startsWith('bc', 1));
  assert.ok(String.prototype.startsWith.length, 1);

  // String.prototype.endsWith
  assert.ok('abcdef'.endsWith('def'));
  assert.notOk('abcdef'.endsWith('abc'));
  assert.ok('abcdef'.endsWith(''));
  assert.ok('abcdef'.endsWith('de', 5));
  assert.ok(String.prototype.endsWith.length, 1);

  // String.prototype.includes
  assert.ok('abcdef'.includes('bcd'));
  assert.notOk('abcdef'.includes('mno'));
  assert.ok('abcdef'.includes(''));
  assert.ok(String.prototype.includes.length, 1);
});

QUnit.test("String - Unicode helpers", function(assert) {
  // String.fromCodePoint
  assert.equal(String.fromCodePoint(0), "\x00");
  assert.equal(String.fromCodePoint(65), "A");
  assert.equal(String.fromCodePoint(65, 66, 67), "ABC");
  assert.equal(String.fromCodePoint(0x0100), "\u0100");
  assert.equal(String.fromCodePoint(0x1000), "\u1000");
  assert.equal(String.fromCodePoint(0xd800), "\ud800");
  assert.equal(String.fromCodePoint(0xdc00), "\udc00");
  assert.equal(String.fromCodePoint(0xfffd), "\ufffd");
  assert.equal(String.fromCodePoint(0x010000), "\ud800\udc00");
  assert.equal(String.fromCodePoint(0x10ffff), "\udbff\udfff");

  // String.prototype.codePointAt
  assert.equal('\x00'.codePointAt(0), 0);
  assert.equal('A'.codePointAt(0), 65);
  assert.equal('\u0100'.codePointAt(0), 0x100);
  assert.equal('\u1000'.codePointAt(0), 0x1000);
  assert.equal('\ud800'.codePointAt(0), 0xd800);
  assert.equal('\udc00'.codePointAt(0), 0xdc00);
  assert.equal('\ufffd'.codePointAt(0), 0xfffd);
  assert.equal('\ud800\udc00'.codePointAt(0), 0x10000);
  assert.equal('\udbff\udfff'.codePointAt(0), 0x10ffff);
  assert.equal(''.codePointAt(0), undefined);
  assert.equal('A'.codePointAt(1), undefined);
  assert.equal('AB'.codePointAt(1), 66);
  assert.equal('\ud800\udc00\udbff\udfff'.codePointAt(0), 0x10000);
  assert.equal('\ud800\udc00\udbff\udfff'.codePointAt(1), 0xdc00);
  assert.equal('\ud800\udc00\udbff\udfff'.codePointAt(2), 0x10ffff);
});

QUnit.test("String Iterators", function(assert) {
  assert.ok(Symbol.iterator in String.prototype);
  assert.verifyIterator(('ABC')[Symbol.iterator](), ['A', 'B', 'C']);
});

QUnit.test("Array", function(assert) {
  assert.ok('of' in Array);
  assert.equal(typeof Array.of, 'function');
  assert.equal(Array.of.length, 0);
  assert.equal(Array.of(1,2,3).length, 3);
  assert.equal(Array.of([1,2,3]).length, 1);
  assert.deepEqual(Array.of(), [], 'Array.of with no arguments');
  assert.deepEqual(Array.of(1), [1], 'Array.of with one argument');
  assert.deepEqual(Array.of(1, 2), [1, 2], 'Array.of with two arguments');
  assert.deepEqual(Array.of(1, 2, 3), [1, 2, 3], 'Array.of with three arguments');
  assert.deepEqual(Array.of([]), [[]], 'Array.of with array argument');

  assert.ok('from' in Array);
  assert.equal(typeof Array.from, 'function');
  assert.equal(Array.from.length, 1);
  assert.throws(function() { Array.from(1,2,3); });
  assert.equal(Array.from([1,2,3]).length, 3);
  assert.deepEqual(Array.from([1, 2, 3]), [1, 2, 3], 'Array.from on array');
  assert.deepEqual(Array.from({length: 0}), [], 'Array.from on empty arraylike');
  assert.deepEqual(Array.from({length: 1}), [(void 0)], 'Array.from on empty sparse arraylike');
  assert.deepEqual(Array.from({length: 0, 0: 'a'}), [], 'Array.from on arraylike');
  assert.deepEqual(Array.from({length: 1, 0: 'a'}), ['a'], 'Array.from on arraylike');
  assert.deepEqual(Array.from({length: 2, 1: 'a'}), [(void 0), 'a'], 'Array.from on sparse arraylike');
  assert.deepEqual(Array.from([1,2,3], function(x) { return x * x; }), [1, 4, 9], 'Array.from with mapfn');

  assert.deepEqual([1,2,3,4].fill(5), [5,5,5,5], 'Array.fill');
  assert.deepEqual([1,2,3,4].fill(5, 1), [1,5,5,5], 'Array.fill with start');
  assert.deepEqual([1,2,3,4].fill(5, 1, 3), [1,5,5,4], 'Array.fill with start and end');
  assert.deepEqual([1,2,3,4].fill(5, -3), [1,5,5,5], 'Array.fill with negative start');
  assert.deepEqual([1,2,3,4].fill(5, -3, -1), [1,5,5,4], 'Array.fill with negative start and end');
  assert.equal(Array.prototype.fill.length, 1, 'Array.fill function length');

  assert.deepEqual([0,1,2,3,4].copyWithin(3, 0, 2), [0,1,2,0,1], 'Array.copyWithin with start and end');
  assert.deepEqual([0,1,2,3,4].copyWithin(0, 3), [3,4,2,3,4], 'Array.copyWithin with start');
  assert.deepEqual([0,1,2,3,4].copyWithin(0, 2, 5), [2,3,4,3,4], 'Array.copyWithin');
  assert.deepEqual([0,1,2,3,4].copyWithin(2, 0, 3), [0,1,0,1,2], 'Array.copyWithin');
  assert.equal(Array.prototype.copyWithin.length, 2, 'Array.copyWithin function length');

  assert.equal(String([].entries()), "[object Array Iterator]");
  assert.equal(Object.prototype.toString.call([].entries()), "[object Array Iterator]");
});

QUnit.test("Array Iterators", function(assert) {
  assert.ok(Symbol.iterator in Array.prototype);
  assert.verifyIterator([1,2,3][Symbol.iterator](), [1,2,3]);
  assert.verifyIterator(['A','B','C'].keys(), [0,1,2]);
  assert.verifyIterator(['A','B','C'].values(), ['A','B','C']);
  assert.verifyIterator(['A','B','C'].entries(), [[0,'A'],[1,'B'],[2,'C']]);
});

QUnit.test("Array.prototype.find/findIndex", function(assert) {
  var array = ["a", "b", NaN];

  assert.equal(array.find(function(v) { return v === 'a'; }), "a");
  assert.deepEqual(array.find(function(v) { return v !== v; }), NaN);
  assert.equal(array.find(function(v) { return v === 'z'; }), undefined);

  assert.equal(array.findIndex(function(v) { return v === 'a'; }), 0);
  assert.equal(array.findIndex(function(v) { return v !== v; }), 2);
  assert.equal(array.findIndex(function(v) { return v === 'z'; }), -1);
});

QUnit.test("Object", function(assert) {

  var testobj1 = {};
  var testobj2 = {};

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
        assert.ok(Object.is(examples[i], examples[j]));
      } else {
        assert.notOk(Object.is(examples[i], examples[j]));
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
  assert.equal(t.a, 1, "Object.assign copies basic properties");
  assert.equal(t.b, 2, "Object.assign copies getters by value");
  assert.equal(t.c, 3, "Object.assign leaves existing properties intact");

  t = Object.assign({a: 1}, {b: 2}, {c: 3});
  assert.deepEqual(t, {a: 1, b: 2, c: 3}, "Object.assign copies multiple sources");

  assert.deepEqual(Object.keys(Object.assign({a:1}, null)), ['a'],
                   'Object.assign(o, null) does not throw');
  assert.deepEqual(Object.keys(Object.assign({a:1}, undefined)), ['a'],
                   'Object.assign(o, undefined) does not throw');
});

QUnit.test("Typed Array", function(assert) {
  assert.deepEqual(Uint8Array.from([1,2,3]), new Uint8Array([1,2,3]), 'Typed Array from() array');
  assert.deepEqual(Uint8Array.from({0:1,1:2,2:3,length:3}), new Uint8Array([1,2,3]), 'Typed Array from() arraylike');

  assert.deepEqual(Uint8Array.of(1,2,3), new Uint8Array([1,2,3]), 'Typed Array of()');

  assert.deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(3, 0, 2), new Uint8Array([0,1,2,0,1]), 'Typed Array copyWithin()');
  assert.deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(0, 3), new Uint8Array([3,4,2,3,4]), 'Typed Array copyWithin()');
  assert.deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(0, 2, 5), new Uint8Array([2,3,4,3,4]), 'Typed Array copyWithin()');
  assert.deepEqual(new Uint8Array([0,1,2,3,4]).copyWithin(2, 0, 3), new Uint8Array([0,1,0,1,2]), 'Typed Array copyWithin()');

  assert.ok(new Uint8Array([1,3,5]).every(function(n){return n%2;}));
  assert.notOk(new Uint8Array([1,3,6]).every(function(n){return n%2;}));

  assert.deepEqual(Array.from(new Uint8Array(3).fill(9)), [9,9,9], 'Typed Array fill()');
  assert.deepEqual(Array.from(new Uint8Array([0,1,2,3,4]).filter(function(n){return n%2;})), [1,3], 'Typed Array fillter()');
  assert.deepEqual(new Uint8Array([1,2,3,4]).find(function(n){return n>2;}), 3, 'Typed Array find()');
  assert.deepEqual(new Uint8Array([1,2,3,4]).findIndex(function(n){return n>2;}), 2, 'Typed Array findIndex()');

  var data = [11, 22, 33], count = 0;
  var array = new Uint8Array(data);
  array.forEach(function(v, k, a) {
    assert.equal(v, data[count], 'Typed Array forEach() value argument');
    assert.equal(k, count, 'Typed Array forEach() key argument');
    assert.equal(a, array, 'Typed Array forEach() array argument');
    ++count;
  });
  assert.equal(count, data.length, 'Typed Array forEach() correct count');

  assert.deepEqual(new Uint8Array([1,2,3,1,2,3]).indexOf(3), 2, 'Typed Array indexOf()');
  assert.deepEqual(new Uint8Array([1,2,3,4]).join('-'), "1-2-3-4", 'Typed Array join()');

  assert.deepEqual(new Uint8Array([1,2,3,1,2,3]).lastIndexOf(3), 5, 'Typed Array lastIndexOf()');
  assert.deepEqual(Array.from(new Uint8Array([0,1,2,3]).map(function(n){return n*2;})), [0,2,4,6], 'Typed Array map()');
  assert.deepEqual(new Uint8Array([0,1,2,3]).reduce(function(a,b){return a-b;}), -6, 'Typed Array reduce()');
  assert.deepEqual(new Uint8Array([0,1,2,3]).reduceRight(function(a,b){return a-b;}), 0, 'Typed Array reduceRight()');
  assert.deepEqual(Array.from(new Uint8Array([0,1,2,3]).reverse()), [3,2,1,0], 'Typed Array reverse');

  assert.deepEqual(Array.from(new Uint8Array([1,2,3,4]).slice()), [1,2,3,4], 'Typed Array slice()');
  assert.deepEqual(Array.from(new Uint8Array([1,2,3,4]).slice(2,4)), [3,4], 'Typed Array slice() range');

  assert.notOk(new Uint8Array([1,3,5]).some(function(n){return n%2===0;}));
  assert.ok(new Uint8Array([1,3,6]).some(function(n){return n%2===0;}));

  assert.deepEqual(Array.from(new Float32Array([Infinity,NaN,10,2]).sort()), [2,10,Infinity,NaN]);

  assert.verifyIterator(new Uint8Array([11,22,33]).values(), [11,22,33]);
  assert.verifyIterator(new Uint8Array([11,22,33]).keys(), [0,1,2]);
  assert.verifyIterator(new Uint8Array([11,22,33]).entries(), [[0,11], [1,22], [2,33]]);

  ['Int8Array', 'Uint8Array', 'Uint8ClampedArray',
   'Int16Array', 'Uint16Array',
   'Int32Array', 'Uint32Array',
   'Float32Array', 'Float64Array'].forEach(function(typeName) {
     var type = self[typeName];
     ['from', 'of'].forEach(function(member) {
       assert.ok(member in type, typeName + ' has ' + member);
     });
     ['copyWithin', 'entries', 'every', 'fill', 'filter',
      'find','findIndex', 'forEach', 'indexOf', 'join',
      'keys', 'lastIndexOf', 'map', 'reduce', 'reduceRight',
      'reverse', 'slice', 'some', 'sort', 'values' ].forEach(function(member) {
        assert.ok(member in type.prototype, typeName + ' has ' + member);
      });
   });
});

QUnit.test("RegExp", function(assert) {
  assert.ok(Symbol.replace in /.*/);

  assert.equal(/a/[Symbol.replace]('california', 'x'), 'cxlifornia');
  assert.equal(/a/g[Symbol.replace]('california', 'x'), 'cxlifornix');

  assert.ok(Symbol.search in /.*/);
  assert.equal(/a/[Symbol.search]('california', 'x'), 1);

  assert.ok(Symbol.split in /.*/);
  assert.deepEqual(/a/[Symbol.split]('california'), ['c', 'liforni', ''], 'RegExp split()');

  assert.ok(Symbol.match in /.*/);
  assert.deepEqual(/(.a)/g[Symbol.match]('california'), ['ca', 'ia'], 'RegExp match()');

  assert.equal((/abc/).flags, '');
  assert.equal((/abc/g).flags, 'g');
  assert.equal((/abc/gim).flags, 'gim');
  assert.equal((/abc/mig).flags, 'gim');
});

QUnit.test("RegExp dispatch", function(assert) {
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

  assert.equal('abc'.match(rx), 1);
  assert.equal('abc'.replace(rx), 2);
  assert.equal('abc'.search(rx), 3);
  assert.equal('abc'.split(rx), 4);

  assert.deepEqual(calls, ['match', 'replace', 'search', 'split']);
});

QUnit.module("Symbols");

QUnit.test("Symbol", function(assert) {
  assert.throws(function() { new Symbol; });
  var s = Symbol();
  var t = Symbol();
  var o = {};
  assert.equal(o[s] = 1, 1);
  assert.ok(s in o);
  assert.notOk(t in o);
  assert.notOk(s === t);
  assert.equal(o[s], 1);

  assert.ok(Symbol.toStringTag !== null);
  assert.ok(Symbol.iterator !== null);

  assert.ok(Symbol.iterator in Array.prototype);
  assert.ok(Symbol.iterator in Map.prototype);
  assert.ok(Symbol.iterator in Set.prototype);

  assert.equal(Symbol.keyFor(Symbol['for']('key')), 'key');

  o = {};
  o['a'] = 1;
  Object.defineProperty(o, 'b', {value: 2});
  o[s] = 3;
  Object.defineProperty(o, t, {value: 2});
  assert.equal(Object.getOwnPropertyNames(o).length, 2);
  assert.notOk(Object.getOwnPropertyNames(o).indexOf("a") === -1);
  assert.notOk(Object.getOwnPropertyNames(o).indexOf("b") === -1);
  assert.equal(Object.getOwnPropertyNames(o).indexOf(s), -1);
  assert.equal(Object.getOwnPropertySymbols(o).length, 2);
  assert.notOk(Object.getOwnPropertySymbols(o).indexOf(s) === -1);
  assert.notOk(Object.getOwnPropertySymbols(o).indexOf(t) === -1);
  assert.equal(Object.getOwnPropertySymbols(o).indexOf("a"), -1);
  assert.equal(Object.keys(o).length, 1);
  assert.notOk(Object.keys(o).indexOf("a") === -1);
  assert.equal(Object.keys(o).indexOf("b"), -1);
  assert.equal(Object.keys(o).indexOf(s), -1);


  assert.equal(Symbol.prototype[Symbol.toStringTag], 'Symbol');
  assert.equal(Object.prototype.toString.call(Symbol()), '[object Symbol]');

  // Conversions:
  // https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-07/jul-29.md
  (function() {
    var aSymbol = Symbol();
    assert.equal(aSymbol === "not a symbol", false, 'symbols not equal to string'); // == does valueOf conversion and throws
    var s = Symbol();
    assert.ok(s == Object(s), 'Object(symbol) yields the symbol');
    assert.throws(function() { return "foo" + aSymbol; }, TypeError, 'Symbols don\'t auto-convert to strings');
    assert.throws(function() { return aSymbol + "foo"; }, TypeError, 'Symbols don\'t auto-convert to strings');
    assert.throws(function() { return Number(aSymbol); }, TypeError, 'Symbols don\'t auto-convert to numbers');
  }());

  assert.ok(Symbol.match !== undefined);
  assert.ok(Symbol.replace !== undefined);
  assert.ok(Symbol.search !== undefined);
  assert.ok(Symbol.split !== undefined);

  assert.ok(Symbol.match in RegExp.prototype);
  assert.ok(Symbol.replace in RegExp.prototype);
  assert.ok(Symbol.search in RegExp.prototype);
  assert.ok(Symbol.split in RegExp.prototype);
});

QUnit.module("Containers and Iterators");

QUnit.test("Map", function(assert) {
  assert.equal(Map.length, 0);

  map = new Map();
  assert.notOk(map.has(-0));
  assert.notOk(map.has(0));
  map.set(0, 1234);
  assert.equal(map.size, 1);
  assert.ok(map.has(-0));
  assert.ok(map.has(0));
  assert.equal(map.get(0), 1234);
  assert.equal(map.get(-0), 1234);
  map['delete'](-0);
  assert.notOk(map.has(-0));
  assert.notOk(map.has(0));
  map.set(-0, 1234);
  map.clear();
  assert.notOk(map.has(0));
  assert.notOk(map.has(-0));
  assert.equal(map.size, 0);
  assert.equal(map.set('key', 'value'), map);

  assert.equal(1/(new Map([['key', 0]]).values().next().value), Infinity);
  assert.equal(1/(new Map([['key', -0]]).values().next().value), -Infinity);

  assert.equal(1/(new Map([[0, 'value']]).keys().next().value), Infinity);
  assert.equal(1/(new Map([[-0, 'value']]).keys().next().value), Infinity);

  var data = [[0, "a"], [1, "b"]], count = 0;
  map = new Map(data);
  map.forEach(function(v, k, m) {
    assert.equal(map, m);
    self.k = k;
    self.v = v;
    assert.equal(k, data[count][0]);
    assert.equal(v, data[count][1]);
    ++count;
    delete self.k;
    delete self.v;
  });
  assert.equal(2, count, 'two items seen during Map forEach()');

  assert.verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).keys(), [1,2,3]);
  assert.verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).values(), ['a','b','c']);
  assert.verifyIterator(new Map([[1,'a'], [2,'b'], [3,'c']]).entries(), [[1,'a'], [2,'b'], [3,'c']]);

  // Verify |empty| behavior
  var map = new Map().set('a', 1).set('b', 2).set('c', 3).set('d', 4);
  var keys = [];
  var iterator = map.keys();
  keys.push(iterator.next().value);
  map["delete"]('a');
  map["delete"]('b');
  map["delete"]('c');
  map.set('e');
  keys.push(iterator.next().value);
  keys.push(iterator.next().value);
  assert.equal(JSON.stringify(["a","d","e"]), JSON.stringify(keys));

  map = new Map();
  map.set('a', 1);
  map.set('b', 2);
  map['delete']('a');
  count = 0;
  map.forEach(function (k, v) {
    ++count;
  });
  assert.equal(1, count, 'Map iteration should skip deleted items');

  assert.throws(function() { Map(); });

  assert.equal(Map.prototype[Symbol.toStringTag], "Map");
  assert.equal(String(new Map), "[object Map]");
  assert.equal(Object.prototype.toString.call(new Map), "[object Map]");
  assert.equal(String((new Map).entries()), "[object Map Iterator]");
  assert.equal(Object.prototype.toString.call((new Map).entries()), "[object Map Iterator]");
});

QUnit.test("Set", function(assert) {
  assert.equal(Set.length, 0);

  var set = new Set();
  assert.notOk(set.has(-0));
  assert.notOk(set.has(0));
  assert.equal(set.size, 0);
  set.add(0);
  assert.ok(set.has(-0));
  assert.ok(set.has(0));
  assert.equal(set.size, 1);
  set['delete'](-0);
  assert.notOk(set.has(-0));
  assert.notOk(set.has(0));
  assert.equal(set.size, 0);
  set.add(-0);
  set.clear();
  assert.notOk(set.has(0));
  assert.equal(set.size, 0);
  assert.equal(set.add('key'), set);

  assert.equal(1/(new Set([0]).values().next().value), Infinity);
  assert.equal(1/(new Set([-0]).values().next().value), Infinity);

  var data = [1, 2, 3], count = 0;
  set = new Set(data);
  set.forEach(function(e1, e2, s) {
    assert.equal(set, s);
    self.e1 = e1;
    self.e2 = e2;
    assert.equal(e1, data[count]);
    assert.equal(e2, data[count]);
    delete self.e1;
    delete self.e2;
    ++count;
  });
  assert.equal(3, count, 'Set iteration yields expected number of items');

  set = new Set(('ABC')[Symbol.iterator]());
  assert.verifyIterator(set.values(), ['A', 'B', 'C']);
  assert.verifyIterator(set.keys(), ['A', 'B', 'C']);
  assert.verifyIterator(set.entries(), [['A', 'A'], ['B', 'B'], ['C', 'C']]);

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
  assert.equal(JSON.stringify(["a","d","e"]), JSON.stringify(keys));

  set = new Set();
  set.add('a');
  set.add('b');
  set['delete']('a');
  count = 0;
  set.forEach(function(v) {
    ++count;
  });
  assert.equal(1, count, 'Set iteration skips deleted items');

  delete set;

  assert.throws(function() { Set(); });

  assert.equal(Set.prototype[Symbol.toStringTag], "Set");
  assert.equal(String(new Set), "[object Set]");
  assert.equal(Object.prototype.toString.call(new Set), "[object Set]");
  assert.equal(String((new Set).values()), "[object Set Iterator]");
  assert.equal(Object.prototype.toString.call((new Set).values()), "[object Set Iterator]");
});

QUnit.test("WeakMap", function(assert) {
  assert.equal(WeakMap.length, 0);

  var wm1 = new WeakMap();
  var wm2 = new WeakMap();
  var x = {};
  var y = {};
  var v = {};

  assert.notOk(wm1.has(x));
  assert.notOk(wm2.has(x));
  assert.notOk(wm1.has(y));
  assert.notOk(wm2.has(y));

  wm1.set(x, "x-value");
  assert.ok(wm1.has(x));
  assert.notOk(wm2.has(x));
  assert.notOk(wm1.has(y));
  assert.notOk(wm2.has(y));
  assert.equal(wm1.get(x), "x-value");

  wm1.set(y, "y-value");
  assert.ok(wm1.has(x));
  assert.notOk(wm2.has(x));
  assert.ok(wm1.has(y));
  assert.notOk(wm2.has(y));
  assert.equal(wm1.get(x), "x-value");
  assert.equal(wm1.get(y), "y-value");

  wm2.set(x, "x-value-2");
  assert.ok(wm1.has(x));
  assert.ok(wm2.has(x));
  assert.ok(wm1.has(y));
  assert.notOk(wm2.has(y));
  assert.equal(wm1.get(x), "x-value");
  assert.equal(wm2.get(x), "x-value-2");
  assert.equal(wm1.get(y), "y-value");

  wm1['delete'](x);
  assert.notOk(wm1.has(x));
  assert.ok(wm2.has(x));
  assert.ok(wm1.has(y));
  assert.notOk(wm2.has(y));
  assert.equal(wm2.get(x), "x-value-2");
  assert.equal(wm1.get(y), "y-value");

  wm1.set(y, "y-value-new");
  assert.notOk(wm1.has(x));
  assert.ok(wm2.has(x));
  assert.ok(wm1.has(y));
  assert.notOk(wm2.has(y));
  assert.equal(wm2.get(x), "x-value-2");
  assert.equal(wm1.get(y), "y-value-new");

  wm1.set(x, v);
  wm2.set(y, v);
  assert.ok(wm1.get(x) === wm2.get(y));

  assert.equal(wm1.set(x, v), wm1);

  assert.throws(function() { WeakMap(); });

  assert.equal(WeakMap.prototype[Symbol.toStringTag], "WeakMap");
  assert.equal(String(new WeakMap), "[object WeakMap]");
  assert.equal(Object.prototype.toString.call(new WeakMap), "[object WeakMap]");

  assert.equal(new WeakMap().get(Object.create(null)), undefined);
});

QUnit.test("WeakSet", function(assert) {
  assert.equal(WeakSet.length, 0);

  var set = new WeakSet();
  var x = {};
  var y = {};
  assert.notOk(set.has(x));
  assert.notOk(set.has(y));
  set.add(x);
  assert.ok(set.has(x));
  assert.notOk(set.has(y));
  set['delete'](x);
  assert.notOk(set.has(x));
  assert.notOk(set.has(y));
  set.add(x);

  set = new WeakSet([x, y]);
  assert.ok(set.has(x));
  assert.ok(set.has(y));

  assert.equal(set.add(x), set);
  assert.ok(set['delete'](x));
  assert.notOk(set['delete'](x));

  assert.throws(function() { WeakSet(); });

  assert.equal(WeakSet.prototype[Symbol.toStringTag], "WeakSet");
  assert.equal(String(new WeakSet), "[object WeakSet]");
  assert.equal(Object.prototype.toString.call(new WeakSet), "[object WeakSet]");
});

QUnit.test("Branding", function(assert) {
  assert.equal(ArrayBuffer.prototype[Symbol.toStringTag], "ArrayBuffer");
  assert.equal(Object.prototype.toString.call(new Uint8Array().buffer), "[object ArrayBuffer]");

  assert.equal(DataView.prototype[Symbol.toStringTag], "DataView");
  assert.equal(Object.prototype.toString.call(new DataView(new Uint8Array().buffer)), "[object DataView]");

  assert.equal(JSON[Symbol.toStringTag], "JSON");
  assert.equal(Object.prototype.toString.call(JSON), "[object JSON]");

  assert.equal(Math[Symbol.toStringTag], "Math");
  assert.equal(Object.prototype.toString.call(Math), "[object Math]");

  // Make sure these aren't broken:
  assert.equal(Object.prototype.toString.call(undefined), "[object Undefined]");

  // Fails in IE9-; in non-strict mode, |this| is the global and can't be distinguished from undefined
  assert.equal(Object.prototype.toString.call(null), "[object Null]");

  assert.equal(Object.prototype.toString.call(0), "[object Number]");
  assert.equal(Object.prototype.toString.call(1), "[object Number]");
  assert.equal(Object.prototype.toString.call(NaN), "[object Number]");

  assert.equal(Object.prototype.toString.call(''), "[object String]");
  assert.equal(Object.prototype.toString.call('x'), "[object String]");

  assert.equal(Object.prototype.toString.call(true), "[object Boolean]");
  assert.equal(Object.prototype.toString.call(false), "[object Boolean]");

  assert.equal(Object.prototype.toString.call({}), "[object Object]");
  assert.equal(Object.prototype.toString.call([]), "[object Array]");
  assert.equal(Object.prototype.toString.call(function(){}), "[object Function]");
  // etc.
});



QUnit.module("Promises");
QUnit.test("Basics", function(assert) {
  assert.expect(4);
  new Promise(function (resolve, reject) {
    assert.equal(typeof resolve, 'function', 'resolve capability is a function');
    assert.equal(typeof reject, 'function', 'reject capability is a function');
  });

  assert.equal(Promise.prototype[Symbol.toStringTag], "Promise");
  assert.equal(Object.prototype.toString.call(new Promise(function(){})), "[object Promise]");
});

QUnit.test("Fulfill", function(assert) {
  var fulfill, done = assert.async();
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    assert.equal(value, 5);
    done();
  }, function(reason) {
    assert.ok(false, 'unexpected code reached');
    done();
  });

  fulfill(5);
});

QUnit.test("Reject", function(assert) {
  assert.expect(1);
  var reject, done = assert.async();
  new Promise(function (a, b) {
    reject = b;
  }).then(function(value) {
    assert.ok(false, 'unexpected code reached');
    done();
  }, function(reason) {
    assert.equal(reason, 5, 'rejection reason should match rejection value');
    done();
  });

  reject(5);
});

QUnit.test("Catch", function(assert) {
  var reject, done = assert.async();
  var p = new Promise(function (a, b) {
    reject = b;
  })['catch'](function(reason) {
    assert.equal(reason, 5, 'catch reason should match rejection value');
    done();
  });

  reject(5);
});

QUnit.test("Multiple thens", function(assert) {
  var fulfill, done = assert.async();
  var p = new Promise(function (a, b) {
    fulfill = a;
  });

  var saw = [];
  p.then(function(value) {
    saw.push(value);
  });
  p.then(function(value) {
    saw.push(value);
    assert.deepEqual(saw, [5, 5], 'multiple thens should be called with same value');
    done();
  });

  fulfill(5);
});

QUnit.test("Catch returns Promise", function(assert) {
  var done = assert.async();
  var p = Promise.reject().catch(function(reason) { return 123; });
  assert.ok(p instanceof Promise, 'catch() should return a Promise');
  p.then(function(result) {
    assert.equal(result, 123, 'Returned promise should resolve to returned value');
    done();
  });
});

QUnit.test("Promise.resolve()", function(assert) {
  var done = assert.async();

  var p = new Promise(function(){});
  assert.ok(Promise.resolve(p) === p, 'Promise.resolve(promise) should return same promise');

  Promise.resolve(5).then(function(value) {
    assert.equal(value, 5, 'Promise.resolve(value) should resolve');
    done();
  });
});

QUnit.test("Promise.reject()", function(assert) {
  var done = assert.async();

  Promise.reject(5)['catch'](function(reason) {
    assert.equal(reason, 5, 'Promise.reject(reason) should reject');
    done();
  });
});

QUnit.test("Promise resolved with Promise", function(assert) {
  var fulfill, done = assert.async();
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    assert.equal(value, 5, 'Promise fulfilled with Promise should resolve to actual value');
    done();
  });
  fulfill(Promise.resolve(5));
});

QUnit.test("Promise rejected with promise", function(assert) {
  var fulfill, done = assert.async();
  new Promise(function (a, b) {
    fulfill = a;
  })['catch'](function(value) {
    assert.equal(value, 5, 'Promise rejected with Promise should resolve to actual value');
    done();
  });
  fulfill(Promise.reject(5));
});

QUnit.test("Promise.race()", function(assert) {
  var f1, f2, f3, done = assert.async();
  var p1 = new Promise(function(f, r) { f1 = f; });
  var p2 = new Promise(function(f, r) { f2 = f; });
  var p3 = new Promise(function(f, r) { f3 = f; });
  Promise.race([p1, p2, p3]).then(function(value) {
    assert.equal(value, 2, 'Promise.race() should resolve to first fulfilled value');
    done();
  });
  f2(2);
});

QUnit.test("Promise.all() fulfill", function(assert) {
  var done = assert.async();
  Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ]).then(function(value) {
    assert.deepEqual(value, [1,2,3], 'Promise.all should resolve to completed promises');
    done();
  });
});

QUnit.test("Promise.all() fulfill async", function(assert) {
  var f1, f2, f3, done = assert.async();
  var p1 = new Promise(function(f, r) { f1 = f; });
  var p2 = new Promise(function(f, r) { f2 = f; });
  var p3 = new Promise(function(f, r) { f3 = f; });
  Promise.all([p1, p2, p3]).then(function(value) {
    assert.deepEqual(value, [1,2,3], 'Promise.all should resolve to completed promises');
    done();
  });
  f3(3);
  f2(2);
  f1(1);
});

QUnit.test("Promise.all() reject", function(assert) {
  var done = assert.async();
  Promise.all([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3)
  ])['catch'](function(reason) {
    assert.equal(reason, 2, 'Promise.all should reject if any promise rejects');
    done();
  });
});

QUnit.module("Reflection");

QUnit.test("Reflect", function(assert) {

  assert.throws(function() { Reflect.apply(123); }, TypeError,
                'Reflect.apply throws if argument is not callable');
  var thisArg, args, t = {};
  function fn() { thisArg = this; args = arguments; return 123; }
  assert.equal(Reflect.apply(fn, t, [1, 2]), 123,
               'Reflect.apply should return result of call');
  assert.equal(thisArg, t, 'Reflect.apply should call with passed thisArg');
  assert.equal(args.length, 2, 'Reflect.apply should call with passed args');
  assert.equal(args[0], 1, 'Reflect.apply should call with passed args');
  assert.equal(args[1], 2, 'Reflect.apply should call with passed args');

  assert.equal(Reflect.construct(Date, [1970, 1]).getMonth(), 1);
  (function() {
    assert.equal(Reflect.construct(Date, arguments).getMonth(), 1);
  })(1970, 1);
  assert.equal(Reflect.enumerate({a:1}).next().value, 'a');

  var o = {};
  Object.defineProperty(o, 'p', {configurable: true, writable: true, value: 123});
  Object.defineProperty(o, 'q', {configurable: false, value: 456});
  assert.equal(Reflect.get(o, 'p'), 123, 'Reflect.get() works with configurable properties');
  assert.equal(Reflect.get(o, 'q'), 456, 'Reflect.get() works with non-configurable properties');

  assert.equal(Reflect.defineProperty(o, 'p', {configurable: true, writable: true, value: 789}), true,
               'Reflect.defineProperty should return true if it succeeds');
  assert.equal(Reflect.defineProperty(o, 'q', {configurable: true, value: 012}), false,
               'Reflect.defineProperty should return false if it fails');
  assert.equal(Reflect.get(o, 'p'), 789,
               'Reflect.get() should see result of Reflect.defineProperty()');
  assert.equal(Reflect.get(o, 'q'), 456,
               'Reflect.get() should not see result of failed Reflect.defineProperty()');

  assert.equal(Reflect.set(o, 'p', 111), true,
               'Reflect.set should return true if it succeeds');
  assert.equal(Reflect.set(o, 'q', 222), false,
               'Reflect.set should return false if it fails');
  assert.equal(Reflect.get(o, 'p'), 111,
               'Reflect.get() should see result of Reflect.set()');
  assert.equal(Reflect.get(o, 'q'), 456,
               'Reflect.get() should not see result of failed Reflect.set()');

  assert.equal(Reflect.deleteProperty(o, 'p'), true,
               'Reflect.deleteProperty should return true if it succeeds');
  assert.equal(Reflect.deleteProperty(o, 'q'), false,
               'Reflect.deleteProperty should return false if it fails');
  assert.equal(Reflect.get(o, 'p'), undefined,
               'Reflect.get() should see result of Reflect.delete()');
  assert.equal(Reflect.get(o, 'q'), 456,
               'Reflect.get() should not see result of failed Reflect.delete()');

  var p = {};
  assert.equal(Reflect.getPrototypeOf(o), Object.prototype,
               'Reflect.getPrototypeOf() should yield object\'s prototype');
  assert.equal(Reflect.getPrototypeOf(o), o.__proto__,
               'Reflect.getPrototypeOf(o) and o.__proto__ should match');
  assert.equal(Reflect.setPrototypeOf(o, p), true,
               'Reflect.setPrototypeOf() should succeed');
  assert.equal(Reflect.getPrototypeOf(o), p,
               'Reflect.getPrototypeOf() should yield object\'s new prototype');

  Object.freeze(o);
  assert.equal(Reflect.setPrototypeOf(o, {}), false,
               'Reflect.setPrototypeOf() on frozen object should fail');

});

QUnit.module("Regression");

QUnit.test('IE/getOwnPropertyNames error', function(assert) {
  // https://github.com/inexoraletash/polyfill/issues/96
  var iframe = document.createElement('iframe');
  iframe.src = 'http://example.com';
  document.documentElement.appendChild(iframe);
  var w = iframe.contentWindow;
  document.documentElement.removeChild(iframe);
  assert.ok(true, "Did not throw");
});
