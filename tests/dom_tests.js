test("querySelector / getElementsByClassName", function () {
  expect(22);

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

test("Enumerations", function () {
  expect(29);

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

test("Helpers - getClassList() and getRelList()", function () {
  expect(59);

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

  assertTrue("getClassList(elem).toggle('a')");
  assertTrue("getClassList(elem).contains('a')");
  assertFalse("getClassList(elem).toggle('a')");
  assertFalse("getClassList(elem).contains('a')");
  assertTrue("getClassList(elem).toggle('a')");
  assertTrue("getClassList(elem).contains('a')");

  assertFalse("getClassList(elem).toggle('a', false)");
  assertFalse("getClassList(elem).contains('a')");
  assertTrue("getClassList(elem).toggle('a', true)");
  assertTrue("getClassList(elem).contains('a')");
  assertTrue("getClassList(elem).toggle('a', true)");
  assertTrue("getClassList(elem).contains('a')");
  assertFalse("getClassList(elem).toggle('a', false)");
  assertFalse("getClassList(elem).contains('a')");

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

test('next/previousElementSibling', function() {
  expect(6);

  assertTrue("document.querySelector('#one').previousElementSibling === null");
  assertTrue("document.querySelector('#two').previousElementSibling === document.querySelector('#one')");
  assertTrue("document.querySelector('#three').previousElementSibling === document.querySelector('#two')");

  assertTrue("document.querySelector('#one').nextElementSibling === document.querySelector('#two')");
  assertTrue("document.querySelector('#two').nextElementSibling === document.querySelector('#three')");
  assertTrue("document.querySelector('#three').nextElementSibling === null");
});

test("matches", function() {
  assertTrue("document.querySelector('#foo').matches('.alpha')");
  assertTrue("document.querySelector('#baz').matches('.beta')");
});

test('Mixin ParentNode: prepend()', function() {
  elem = document.querySelector('#mixin-parentnode');
  var orig = elem.innerHTML;

  assertEqual('elem.childNodes.length', 0);
  assertEqual('elem.childElementCount', 0);
  elem.prepend(document.createElement('span'));
  assertEqual('elem.childNodes.length', 1);
  assertEqual('elem.childElementCount', 1);
  assertEqual('elem.childNodes[0].nodeType', Node.ELEMENT_NODE);

  elem.prepend('text');
  assertEqual('elem.childNodes.length', 2);
  assertEqual('elem.childElementCount', 1);

  assertEqual('elem.childNodes[0].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[1].nodeType', Node.ELEMENT_NODE);

  elem.prepend('t2', document.createElement('span'), 't3');
  assertEqual('elem.childNodes.length', 5);
  assertEqual('elem.childElementCount', 2);

  assertEqual('elem.childNodes[0].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[0].textContent', 't2');
  assertEqual('elem.childNodes[1].nodeType', Node.ELEMENT_NODE);
  assertEqual('elem.childNodes[2].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[2].textContent', 't3');
  assertEqual('elem.childNodes[3].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[4].nodeType', Node.ELEMENT_NODE);

  elem.innerHTML = orig;
  delete elem;
});

test('Mixin ParentNode: append()', function() {
  elem = document.querySelector('#mixin-parentnode');
  var orig = elem.innerHTML;

  assertEqual('elem.childNodes.length', 0);
  assertEqual('elem.childElementCount', 0);
  elem.append(document.createElement('span'));
  assertEqual('elem.childNodes.length', 1);
  assertEqual('elem.childElementCount', 1);
  assertEqual('elem.childNodes[0].nodeType', Node.ELEMENT_NODE);

  elem.append('text');
  assertEqual('elem.childNodes.length', 2);
  assertEqual('elem.childElementCount', 1);

  assertEqual('elem.childNodes[0].nodeType', Node.ELEMENT_NODE);
  assertEqual('elem.childNodes[1].nodeType', Node.TEXT_NODE);

  elem.append('t2', document.createElement('span'), 't3');
  assertEqual('elem.childNodes.length', 5);
  assertEqual('elem.childElementCount', 2);

  assertEqual('elem.childNodes[0].nodeType', Node.ELEMENT_NODE);
  assertEqual('elem.childNodes[1].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[2].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[2].textContent', 't2');
  assertEqual('elem.childNodes[3].nodeType', Node.ELEMENT_NODE);
  assertEqual('elem.childNodes[4].nodeType', Node.TEXT_NODE);
  assertEqual('elem.childNodes[4].textContent', 't3');

  elem.innerHTML = orig;
  delete elem;
});

test('Mixin ChildNode: before()', function() {
  parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  child = document.querySelector('#mixin-childnode *');

  assertEqual('parent.childNodes.length', 1);
  child.before(document.createElement('span'));
  assertEqual('parent.childNodes.length', 2);
  assertEqual('parent.childNodes[1]', child);

  child.before('t1', document.createElement('span'), 't2');
  assertEqual('parent.childNodes.length', 5);
  assertEqual('parent.childNodes[0].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[1].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[1].textContent', 't1');
  assertEqual('parent.childNodes[2].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[3].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[3].textContent', 't2');
  assertEqual('parent.childNodes[4].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[4]', child);

  parent.innerHTML = orig;
  delete parent;
  delete child;
});

test('Mixin ChildNode: after()', function() {
  parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  child = document.querySelector('#mixin-childnode *');

  assertEqual('parent.childNodes.length', 1);
  child.after(document.createElement('span'));
  assertEqual('parent.childNodes.length', 2);
  assertEqual('parent.childNodes[0]', child);

  child.after('t1', document.createElement('span'), 't2');
  assertEqual('parent.childNodes.length', 5);
  assertEqual('parent.childNodes[0].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[0]', child);
  assertEqual('parent.childNodes[1].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[1].textContent', 't1');
  assertEqual('parent.childNodes[2].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[3].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[3].textContent', 't2');
  assertEqual('parent.childNodes[4].nodeType', Node.ELEMENT_NODE);

  parent.innerHTML = orig;
  delete parent;
  delete child;
});

test('Mixin ChildNode: replaceWith()', function() {
  parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  child = document.querySelector('#mixin-childnode *');

  assertEqual('parent.childNodes.length', 1);
  assertEqual('parent.childNodes[0]', child);
  child.replaceWith(document.createElement('span'));
  assertEqual('parent.childNodes.length', 1);
  assertFalse('parent.childNodes[0] === child');
  assertEqual('child.parentNode', null);

  parent.innerHTML = orig;
  child = document.querySelector('#mixin-childnode *');

  assertEqual('parent.childNodes.length', 1);
  assertEqual('parent.childNodes[0]', child);
  child.replaceWith('t1', document.createElement('span'), 't2');
  assertEqual('parent.childNodes.length', 3);
  assertEqual('parent.childNodes[0].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[0].textContent', 't1');
  assertEqual('parent.childNodes[1].nodeType', Node.ELEMENT_NODE);
  assertEqual('parent.childNodes[2].nodeType', Node.TEXT_NODE);
  assertEqual('parent.childNodes[2].textContent', 't2');
  assertEqual('child.parentNode', null);

  parent.innerHTML = orig;
  delete parent;
  delete child;
});

test('Mixin ChildNode: remove()', function() {
  parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  child = document.querySelector('#mixin-childnode *');

  assertEqual('parent.childNodes.length', 1);
  assertEqual('parent.childNodes[0]', child);
  child.remove(document.createElement('span'));
  assertEqual('parent.childNodes.length', 0);
  assertEqual('child.parentNode', null);

  parent.innerHTML = orig;
  delete parent;
  delete child;
});

test('Mixin ParentNode: More prepend(), append()', function() {
  var div = document.createElement('div');
  equal(div.textContent, '', 'div should start empty');

  var span = document.createElement('span');
  equal(span.textContent, '', 'span should start empty');
  span.append('s');
  equal(span.textContent, 's', 'span should have inserted text');

  div.prepend('1', span);
  equal(div.childNodes.length, 2, 'div should have only two children inserted');
  equal(div.textContent, '1s', 'div should have two children inserted');

  div.append(span, '2');
  equal(div.childNodes.length, 3, 'div should have only one new child inserted');
  equal(div.textContent, '1s2', 'div should have only one new child inserted');

  span.before('a', 'b');
  equal(div.childNodes.length, 5, 'div should have two new children inserted');
  equal(div.textContent, '1abs2', 'div should have two new children inserted');

  span.after('e', 'f');
  equal(div.childNodes.length, 7, 'div should have two new children inserted');
  equal(div.textContent, '1absef2', 'div should have two new children inserted');

  span.replaceWith('c', 'd');
  equal(div.childNodes.length, 8, 'replaceWith() should replace target with two nodes');
  equal(div.textContent, '1abcdef2', 'replaceWith() should replace target with two nodes');
});

test('Mixin ChildNode: More before(), after()', function() {
  var div = document.createElement('div');
  var span = document.createElement('span');
  span.append('s');
  div.append(span);
  span.after('1');
  equal(div.textContent, 's1', 'after() should work on last child');
  span.after('2');
  equal(div.textContent, 's21', 'after() should work on not last child');
  span.before('3');
  equal(div.textContent, '3s21', 'before() should work on first child');
  span.before('4');
  equal(div.textContent, '34s21', 'before() should work on not first child');
});

test('Mixin ChildNode: More remove()', function() {
  var div = document.createElement('div');
  var span = document.createElement('span');
  span.append('s');
  div.append('a', span, 'b');
  equal(div.textContent, 'asb');
  span.remove();
  equal(div.textContent, 'ab', 'remove() should remove child');

  div = document.createElement('div');
  div.append(span, 'a', 'b');
  equal(div.textContent, 'sab');
  span.remove();
  equal(div.textContent, 'ab', 'remove() should remove child if first');

  div = document.createElement('div');
  div.append('a', 'b', span);
  equal(div.textContent, 'abs');
  span.remove();
  equal(div.textContent, 'ab', 'remove() should remove child if last');
});

test('Mixin ChildNode: remove() - Behavior when no parent node', function() {
  var div = document.createElement('div');
  var span = document.createElement('span');
  equal(div.parentNode, null);
  equal(span.parentNode, null);

  div.before(span);
  equal(span.parentNode, null);

  div.after(span);
  equal(span.parentNode, null);

  div.replaceWith(span);
  equal(span.parentNode, null);

  div.remove(); // Shouldn't throw
});

test('Mixin ChildNode: prepend, append, replaceWith - Behavior with no arguments', function() {
  var div = document.createElement('div');
  var span = document.createElement('span');
  div.prepend();
  div.append();

  div.append(span);
  span.before();
  span.after();
  equal(div.childNodes.length, 1);
  equal(span.parentNode, div);
  span.replaceWith();
  equal(div.childNodes.length, 0);
  equal(span.parentNode, null);
});

test('Mixin ChildNode: before, after, replaceWith - Behavior when nodes contains context node or siblings', function() {
  function span(t) {
    var s = document.createElement('span');
    s.append(t);
    return s;
  }
  var s1 = span('1');
  var s2 = span('2');
  var s3 = span('3');
  var s4 = span('4');

  var div = document.createElement('div');
  function reset() {
    div.append(s1, s2, s3, s4);
    equal(div.textContent, '1234');
  }

  reset();
  s2.replaceWith(s3, s2);
  equal(div.textContent, '1324', 'replaceWith should handle replacing self');

  reset();
  s1.before(s3, s2, s1);
  equal(div.textContent, '3214', 'before should handle replacing self');

  reset();
  s2.before(s3, s2, s1);
  equal(div.textContent, '3214', 'before should work when prior is removed');

  reset();
  s4.after(s4, s3, s2);
  equal(div.textContent, '1432', 'after should handle replacing self');

  reset();
  s3.after(s4, s3, s2);
  equal(div.textContent, '1432', 'after should work when successor is removed');
});
