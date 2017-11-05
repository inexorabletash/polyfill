/*global QUnit,global*/

QUnit.module("Object Objects");

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

QUnit.module("String Objects");

QUnit.test("String padEnd", function(assert) {
  assert.equal('a'.padEnd(), 'a');
  assert.equal('a'.padEnd(1), 'a');
  assert.equal('a'.padEnd(2), 'a ');
  assert.equal('a'.padEnd(2, '_'), 'a_');
  assert.equal('a'.padEnd(3, '__'), 'a__');
  assert.equal('a'.padEnd(2, '[]'), 'a[');
});

QUnit.test("String padStart", function(assert) {
  assert.equal('a'.padEnd(), 'a');
  assert.equal('a'.padEnd(1), 'a');
  assert.equal('a'.padEnd(2), 'a ');
  assert.equal('a'.padEnd(2, '_'), 'a_');
  assert.equal('a'.padEnd(3, '__'), 'a__');
  assert.equal('a'.padEnd(2, '[]'), 'a[');
});
