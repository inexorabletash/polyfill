
function assertTrue(expr) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(_x_, String(expr) + " was: " + String(_x_) + ", expected true");
}

function assertFalse(expr) {
  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  ok(!_x_, String(expr) + " was: " + String(_x_) + ", expected false");
}

function assertEqual(expr, value) {
  function s(x) {
    return (1/Number(x) === -Infinity) ? "-0" : (1/Number(x) === Infinity) ? "+0" : String(x);
  }

  var _x_;
  try { eval("_x_ = (" + expr + ")"); } catch(e) { ok(false, expr + " threw exception: " + e); return; }
  if (value instanceof RegExp) {
    ok(value.test(_x_), s(expr) + " was: " + s(_x_) + ", expected to match: " + s(value));
  } else if (value !== value) {
    ok(_x_ !== _x_, s(expr) + " was: " + s(_x_) + ", expected NaN");
  } else if (value === 0) {
    ok(1/_x_ === 1/value, s(expr) + " was: " + s(_x_) + ", expected " + s(value));
  } else {
    strictEqual(_x_, value, s(expr) + " was: " + s(_x_) + ", expected " + s(value));
  }
}

function assertThrows(expr, expected) {
  raises(function() { eval("(" + expr + ")"); }, expected, String(expr) + " expected to throw");
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

  ok(p, expr + " was " + _x_ + ", expected approximately " + value);
}
