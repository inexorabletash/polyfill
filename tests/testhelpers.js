
function assertTrue(_expr) {
  var _x_;
  try { eval("_x_ = (" + _expr + ")"); } catch(e) { ok(false, _expr + " threw exception: " + e); return; }
  ok(_x_, String(_expr) + " was: " + String(_x_) + ", expected true");
}

function assertFalse(_expr) {
  var _x_;
  try { eval("_x_ = (" + _expr + ")"); } catch(e) { ok(false, _expr + " threw exception: " + e); return; }
  ok(!_x_, String(_expr) + " was: " + String(_x_) + ", expected false");
}

function assertEqual(_expr, _value) {
  function _s(x) {
    return (1/Number(x) === -Infinity) ? "-0" : (1/Number(x) === Infinity) ? "+0" : String(x);
  }

  var _x;
  try { eval("_x = (" + _expr + ")"); } catch(e) { ok(false, _expr + " threw exception: " + e); return; }
  if (_value instanceof RegExp) {
    ok(_value.test(_x), _s(_expr) + " was: " + _s(_x) + ", expected to match: " + _s(_value));
  } else if (_value !== _value) {
    ok(_x !== _x, _s(_expr) + " was: " + _s(_x) + ", expected NaN");
  } else if (_value === 0) {
    ok(1/_x === 1/_value, _s(_expr) + " was: " + _s(_x) + ", expected " + _s(_value));
  } else {
    strictEqual(_x, _value, _s(_expr) + " was: " + _s(_x) + ", expected " + _s(_value));
  }
}

function assertThrows(_expr, expected) {
  raises(function() { eval("(" + _expr + ")"); }, expected, String(_expr) + " expected to throw");
}

function assertEpsilon(_expr, _value, _epsilon) {
  var _x;
  try { eval("_x = (" + _expr + ")"); } catch(e) { ok(false, _expr + " threw exception: " + e); return; }
  var p;
  if (_x === _value) {
    p = true;
  } else {
    p = (Math.abs((_x - _value)/Math.max(Math.abs(_x), Math.abs(_value))) < _epsilon);
  }

  ok(p, _expr + " was " + _x + ", expected approximately " + _value);
}
