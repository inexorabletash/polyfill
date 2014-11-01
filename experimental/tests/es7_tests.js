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

  assertTrue("[1,2,3].contains(3, 2)");
  assertFalse("[1,2,3].contains(2, 2)");
});

test("Proposed Object Extras", function() {
  d = Object.create(null);
  d['a'] = 1;
  d['b'] = 2;

  assertTrue("Array.isArray(Object.keys(d))");
  assertTrue("Array.isArray(Object.values(d))");
  assertTrue("Array.isArray(Object.entries(d))");

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
  delete d;
});

test("Proposed RegExp Extras", function() {
  assertTrue("new RegExp(RegExp.escape('[]{}()*+?.^$|')).test('[]{}()*+?.^$|')");
});

test("Proposed String Extras", function() {
  assertEqual("'a'.at(0)", 'a');
  assertEqual("'a'.at(-1)", '');
  assertEqual("'a'.at(2)", '');
  assertEqual("'\uD800\uDC00'.at(0)", '\uD800\uDC00');
  assertEqual("'\uD800'.at(0)", '\uD800');
  assertEqual("'\uDC00'.at(0)", '\uDC00');
  assertEqual("'\uD800\uDC00'.at(1)", '\uDC00');

  assertEqual("'a'.lpad()", 'a');
  assertEqual("'a'.lpad(1)", 'a');
  assertEqual("'a'.lpad(2)", ' a');
  assertEqual("'a'.lpad(2, '_')", '_a');
  assertEqual("'a'.lpad(3, '_')", '__a');
  assertEqual("'a'.lpad(2, '[]')", '[]a');

  assertEqual("'a'.rpad()", 'a');
  assertEqual("'a'.rpad(1)", 'a');
  assertEqual("'a'.rpad(2)", 'a ');
  assertEqual("'a'.rpad(2, '_')", 'a_');
  assertEqual("'a'.rpad(3, '__')", 'a__');
  assertEqual("'a'.rpad(2, '[]')", 'a[]');

});

test("Proposed Math Extras", function() {
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
