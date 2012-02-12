
function assertTrue(expr) {
  var x;
  try { eval("x = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(x, expr);
}

function assertFalse(expr) {
  var x;
  try { eval("x = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(!x, expr);
}

function assertEqual(expr, value) {
  var x;
  try { eval("x = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  if (value instanceof RegExp) {
    ok(value.test(x), expr);
  } else if (value !== value) {
    ok(x !== x, expr);
  } else {
    strictEqual(x, value, expr);
  }
}

function assertEpsilon(expr, value, epsilon) {
  var x;
  try { eval("x = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  var p;
  if (x === value) {
    p = true;
  } else {
    p = (Math.abs((x - value)/Math.max(Math.abs(x), Math.abs(value))) < epsilon);
  }

  ok(p, expr + " was " + x + ", expected " + value);
}
