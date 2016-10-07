/*global QUnit*/

QUnit.test("Object constructor properties", function(assert) {
  assert.equal(Object.getPrototypeOf([]), Array.prototype);
  assert.equal(Object.getPrototypeOf({}), Object.prototype);

  var p = { a: 1, b: 2 };
  var C = function() { this.c = 3; };
  C.prototype = p;

  // Not supported by shim, since constructor is mutated
  // by prototype assignment.
  //assert.equal(Object.getPrototypeOf(new C), p);
  assert.equal(Object.getPrototypeOf(Object.create(p)), p);

  assert.equal(String(Object.getOwnPropertyNames(new C)), 'c');

  var o = Object.create(p, {d: {value: 4}, e: {value: 5}});
  assert.equal(o.a, 1);
  assert.equal(o.b, 2);
  assert.equal(o.d, 4);
  assert.equal(o.e, 5);

  Object.defineProperty(o, "c", {value: 3});
  assert.equal(o.c, 3);

  Object.defineProperties(o, {f: {value: 6}, g: {value: 7}});
  assert.equal(o.f, 6);
  assert.equal(o.g, 7);

  assert.equal(String(Object.keys({a: 1, b: 2, c: 3})), 'a,b,c');
});

QUnit.test("Function prototype properties", function(assert) {
  assert.equal(((function(){ return this.foo; }).bind({foo:123}))(), 123);

  (function() {
    // non-strict
    function that(o) { return this; }
    assert.equal(that.bind(123)(), 123);
    assert.equal(that.bind(0)(), 0);
    assert.equal(that.bind(false)(), false);
    assert.equal(that.bind(null)(), self);
    assert.equal(that.bind(undefined)(), self);
  });
  (function() {
    'use strict';
    function that(o) { return this; }
    assert.equal(that.bind(123)(), 123);
    assert.equal(that.bind(0)(), 0);
    assert.equal(that.bind(false)(), false);
    assert.equal(that.bind(null)(), null);
    assert.equal(that.bind(undefined)(), undefined);
  }());

  assert.equal(Function.prototype.bind()(), undefined);
});

QUnit.test("Array constructor properties", function(assert) {
  assert.ok(Array.isArray([]));
  assert.ok(Array.isArray(new Array));
  assert.notOk(Array.isArray({length:0}));
});

QUnit.test("Array prototype properties", function(assert) {
  assert.equal([1,2,3,2,3].indexOf(3), 2);
  assert.equal([1,2,3,2,3].lastIndexOf(3), 4);
  assert.ok([0,2,4,6,8].every(function(x){return !(x % 2);}));
  assert.notOk([0,2,4,5,6].every(function(x){return !(x % 2);}));
  assert.ok([1,2,3,4,5].some(function(x){return x > 3;}));
  assert.notOk([1,2,3,4,5].some(function(x){return x > 8;}));
  assert.equal((function(){var t = 0; [1,2,3,4,5,6,7,8,9,10].forEach(function(x){t += x;}); return t;}()), 55);
  assert.equal(String([1,2,3,4,5].map(function(x){return x * x;})), '1,4,9,16,25');
  assert.equal(String([1,2,3,4,5].filter(function(x){return x % 2;})), '1,3,5');
  assert.equal([1,2,3,4,5,6,7,8,9,10].reduce(function(a,b){return a-b;}), -53);
  assert.equal([1,2,3,4,5,6,7,8,9,10].reduceRight(function(a,b){return a-b;}), -35);
});

QUnit.test("String prototype properties", function(assert) {
  assert.equal(''.trim(), '');
  assert.equal('  '.trim(), '');
  assert.equal('abc'.trim(), 'abc');
  assert.equal('   abc   '.trim(), 'abc');
  assert.equal(' \t\n\rabc\t\n\r'.trim(), 'abc');
  assert.equal(' a b c '.trim(), 'a b c');
});

QUnit.test("Date constructor properties", function(assert) {
  assert.ok(Math.abs(Date.now() - Number(new Date())) < 100);
});

QUnit.test("Date prototype properties", function(assert) {
  // milliseconds are optional, so verify with a regexp
  assert.ok(/1970-01-01T00:00:00(\.000)?Z/.test(new Date(0).toISOString()));
  assert.ok(/2001-09-09T01:46:40(\.000)?Z/.test(new Date(1e12).toISOString()));
});
