test("Array.prototype.includes", function () {
  assertTrue("'includes' in Array.prototype");
  assertEqual("typeof Array.prototype.includes", 'function');
  assertTrue("[1,2,3].includes(1)");
  assertFalse("[1,2,3].includes(0)");
  assertTrue("[1,NaN,3].includes(NaN)");
  assertFalse("[1,2,3].includes(NaN)");
  assertTrue("[1,-0,3].includes(-0)");
  assertTrue("[1,-0,3].includes(0)");
  assertFalse("[1,[],3].includes([])");
  assertFalse("[1,{},3].includes({})");
  assertFalse("[1,2,3].includes(Math)");
  assertTrue("[1,Math,3].includes(Math)");
  assertFalse("[1,2,3].includes(undefined)");
  assertTrue("[1,undefined,3].includes(undefined)");
  assertFalse("[1,2,3].includes(null)");
  assertTrue("[1,null,3].includes(null)");

  assertTrue("[1,2,3].includes(3, 2)");
  assertFalse("[1,2,3].includes(2, 2)");
});
