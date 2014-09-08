
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

// Like QUnit's strictEqual, but NaN and -0 savvy
function stricterEqual(actual, expected, message) {

  function isPositiveZero(x) { return x === 0 && 1 / x === +Infinity; }
  function isNegativeZero(x) { return x === 0 && 1 / x === -Infinity; }
  function isReallyNaN(x) { return typeof x === 'number' && x !== x; }
  function str(x) { return isNegativeZero(x) ? "-0" : String(x); }

  if (isReallyNaN(expected)) {
    message = arguments.length > 2 ? message : "Expected " + str(expected) + " , saw: " + str(actual);
    ok(isReallyNaN(actual), message);
  } else if (expected === 0) {
    message = arguments.length > 2 ? message : "Expected " + str(expected) + " , saw: " + str(actual);
    ok(isPositiveZero(actual) === isPositiveZero(expected), message);
  } else {
    strictEqual(actual, expected, message);
  }
}

// Compare Typed Array with JavaScript array
function arrayEqual(typed_array, test) {
  var array = [], i, length = typed_array.length;
  for (i = 0; i < length; i += 1) {
    array[i] = typed_array.get(i); // See shim below
  }
  deepEqual(array, test, JSON.stringify(array) + " == " + JSON.stringify(test) + " ?");
}

var array_types = ['Int8Array', 'Uint8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array'];
array_types.forEach(function(typeName) {
  if (typeName in self) {
    var type = self[typeName];
    // Add a TypedArray.get(index) accessor if not present, for
    // testing native implementations.
    if (typeof type.prototype.get !== 'function') {
      type.prototype.get = function(idx) {
        return this[idx];
      };
    }
    // Shim to work with older impls that use "slice" instead of "subarray"
    if (typeof type.prototype.subarray !== 'function') {
      type.prototype.subarray = type.prototype.slice;
    }
  }
});
