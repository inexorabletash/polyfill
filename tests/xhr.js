/*global QUnit*/

QUnit.test("Constants", function(assert) {
  assert.expect(7);

  // XMLHttpRequest
  assert.notEqual(XMLHttpRequest, null);
  assert.notEqual(new XMLHttpRequest(), null);
  assert.equal(XMLHttpRequest.UNSENT, 0);
  assert.equal(XMLHttpRequest.OPENED, 1);
  assert.equal(XMLHttpRequest.HEADERS_RECEIVED, 2);
  assert.equal(XMLHttpRequest.LOADING, 3);
  assert.equal(XMLHttpRequest.DONE, 4);
});
