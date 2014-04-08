
test("Web Standards Polyfills - Misc", 9, function () {

  // document.head
  assertTrue("document.head != null");
  assertEqual("document.head.tagName", "HEAD");

  // XMLHttpRequest
  assertTrue("XMLHttpRequest != null");
  assertTrue("new XMLHttpRequest() != null");
  assertEqual("XMLHttpRequest.UNSENT", 0);
  assertEqual("XMLHttpRequest.OPENED", 1);
  assertEqual("XMLHttpRequest.HEADERS_RECEIVED", 2);
  assertEqual("XMLHttpRequest.LOADING", 3);
  assertEqual("XMLHttpRequest.DONE", 4);
});

test("Web Standards Polyfills - base64 encoding", 4, function () {

  // window.atob() / window.btoa()
  assertEqual("window.btoa('')", '');
  assertEqual("window.atob('')", '');
  assertEqual("window.btoa('\\x00\\x01\\x02\\xfd\\xfe\\xff')", 'AAEC/f7/');
  assertEqual("window.atob('AAEC/f7/')", '\x00\x01\x02\xfd\xfe\xff');
});

test("Web Standards Polyfills - querySelector / getElementsByClassName", 22, function () {

  // document.querySelector()
  assertTrue("document.querySelector('#foof') === null");
  assertTrue("document.querySelector('#foo') !== null");
  assertTrue("document.querySelector('.gamma') === null");
  assertTrue("document.querySelector('.alpha') !== null");
  assertTrue("document.querySelector('.alpha') !== null");
  assertTrue("document.querySelector('#foo.alpha') !== null");
  assertTrue("document.querySelector('#bar.alpha') === null");

  // document.querySelectorAll()
  assertEqual("document.querySelectorAll('#foo').length", 1);
  assertEqual("document.querySelectorAll('#bar').length", 1);
  assertEqual("document.querySelectorAll('#baz').length", 1);
  assertEqual("document.querySelectorAll('#bat').length", 1);
  assertEqual("document.querySelectorAll('#qux').length", 0);
  assertEqual("document.querySelectorAll('.alpha').length", 2);
  assertEqual("document.querySelectorAll('.beta').length", 2);
  assertEqual("document.querySelectorAll('.gamma').length", 0);
  assertEqual("document.querySelectorAll('div.alpha').length", 1);
  assertEqual("document.querySelectorAll('div.beta').length", 1);
  assertEqual("document.querySelectorAll('span.alpha').length", 1);
  assertEqual("document.querySelectorAll('span.beta').length", 1);

  // document.getElementsByClassName()
  assertEqual("document.getElementsByClassName('alpha').length", 2);
  assertEqual("document.getElementsByClassName('beta').length", 2);
  assertEqual("document.getElementsByClassName('gamma').length", 0);
});

test("Web Standards Polyfills - Enumeration", 29, function () {

  // Node enumeration
  assertTrue("Node !== null");
  assertEqual("Node.ELEMENT_NODE", 1);
  assertEqual("Node.ATTRIBUTE_NODE", 2);
  assertEqual("Node.TEXT_NODE", 3);
  assertEqual("Node.CDATA_SECTION_NODE", 4);
  assertEqual("Node.ENTITY_REFERENCE_NODE", 5);
  assertEqual("Node.ENTITY_NODE", 6);
  assertEqual("Node.PROCESSING_INSTRUCTION_NODE", 7);
  assertEqual("Node.COMMENT_NODE", 8);
  assertEqual("Node.DOCUMENT_NODE", 9);
  assertEqual("Node.DOCUMENT_TYPE_NODE", 10);
  assertEqual("Node.DOCUMENT_FRAGMENT_NODE", 11);
  assertEqual("Node.NOTATION_NODE", 12);

  // DOMException enumeration
  assertTrue("DOMException !== null");
  assertEqual("DOMException.INDEX_SIZE_ERR", 1);
  assertEqual("DOMException.DOMSTRING_SIZE_ERR", 2);
  assertEqual("DOMException.HIERARCHY_REQUEST_ERR", 3);
  assertEqual("DOMException.WRONG_DOCUMENT_ERR", 4);
  assertEqual("DOMException.INVALID_CHARACTER_ERR", 5);
  assertEqual("DOMException.NO_DATA_ALLOWED_ERR", 6);
  assertEqual("DOMException.NO_MODIFICATION_ALLOWED_ERR", 7);
  assertEqual("DOMException.NOT_FOUND_ERR", 8);
  assertEqual("DOMException.NOT_SUPPORTED_ERR", 9);
  assertEqual("DOMException.INUSE_ATTRIBUTE_ERR", 10);
  assertEqual("DOMException.INVALID_STATE_ERR", 11);
  assertEqual("DOMException.SYNTAX_ERR", 12);
  assertEqual("DOMException.INVALID_MODIFICATION_ERR", 13);
  assertEqual("DOMException.NAMESPACE_ERR", 14);
  assertEqual("DOMException.INVALID_ACCESS_ERR", 15);
});

