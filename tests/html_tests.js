test("Parser Shiv", function () {
  var div = document.getElementById('sectiondiv');
  var section = document.getElementById('section');
  var span = document.getElementById('sectionspan');
  equal(div, section.parentNode, 'div should be parent of section');
  equal(section, span.parentNode, 'section should be parent of span');
});

test("document.head", function () {
  expect(2);

  // document.head
  assertTrue("document.head != null");
  assertEqual("document.head.tagName", "HEAD");
});

test("base64 encoding", function () {
  expect(4);

  // window.atob() / window.btoa()
  assertEqual("window.btoa('')", '');
  assertEqual("window.atob('')", '');
  assertEqual("window.btoa('\\x00\\x01\\x02\\xfd\\xfe\\xff')", 'AAEC/f7/');
  assertEqual("window.atob('AAEC/f7/')", '\x00\x01\x02\xfd\xfe\xff');
});

test("Element.dataset and data-* attributes", function () {

  // dataset
  if ('dataset' in document.getElementById('datadiv')) {
    expect(5);
    assertEqual("document.getElementById('datadiv').dataset.foo", "bar");
    assertEqual("document.getElementById('datadiv').dataset.bar", "123");
    assertEqual("document.getElementById('dataspan').dataset['123']", "blah"); // Broken in Chrome 23!
    assertTrue("!document.getElementById('dataspan').dataset['abc']");

    document.getElementById('datadiv').dataset.foo = "new";
    assertEqual("document.getElementById('datadiv').dataset.foo", "new");
  }
});
