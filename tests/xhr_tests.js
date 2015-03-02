test("Constants", function () {
  expect(7);

  // XMLHttpRequest
  assertTrue("XMLHttpRequest != null");
  assertTrue("new XMLHttpRequest() != null");
  assertEqual("XMLHttpRequest.UNSENT", 0);
  assertEqual("XMLHttpRequest.OPENED", 1);
  assertEqual("XMLHttpRequest.HEADERS_RECEIVED", 2);
  assertEqual("XMLHttpRequest.LOADING", 3);
  assertEqual("XMLHttpRequest.DONE", 4);
});
