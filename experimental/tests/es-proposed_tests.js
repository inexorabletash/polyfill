module("Stage 4");

test("Object.values/entries", function() {
  d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  assertTrue("Array.isArray(Object.keys(d))");
  assertTrue("Array.isArray(Object.values(d))");
  assertTrue("Array.isArray(Object.entries(d))");

  deepEqual(Object.keys(d), ['a', 'b']);
  deepEqual(Object.values(d), [1, 2]);
  deepEqual(Object.entries(d), [['a', 1], ['b', 2]]);

  deepEqual(Object.values({a: 1, get b(){delete this.c; return 2;}, c: 3}), [1,2]);
  deepEqual(Object.entries({a: 1, get b(){delete this.c; return 2;}, c: 3}), [['a',1],['b',2]]);

  delete d;
});

test("String padStart/padEnd", function() {
  assertEqual("'a'.padStart()", 'a');
  assertEqual("'a'.padStart(1)", 'a');
  assertEqual("'a'.padStart(2)", ' a');
  assertEqual("'a'.padStart(2, '_')", '_a');
  assertEqual("'a'.padStart(3, '_')", '__a');
  assertEqual("'a'.padStart(2, '[]')", '[a');

  assertEqual("'a'.padEnd()", 'a');
  assertEqual("'a'.padEnd(1)", 'a');
  assertEqual("'a'.padEnd(2)", 'a ');
  assertEqual("'a'.padEnd(2, '_')", 'a_');
  assertEqual("'a'.padEnd(3, '__')", 'a__');
  assertEqual("'a'.padEnd(2, '[]')", 'a[');
});

test("Object.getOwnPropertyDescriptors", function() {
  var d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  deepEqual(Object.keys(d), ['a', 'b']);
  deepEqual(Object.values(d), [1, 2]);
  deepEqual(Object.entries(d), [['a', 1], ['b', 2]]);

  deepEqual(Object.getOwnPropertyDescriptors(d),
            {a: {configurable: true,
                 enumerable: true,
                 writable: true,
                 value: 1
                },
             b: {configurable: true,
                 enumerable: true,
                 writable: true,
                 value: 2
                }
             });
});


module("Stage 3");

test("global", function(assert) {
  assert.equal(global, Function('return this')());
});

module("Stage 2");

test("String trimStart/trimEnd and aliases", function() {

  equal(''.trimStart(), '');
  equal('a'.trimStart(), 'a');
  equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimStart(), 'a \t\r\n\u00A0');
  equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimStart(), '');
  equal(''.trimEnd(), '');
  equal('a'.trimEnd(), 'a');
  equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimEnd(), ' \t\r\n\u00A0a');
  equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimEnd(), '');

  // Annex B versions
  equal(''.trimLeft(), '');
  equal('a'.trimLeft(), 'a');
  equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimLeft(), 'a \t\r\n\u00A0');
  equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimLeft(), '');
  equal(''.trimRight(), '');
  equal('a'.trimRight(), 'a');
  equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimRight(), ' \t\r\n\u00A0a');
  equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimRight(), '');
});

test('Promise.prototype.finally', function(assert) {
  assert.ok('finally' in Promise.prototype);
  assert.equal(typeof Promise.prototype.finally, 'function');
  assert.equal(Promise.prototype.finally.length, 1);

  function async(f) {
    var done = assert.async();
    f(done);
  }

  async(function(done) {
    Promise.resolve().finally(function() {
      assert.equal(arguments.length, 0, 'Finally callback gets no args - resolved promise');
      done();
    });
  });

  async(function(done) {
    Promise.reject().finally(function() {
      assert.equal(arguments.length, 0, 'Finally callback gets no args - rejected promise');
      done();
    }).catch(function() {});
  });

  async(function(done) {
    Promise.resolve(2).finally(function() {}).then(function(r) {
      assert.equal(r, 2, 'Finally passes resolution through promise chain');
      done();
    });
  });

  async(function(done) {
    Promise.reject(3).finally(function() {}).catch(function(r) {
      assert.equal(r, 3, 'Finally passes rejection through promise chain');
      done();
    });
  });

});

