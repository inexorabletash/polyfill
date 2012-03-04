
test("Web Standards Polyfills", 64, function () {

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

  // window.atob() / window.btoa()
  assertEqual("window.btoa('')", '');
  assertEqual("window.atob('')", '');
  assertEqual("window.btoa('\\x00\\x01\\x02\\xfd\\xfe\\xff')", 'AAEC/f7/');
  assertEqual("window.atob('AAEC/f7/')", '\x00\x01\x02\xfd\xfe\xff');

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

test("Web Standards Shims", 45, function () {

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

test("Common Browser Extensions", function () {

  // String.prototype.trimLeft()
  assertEqual("''.trimLeft()", '');
  assertEqual("'  '.trimLeft()", '');
  assertEqual("'abc'.trimLeft()", 'abc');
  assertEqual("'   abc'.trimLeft()", 'abc');
  assertEqual("' \\t\\n\\rabc'.trimLeft()", 'abc');
  assertEqual("' a b c '.trimLeft()", 'a b c ');

  // String.prototype.trimRight()
  assertEqual("''.trimRight()", '');
  assertEqual("'  '.trimRight()", '');
  assertEqual("'abc'.trimRight()", 'abc');
  assertEqual("'abc   '.trimRight()", 'abc');
  assertEqual("'abc \\t\\n\\r'.trimRight()", 'abc');
  assertEqual("' a b c '.trimRight()", ' a b c');

  // String.prototype.quote()
  assertEqual("''.quote()", "\"\"");
  assertEqual("'abc'.quote()", "\"abc\"");
  assertEqual("'\\\"'.quote()", "\"\\\"\"");
  assertEqual("'\\b\\r\\n\\t\\f'.quote()", "\"\\b\\r\\n\\t\\f\"");
  //assertEqual("'\\u0000'.quote()", "\"\\x00\""); // Older FF produces \0
  assertEqual("'\\u001f'.quote()", "\"\\x1F\"");
  assertEqual("'\\u0020'.quote()", "\" \"");
  assertEqual("'\\u007f'.quote()", "\"\\x7F\"");
  assertEqual("'\\u0080'.quote()", "\"\\x80\"");
  assertEqual("'\\u00ff'.quote()", "\"\\xFF\"");
  assertEqual("'\\u0100'.quote()", "\"\\u0100\"");
  assertEqual("'\\u0fff'.quote()", "\"\\u0FFF\"");
  assertEqual("'\\u1000'.quote()", "\"\\u1000\"");
  assertEqual("'\\u1234'.quote()", "\"\\u1234\"");
  assertEqual("'\\ucdef'.quote()", "\"\\uCDEF\"");
  assertEqual("'\\uffff'.quote()", "\"\\uFFFF\"");
});


test("ECMAScript 5 Polyfills", 36, function () {

  // Object constructor properties

  assertEqual("Object.getPrototypeOf([])", Array.prototype);
  assertEqual("Object.getPrototypeOf({})", Object.prototype);

  p = { a: 1, b: 2 };
  C = function () { this.c = 3; };
  C.prototype = p;

  // Not supported by shim, since constructor is mutated
  // by prototype assignment.
  //assertEqual("Object.getPrototypeOf(new C)", p);
  assertEqual("Object.getPrototypeOf(Object.create(p))", p);

  assertEqual("String(Object.getOwnPropertyNames(new C))", 'c');

  o = Object.create(p, {d: {value: 4}, e: {value: 5}});
  assertEqual("o.a", 1);
  assertEqual("o.b", 2);
  assertEqual("o.d", 4);
  assertEqual("o.e", 5);

  Object.defineProperty(o, "c", {value: 3});
  assertEqual("o.c", 3);

  Object.defineProperties(o, {f: {value: 6}, g: {value: 7}});
  assertEqual("o.f", 6);
  assertEqual("o.g", 7);

  assertEqual("String(Object.keys({a: 1, b: 2, c: 3}))", 'a,b,c');

  // Function prototype properties

  assertEqual("((function(){ return this.foo; }).bind({foo:123}))()", 123);

  // Array constructor properties

  assertTrue("Array.isArray([])");
  assertTrue("Array.isArray(new Array)");
  assertFalse("Array.isArray({length:0})");

  // Array prototype properties

  assertEqual("[1,2,3,2,3].indexOf(3)", 2);
  assertEqual("[1,2,3,2,3].lastIndexOf(3)", 4);
  assertTrue("[0,2,4,6,8].every(function(x){return !(x % 2);})");
  assertFalse("[0,2,4,5,6].every(function(x){return !(x % 2);})");
  assertTrue("[1,2,3,4,5].some(function(x){return x > 3;})");
  assertFalse("[1,2,3,4,5].some(function(x){return x > 8;})");
  assertEqual("(function(){var t = 0; [1,2,3,4,5,6,7,8,9,10].forEach(function(x){t += x;}); return t;}())", 55);
  assertEqual("String([1,2,3,4,5].map(function(x){return x * x;}))", '1,4,9,16,25');
  assertEqual("String([1,2,3,4,5].filter(function(x){return x % 2;}))", '1,3,5');
  assertEqual("[1,2,3,4,5,6,7,8,9,10].reduce(function(a,b){return a-b;})", -53);
  assertEqual("[1,2,3,4,5,6,7,8,9,10].reduceRight(function(a,b){return a-b;})", -35);

  // String prototype properties

  assertEqual("''.trim()", '');
  assertEqual("'  '.trim()", '');
  assertEqual("'abc'.trim()", 'abc');
  assertEqual("'   abc   '.trim()", 'abc');
  assertEqual("' \\t\\n\\rabc\\t\\n\\r'.trim()", 'abc');
  assertEqual("' a b c '.trim()", 'a b c');

  // Date constructor properties

  assertTrue("Math.abs(Date.now() - Number(new Date())) < 100");

  // Date prototype properties

  // milliseconds are optional, so verify with a regexp
  assertEqual("new Date(0).toISOString()", /1970-01-01T00:00:00(\.000)?Z/);
  assertEqual("new Date(1e12).toISOString()", /2001-09-09T01:46:40(\.000)?Z/);

  delete p;
  delete C;
  delete o;
});
