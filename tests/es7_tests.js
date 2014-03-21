function verifyIterator(iterator, expected) {
  while (true) {
    var result = iterator.next();
    if (result.done) {
      ok(expected.length === 0);
      return;
    } else {
      var ex = expected.shift();
      equal(result.done, false);
      deepEqual(result.value, ex);
    }
  }
}


module("Not Yet Approved");

test("Proposed Number extras", function () {
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

test("Proposed Array extras", function () {
  assertTrue("'pushAll' in Array.prototype");
  assertEqual("typeof Array.prototype.pushAll", 'function');
  var a;
  a = []; a.pushAll([]); deepEqual(a, []);
  a = [1,2]; a.pushAll([]); deepEqual(a, [1,2]);
  a = []; a.pushAll([1,2]); deepEqual(a, [1,2]);
  a = [1,2]; a.pushAll([1,2]); deepEqual(a, [1,2,1,2]);

  assertTrue("'contains' in Array.prototype");
  assertEqual("typeof Array.prototype.contains", 'function');
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

test("Proposed Object Iterator Helpers", function() {
  d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  verifyIterator(Object.keys(d)[Symbol.iterator](), ['a', 'b']);
  verifyIterator(Object.values(d), [1, 2]);
  verifyIterator(Object.entries(d), [['a', 1], ['b', 2]]);
  delete d;
});

test("Proposed RegExp Extras", function() {
  assertTrue("new RegExp(RegExp.escape('[]{}()*+?.^$|')).test('[]{}()*+?.^$|')");
});