test("Web Standards Polyfills - Element.dataset and data-* attributes", function () {

  // dataset
  if ('dataset' in document.getElementById('datadiv')) {
    assertEqual("document.getElementById('datadiv').dataset.foo", "bar");
    assertEqual("document.getElementById('datadiv').dataset.bar", "123");
    assertEqual("document.getElementById('dataspan').dataset['123']", "blah"); // Broken in Chrome 23!
    assertTrue("!document.getElementById('dataspan').dataset['abc']");

    document.getElementById('datadiv').dataset.foo = "new";
    assertEqual("document.getElementById('datadiv').dataset.foo", "new");
  }
});

test("Helpers - getClassList() and getRelList()", 45, function () {

  // getClassList()
  assertEqual("getClassList(document.getElementById('baz')).length", 4);
  assertFalse("getClassList(document.getElementById('baz')).contains('alpha')");
  assertTrue("getClassList(document.getElementById('baz')).contains('beta')");
  assertFalse("getClassList(document.getElementById('baz')).contains('gamma')");
  assertTrue("getClassList(document.getElementById('baz')).contains('delta')");
  assertTrue("getClassList(document.getElementById('baz')).contains('epsilon')");
  assertTrue("getClassList(document.getElementById('baz')).contains('phi')");

  elem = document.createElement('span');
  elem.className = 'foo';

  assertEqual("getClassList(elem).length", 1);
  assertTrue("getClassList(elem).contains('foo')");
  assertFalse("getClassList(elem).contains('bar')");
  assertFalse("getClassList(elem).contains('baz')");
  getClassList(elem).add('baz');
  assertEqual("getClassList(elem).length", 2);
  assertTrue("getClassList(elem).contains('foo')");
  assertFalse("getClassList(elem).contains('bar')");
  assertTrue("getClassList(elem).contains('baz')");
  getClassList(elem).toggle('foo');
  assertEqual("getClassList(elem).length", 1);
  assertFalse("getClassList(elem).contains('foo')");
  assertFalse("getClassList(elem).contains('bar')");
  assertTrue("getClassList(elem).contains('baz')");
  getClassList(elem).toggle('bar');
  assertEqual("getClassList(elem).length", 2);
  assertFalse("getClassList(elem).contains('foo')");
  assertTrue("getClassList(elem).contains('bar')");
  assertTrue("getClassList(elem).contains('baz')");
  getClassList(elem).remove('baz');
  assertEqual("getClassList(elem).length", 1);
  assertFalse("getClassList(elem).contains('foo')");
  assertTrue("getClassList(elem).contains('bar')");
  assertFalse("getClassList(elem).contains('baz')");
  assertEqual("getClassList(elem).item(0)", 'bar');
  getClassList(elem).remove('bar');
  assertEqual("getClassList(elem).length", 0);

  elem = document.createElement('span');
  assertEqual("getClassList(elem).length", 0);

  assertThrows("getClassList(elem).contains('')");
  assertThrows("getClassList(elem).add('')");
  assertThrows("getClassList(elem).remove('')");
  assertThrows("getClassList(elem).toggle('')");

  assertThrows("getClassList(elem).contains('a b')");
  assertThrows("getClassList(elem).add('a b')");
  assertThrows("getClassList(elem).remove('a b')");
  assertThrows("getClassList(elem).toggle('a b')");

  // getRelList()
  elem = document.createElement('link');
  elem.setAttribute('rel', 'stylesheet');
  assertEqual("getRelList(elem).length", 1);
  assertTrue("getRelList(elem).contains('stylesheet')");
  assertFalse("getRelList(elem).contains('next')");
  assertFalse("getRelList(elem).contains('prev')");
  getRelList(elem).remove('stylesheet');
  getRelList(elem).add('next');
  getRelList(elem).toggle('prev');
  assertEqual("getRelList(elem).length", 2);
  assertFalse("getRelList(elem).contains('stylesheet')");
  assertTrue("getRelList(elem).contains('next')");

  // TODO: addEvent/removeEvent

  delete elem;
});