module("Stage 1");

test("String matchAll", function(assert) {
  function matchAllTest(string, regex, expected) {
    var results = [];
    for (var iter = string.matchAll(regex), step = iter.next(); !step.done; step = iter.next()) {
      results.push(step.value[0]);
    }
    assert.deepEqual(results, expected);
  }

  matchAllTest('banana CAKE', /a./, ['an', 'an', 'a ']);
  matchAllTest('banana CAKE', /a./g, ['an', 'an', 'a ']);
  matchAllTest('banana CAKE', /A./, ['AK']);
  matchAllTest('banana CAKE', /A./g, ['AK']);
  matchAllTest('banana CAKE', /a./i, ['an', 'an', 'a ', 'AK']);
  matchAllTest('banana CAKE', /a./ig, ['an', 'an', 'a ', 'AK']);

  assert.throws(function() { 'abc'.matchAll({}); }, TypeError);
});

test('Math extensions', function(assert) {
  assert.deepEqual(Math.clamp(0, 0, NaN), NaN);
  assert.deepEqual(Math.clamp(0, NaN, 0), NaN);
  assert.deepEqual(Math.clamp(NaN, 0, 0), NaN);
  assert.equal(Math.clamp(0, 1, 3), 1);
  assert.equal(Math.clamp(4, 1, 3), 3);
  assert.equal(Math.clamp(2, 1, 3), 2);

  assert.deepEqual(Math.scale(NaN, 0, 0, 0, 0), NaN);
  assert.deepEqual(Math.scale(0, NaN, 0, 0, 0), NaN);
  assert.deepEqual(Math.scale(0, 0, NaN, 0, 0), NaN);
  assert.deepEqual(Math.scale(0, 0, 0, NaN, 0), NaN);
  assert.deepEqual(Math.scale(0, 0, 0, 0, NaN), NaN);
  assert.equal(Math.scale(Infinity, 1, 2, 3, 4), Infinity);
  assert.equal(Math.scale(-Infinity, 1, 2, 3, 4), -Infinity);
  assert.equal(Math.scale(0, 1, 2, 3, 4), 2);
  assert.equal(Math.scale(3, 1, 2, 3, 4), 5);
  assert.equal(Math.scale(0, 1, 1, 3, 4), -Infinity);
  assert.equal(Math.scale(1, 0, 10, 0, 100), 10);
  assert.equal(Math.scale(10, 0, 100, 0, 10), 1);


  assert.deepEqual(Math.radians(NaN), NaN);
  assert.equal(Math.radians(Infinity), Infinity);
  assert.equal(Math.radians(-Infinity), -Infinity);
  assert.equal(Math.radians(180), Math.PI);

  assert.deepEqual(Math.degrees(NaN), NaN);
  assert.equal(Math.degrees(Infinity), Infinity);
  assert.equal(Math.degrees(-Infinity), -Infinity);
  assert.equal(Math.degrees(Math.PI/2), 90);
});


test('Set and Map .of and .from', function(assert) {
  var k1 = {}, k2 = {};

  [Set, Map, WeakSet, WeakMap].forEach(function(t) {
    assert.ok('of' in t);
    assert.equal(typeof t.of, 'function');
    assert.equal(t.of.length, 0);
  });

  assert.deepEqual([1, 2, 3], Array.from(Set.of(1, 2, 3)));
  assert.deepEqual([[1, 2], [3, 4], [5, 6]], Array.from(Map.of([1, 2], [3, 4], [5, 6])));
  assert.ok(WeakSet.of(k1, k2).has(k2));
  assert.equal(WeakMap.of([k1, 1], [k2, 2]).get(k2), 2);

  [Set, Map, WeakSet, WeakMap].forEach(function(t) {
    assert.ok('from' in t);
    assert.equal(typeof t.from, 'function');
    assert.equal(t.from.length, 1);
  });

  assert.deepEqual([1, 2, 3], Array.from(Set.from([1, 2, 3])));
  assert.deepEqual([[1, 2], [3, 4], [5, 6]], Array.from(Map.from([[1, 2], [3, 4], [5, 6]])));
  assert.ok(WeakSet.from([k1, k2]).has(k2));
  assert.equal(WeakMap.from([[k1, 1], [k2, 2]]).get(k2), 2);
});

