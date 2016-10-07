/*global QUnit,global*/

QUnit.module("Stage 4");

QUnit.test("Object.values/entries", function(assert) {
  var d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  assert.ok(Array.isArray(Object.keys(d)));
  assert.ok(Array.isArray(Object.values(d)));
  assert.ok(Array.isArray(Object.entries(d)));

  assert.deepEqual(Object.keys(d), ['a', 'b']);
  assert.deepEqual(Object.values(d), [1, 2]);
  assert.deepEqual(Object.entries(d), [['a', 1], ['b', 2]]);

  assert.deepEqual(Object.values({a: 1, get b(){delete this.c; return 2;}, c: 3}), [1,2]);
  assert.deepEqual(Object.entries({a: 1, get b(){delete this.c; return 2;}, c: 3}), [['a',1],['b',2]]);
});

QUnit.test("String padStart/padEnd", function(assert) {
  assert.equal('a'.padStart(), 'a');
  assert.equal('a'.padStart(1), 'a');
  assert.equal('a'.padStart(2), ' a');
  assert.equal('a'.padStart(2, '_'), '_a');
  assert.equal('a'.padStart(3, '_'), '__a');
  assert.equal('a'.padStart(2, '[]'), '[a');

  assert.equal('a'.padEnd(), 'a');
  assert.equal('a'.padEnd(1), 'a');
  assert.equal('a'.padEnd(2), 'a ');
  assert.equal('a'.padEnd(2, '_'), 'a_');
  assert.equal('a'.padEnd(3, '__'), 'a__');
  assert.equal('a'.padEnd(2, '[]'), 'a[');
});

QUnit.test("Object.getOwnPropertyDescriptors", function(assert) {
  var d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  assert.deepEqual(Object.keys(d), ['a', 'b']);
  assert.deepEqual(Object.values(d), [1, 2]);
  assert.deepEqual(Object.entries(d), [['a', 1], ['b', 2]]);

  assert.deepEqual(Object.getOwnPropertyDescriptors(d),
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


// ------------------------------------------------------------

QUnit.module("Stage 3");

QUnit.test("global", function(assert) {
  assert.equal(global, Function('return this')());
});

// ------------------------------------------------------------

QUnit.module("Stage 2");

QUnit.test("String trimStart/trimEnd and aliases", function(assert) {

  assert.equal(''.trimStart(), '');
  assert.equal('a'.trimStart(), 'a');
  assert.equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimStart(), 'a \t\r\n\u00A0');
  assert.equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimStart(), '');
  assert.equal(''.trimEnd(), '');
  assert.equal('a'.trimEnd(), 'a');
  assert.equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimEnd(), ' \t\r\n\u00A0a');
  assert.equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimEnd(), '');

  // Annex B versions
  assert.equal(''.trimLeft(), '');
  assert.equal('a'.trimLeft(), 'a');
  assert.equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimLeft(), 'a \t\r\n\u00A0');
  assert.equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimLeft(), '');
  assert.equal(''.trimRight(), '');
  assert.equal('a'.trimRight(), 'a');
  assert.equal(' \t\r\n\u00A0a \t\r\n\u00A0'.trimRight(), ' \t\r\n\u00A0a');
  assert.equal(' \t\r\n\u00A0 \t\r\n\u00A0'.trimRight(), '');
});

QUnit.test('Promise.prototype.finally', function(assert) {
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

// ------------------------------------------------------------

QUnit.module("Stage 1");

QUnit.test("String matchAll", function(assert) {
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

QUnit.test('Math extensions', function(assert) {
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


QUnit.test('Set and Map .of and .from', function(assert) {
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

// ------------------------------------------------------------

QUnit.module("Stage 0");

QUnit.test('String.prototype.at()', function(assert) {
  assert.equal('a'.at(0), 'a');
  assert.equal('a'.at(-1), '');
  assert.equal('a'.at(2), '');
  assert.equal('\uD800\uDC00'.at(0), '\uD800\uDC00');
  assert.equal('\uD800'.at(0), '\uD800');
  assert.equal('\uDC00'.at(0), '\uDC00');
  assert.equal('\uD800\uDC00'.at(1), '\uDC00');
});

// ------------------------------------------------------------

QUnit.module("Obsolete/Abandoned");

QUnit.test("Number.compare", function(assert) {
  // Number.compare
  assert.ok('compare' in Number);
  assert.equal(typeof Number.compare, 'function');
  assert.equal(Number.compare(0, 0), 0);
  assert.equal(Number.compare(1, 0), 1);
  assert.equal(Number.compare(0, 1), -1);
  assert.equal(Number.compare(0, 0, 1), 0);
  assert.equal(Number.compare(1, 0, 1), 0);
  assert.equal(Number.compare(0, 1, 1), 0);
});

QUnit.test("Array.prototype.pushAll", function(assert) {
  assert.ok('pushAll' in Array.prototype);
  assert.equal(typeof Array.prototype.pushAll, 'function');
  var a;
  a = []; a.pushAll([]); assert.deepEqual(a, []);
  a = [1,2]; a.pushAll([]); assert.deepEqual(a, [1,2]);
  a = []; a.pushAll([1,2]); assert.deepEqual(a, [1,2]);
  a = [1,2]; a.pushAll([1,2]); assert.deepEqual(a, [1,2,1,2]);
});

QUnit.test("Math: denormalized-to-zero", function(assert) {
  assert.equal(Math.denormz(0), 0);
  assert.equal(Math.denormz(-0), -0);
  assert.equal(Math.denormz(1), 1);
  assert.equal(Math.denormz(-1), -1);
  assert.equal(Math.denormz(Math.pow(2,-126)), Math.pow(2,-126));
  assert.equal(Math.denormz(Math.pow(2,-127)), Math.pow(2,-127));
  assert.equal(Math.denormz(Math.pow(2,-1022)), Math.pow(2,-1022));
  assert.equal(Math.denormz(Math.pow(2,-1023)), 0);
  assert.equal(Math.denormz(Number.MIN_VALUE), 0);
  assert.equal(Math.denormz(-Math.pow(2,-126)), -Math.pow(2,-126));
  assert.equal(Math.denormz(-Math.pow(2,-127)), -Math.pow(2,-127));
  assert.equal(Math.denormz(-Math.pow(2,-1022)), -Math.pow(2,-1022));
  assert.equal(Math.denormz(-Math.pow(2,-1023)), -0);
  assert.equal(Math.denormz(-Number.MIN_VALUE), -0);

  assert.equal(Math.fdenormz(0), 0);
  assert.equal(Math.fdenormz(-0), -0);
  assert.equal(Math.fdenormz(1), 1);
  assert.equal(Math.fdenormz(-1), -1);
  assert.equal(Math.fdenormz(Math.pow(2,-126)), Math.pow(2,-126));
  assert.equal(Math.fdenormz(Math.pow(2,-127)), 0);
  assert.equal(Math.fdenormz(Math.pow(2,-1022)), 0);
  assert.equal(Math.fdenormz(Math.pow(2,-1023)), 0);
  assert.equal(Math.fdenormz(Number.MIN_VALUE), 0);
  assert.equal(Math.fdenormz(-Math.pow(2,-126)), -Math.pow(2,-126));
  assert.equal(Math.fdenormz(-Math.pow(2,-127)), -0);
  assert.equal(Math.fdenormz(-Math.pow(2,-1022)), -0);
  assert.equal(Math.fdenormz(-Math.pow(2,-1023)), -0);
  assert.equal(Math.fdenormz(-Number.MIN_VALUE), -0);
});
