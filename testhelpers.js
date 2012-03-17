
function assertTrue(expr) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(_x_, "Expecting " + String(expr) + " to be true, was: " + String(_x_));
}

function assertFalse(expr) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(!_x_, "Expecting " + String(expr) + " to be false, was: " + String(_x_));
}

function assertEqual(expr, value) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  if (value instanceof RegExp) {
    ok(value.test(_x_), expr);
  } else if (value !== value) {
    ok(_x_ !== _x_, "Expecting " + String(expr) + " to be NaN, was: " + String(_x_));
  } else {
    strictEqual(_x_, value, expr);
  }
}

function assertThrows(expr, expected, message) {
  raises(function() { eval("(" + expr + ")"); }, expected, message);
}

function assertEpsilon(expr, value, epsilon) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  var p;
  if (_x_ === value) {
    p = true;
  } else {
    p = (Math.abs((_x_ - value)/Math.max(Math.abs(_x_), Math.abs(value))) < epsilon);
  }

  ok(p, expr + " was " + _x_ + ", expected " + value);
}