module("Stage 0");

test('String.prototype.at()', function() {
  assertEqual("'a'.at(0)", 'a');
  assertEqual("'a'.at(-1)", '');
  assertEqual("'a'.at(2)", '');
  assertEqual("'\uD800\uDC00'.at(0)", '\uD800\uDC00');
  assertEqual("'\uD800'.at(0)", '\uD800');
  assertEqual("'\uDC00'.at(0)", '\uDC00');
  assertEqual("'\uD800\uDC00'.at(1)", '\uDC00');
});




module("Obsolete/Abandoned");

test("Number.compare", function () {
  // Number.compare
  assertTrue("'compare' in Number");
  assertEqual("typeof Number.compare", 'function');
  assertEqual("Number.compare(0, 0)", 0);
  assertEqual("Number.compare(1, 0)", 1);
  assertEqual("Number.compare(0, 1)", -1);
  assertEqual("Number.compare(0, 0, 1)", 0);
  assertEqual("Number.compare(1, 0, 1)", 0);
  assertEqual("Number.compare(0, 1, 1)", 0);
});

test("Array.prototype.pushAll", function () {
  assertTrue("'pushAll' in Array.prototype");
  assertEqual("typeof Array.prototype.pushAll", 'function');
  var a;
  a = []; a.pushAll([]); deepEqual(a, []);
  a = [1,2]; a.pushAll([]); deepEqual(a, [1,2]);
  a = []; a.pushAll([1,2]); deepEqual(a, [1,2]);
  a = [1,2]; a.pushAll([1,2]); deepEqual(a, [1,2,1,2]);
});

test("Math: denormalized-to-zero", function() {
  assertEqual("Math.denormz(0)", 0);
  assertEqual("Math.denormz(-0)", -0);
  assertEqual("Math.denormz(1)", 1);
  assertEqual("Math.denormz(-1)", -1);
  assertEqual("Math.denormz(Math.pow(2,-126))", Math.pow(2,-126));
  assertEqual("Math.denormz(Math.pow(2,-127))", Math.pow(2,-127));
  assertEqual("Math.denormz(Math.pow(2,-1022))", Math.pow(2,-1022));
  assertEqual("Math.denormz(Math.pow(2,-1023))", 0);
  assertEqual("Math.denormz(Number.MIN_VALUE)", 0);
  assertEqual("Math.denormz(-Math.pow(2,-126))", -Math.pow(2,-126));
  assertEqual("Math.denormz(-Math.pow(2,-127))", -Math.pow(2,-127));
  assertEqual("Math.denormz(-Math.pow(2,-1022))", -Math.pow(2,-1022));
  assertEqual("Math.denormz(-Math.pow(2,-1023))", -0);
  assertEqual("Math.denormz(-Number.MIN_VALUE)", -0);

  assertEqual("Math.fdenormz(0)", 0);
  assertEqual("Math.fdenormz(-0)", -0);
  assertEqual("Math.fdenormz(1)", 1);
  assertEqual("Math.fdenormz(-1)", -1);
  assertEqual("Math.fdenormz(Math.pow(2,-126))", Math.pow(2,-126));
  assertEqual("Math.fdenormz(Math.pow(2,-127))", 0);
  assertEqual("Math.fdenormz(Math.pow(2,-1022))", 0);
  assertEqual("Math.fdenormz(Math.pow(2,-1023))", 0);
  assertEqual("Math.fdenormz(Number.MIN_VALUE)", 0);
  assertEqual("Math.fdenormz(-Math.pow(2,-126))", -Math.pow(2,-126));
  assertEqual("Math.fdenormz(-Math.pow(2,-127))", -0);
  assertEqual("Math.fdenormz(-Math.pow(2,-1022))", -0);
  assertEqual("Math.fdenormz(-Math.pow(2,-1023))", -0);
  assertEqual("Math.fdenormz(-Number.MIN_VALUE)", -0);
});
