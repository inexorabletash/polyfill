test("Object constructor properties", function() {
  assertEqual("Object.getPrototypeOf([])", Array.prototype);
  assertEqual("Object.getPrototypeOf({})", Object.prototype);

  p = { a: 1, b: 2 };
  C = function () { this.c = 3; };
  C.prototype = p;

  // Not supported by shim, since constructor is mutated
  // by prototype assignment.
  //assertEqual("Object.getPrototypeOf(new C)", p);
  assertEqual("Object.getPrototypeOf(Object.create(p))", p);

  assertEqual("String(Object.getOwnPropertyNames(new C))", 'c');

  o = Object.create(p, {d: {value: 4}, e: {value: 5}});
  assertEqual("o.a", 1);
  assertEqual("o.b", 2);
  assertEqual("o.d", 4);
  assertEqual("o.e", 5);

  Object.defineProperty(o, "c", {value: 3});
  assertEqual("o.c", 3);

  Object.defineProperties(o, {f: {value: 6}, g: {value: 7}});
  assertEqual("o.f", 6);
  assertEqual("o.g", 7);

  assertEqual("String(Object.keys({a: 1, b: 2, c: 3}))", 'a,b,c');

  delete p;
  delete C;
  delete o;
});

test("Function prototype properties", function() {
  assertEqual("((function(){ return this.foo; }).bind({foo:123}))()", 123);

  (function() {
    // non-strict
    function that(o) { return this; }
    equal(that.bind(123)(), 123);
    equal(that.bind(0)(), 0);
    equal(that.bind(false)(), false);
    equal(that.bind(null)(), self);
    equal(that.bind(undefined)(), self);
  });
  (function() {
    'use strict';
    function that(o) { return this; }
    equal(that.bind(123)(), 123);
    equal(that.bind(0)(), 0);
    equal(that.bind(false)(), false);
    equal(that.bind(null)(), null);
    equal(that.bind(undefined)(), undefined);
  }());
});

test("Array constructor properties", function() {
  assertTrue("Array.isArray([])");
  assertTrue("Array.isArray(new Array)");
  assertFalse("Array.isArray({length:0})");
});

test("Array prototype properties", function() {
  assertEqual("[1,2,3,2,3].indexOf(3)", 2);
  assertEqual("[1,2,3,2,3].lastIndexOf(3)", 4);
  assertTrue("[0,2,4,6,8].every(function(x){return !(x % 2);})");
  assertFalse("[0,2,4,5,6].every(function(x){return !(x % 2);})");
  assertTrue("[1,2,3,4,5].some(function(x){return x > 3;})");
  assertFalse("[1,2,3,4,5].some(function(x){return x > 8;})");
  assertEqual("(function(){var t = 0; [1,2,3,4,5,6,7,8,9,10].forEach(function(x){t += x;}); return t;}())", 55);
  assertEqual("String([1,2,3,4,5].map(function(x){return x * x;}))", '1,4,9,16,25');
  assertEqual("String([1,2,3,4,5].filter(function(x){return x % 2;}))", '1,3,5');
  assertEqual("[1,2,3,4,5,6,7,8,9,10].reduce(function(a,b){return a-b;})", -53);
  assertEqual("[1,2,3,4,5,6,7,8,9,10].reduceRight(function(a,b){return a-b;})", -35);
});

test("String prototype properties", function() {
  assertEqual("''.trim()", '');
  assertEqual("'  '.trim()", '');
  assertEqual("'abc'.trim()", 'abc');
  assertEqual("'   abc   '.trim()", 'abc');
  assertEqual("' \\t\\n\\rabc\\t\\n\\r'.trim()", 'abc');
  assertEqual("' a b c '.trim()", 'a b c');
});

test("Date constructor properties", function() {
  assertTrue("Math.abs(Date.now() - Number(new Date())) < 100");
});

test("Date prototype properties", function() {
  // milliseconds are optional, so verify with a regexp
  assertEqual("new Date(0).toISOString()", /1970-01-01T00:00:00(\.000)?Z/);
  assertEqual("new Date(1e12).toISOString()", /2001-09-09T01:46:40(\.000)?Z/);
});
