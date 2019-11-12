/*global QUnit, getClassList, getRelList*/
QUnit.test("querySelector / getElementsByClassName", function(assert) {
  assert.expect(22);

  // document.querySelector()
  assert.equal(document.querySelector('#foof'), null);
  assert.notEqual(document.querySelector('#foo'), null);
  assert.equal(document.querySelector('.gamma'), null);
  assert.notEqual(document.querySelector('.alpha'), null);
  assert.notEqual(document.querySelector('.alpha'), null);
  assert.notEqual(document.querySelector('#foo.alpha'), null);
  assert.equal(document.querySelector('#bar.alpha'), null);

  // document.querySelectorAll()
  assert.equal(document.querySelectorAll('#foo').length, 1);
  assert.equal(document.querySelectorAll('#bar').length, 1);
  assert.equal(document.querySelectorAll('#baz').length, 1);
  assert.equal(document.querySelectorAll('#bat').length, 1);
  assert.equal(document.querySelectorAll('#qux').length, 0);
  assert.equal(document.querySelectorAll('.alpha').length, 2);
  assert.equal(document.querySelectorAll('.beta').length, 2);
  assert.equal(document.querySelectorAll('.gamma').length, 0);
  assert.equal(document.querySelectorAll('div.alpha').length, 1);
  assert.equal(document.querySelectorAll('div.beta').length, 1);
  assert.equal(document.querySelectorAll('span.alpha').length, 1);
  assert.equal(document.querySelectorAll('span.beta').length, 1);

  // document.getElementsByClassName()
  assert.equal(document.getElementsByClassName('alpha').length, 2);
  assert.equal(document.getElementsByClassName('beta').length, 2);
  assert.equal(document.getElementsByClassName('gamma').length, 0);
});

QUnit.test("Enumerations", function(assert) {
  assert.expect(29);

  // Node enumeration
  assert.notEqual(Node, null);
  assert.equal(Node.ELEMENT_NODE, 1);
  assert.equal(Node.ATTRIBUTE_NODE, 2);
  assert.equal(Node.TEXT_NODE, 3);
  assert.equal(Node.CDATA_SECTION_NODE, 4);
  assert.equal(Node.ENTITY_REFERENCE_NODE, 5);
  assert.equal(Node.ENTITY_NODE, 6);
  assert.equal(Node.PROCESSING_INSTRUCTION_NODE, 7);
  assert.equal(Node.COMMENT_NODE, 8);
  assert.equal(Node.DOCUMENT_NODE, 9);
  assert.equal(Node.DOCUMENT_TYPE_NODE, 10);
  assert.equal(Node.DOCUMENT_FRAGMENT_NODE, 11);
  assert.equal(Node.NOTATION_NODE, 12);

  // DOMException enumeration
  assert.notEqual(DOMException, null);
  assert.equal(DOMException.INDEX_SIZE_ERR, 1);
  assert.equal(DOMException.DOMSTRING_SIZE_ERR, 2);
  assert.equal(DOMException.HIERARCHY_REQUEST_ERR, 3);
  assert.equal(DOMException.WRONG_DOCUMENT_ERR, 4);
  assert.equal(DOMException.INVALID_CHARACTER_ERR, 5);
  assert.equal(DOMException.NO_DATA_ALLOWED_ERR, 6);
  assert.equal(DOMException.NO_MODIFICATION_ALLOWED_ERR, 7);
  assert.equal(DOMException.NOT_FOUND_ERR, 8);
  assert.equal(DOMException.NOT_SUPPORTED_ERR, 9);
  assert.equal(DOMException.INUSE_ATTRIBUTE_ERR, 10);
  assert.equal(DOMException.INVALID_STATE_ERR, 11);
  assert.equal(DOMException.SYNTAX_ERR, 12);
  assert.equal(DOMException.INVALID_MODIFICATION_ERR, 13);
  assert.equal(DOMException.NAMESPACE_ERR, 14);
  assert.equal(DOMException.INVALID_ACCESS_ERR, 15);
});

QUnit.test("Helpers - getClassList() and getRelList()", function(assert) {
  assert.expect(59);

  // getClassList()
  assert.equal(getClassList(document.getElementById('baz')).length, 4);
  assert.notOk(getClassList(document.getElementById('baz')).contains('alpha'));
  assert.ok(getClassList(document.getElementById('baz')).contains('beta'));
  assert.notOk(getClassList(document.getElementById('baz')).contains('gamma'));
  assert.ok(getClassList(document.getElementById('baz')).contains('delta'));
  assert.ok(getClassList(document.getElementById('baz')).contains('epsilon'));
  assert.ok(getClassList(document.getElementById('baz')).contains('phi'));

  var elem = document.createElement('span');
  elem.className = 'foo';

  assert.equal(getClassList(elem).length, 1);
  assert.ok(getClassList(elem).contains('foo'));
  assert.notOk(getClassList(elem).contains('bar'));
  assert.notOk(getClassList(elem).contains('baz'));
  getClassList(elem).add('baz');
  assert.equal(getClassList(elem).length, 2);
  assert.ok(getClassList(elem).contains('foo'));
  assert.notOk(getClassList(elem).contains('bar'));
  assert.ok(getClassList(elem).contains('baz'));
  getClassList(elem).toggle('foo');
  assert.equal(getClassList(elem).length, 1);
  assert.notOk(getClassList(elem).contains('foo'));
  assert.notOk(getClassList(elem).contains('bar'));
  assert.ok(getClassList(elem).contains('baz'));
  getClassList(elem).toggle('bar');
  assert.equal(getClassList(elem).length, 2);
  assert.notOk(getClassList(elem).contains('foo'));
  assert.ok(getClassList(elem).contains('bar'));
  assert.ok(getClassList(elem).contains('baz'));
  getClassList(elem).remove('baz');
  assert.equal(getClassList(elem).length, 1);
  assert.notOk(getClassList(elem).contains('foo'));
  assert.ok(getClassList(elem).contains('bar'));
  assert.notOk(getClassList(elem).contains('baz'));
  assert.equal(getClassList(elem).item(0), 'bar');
  getClassList(elem).remove('bar');
  assert.equal(getClassList(elem).length, 0);

  assert.ok(getClassList(elem).toggle('a'));
  assert.ok(getClassList(elem).contains('a'));
  assert.notOk(getClassList(elem).toggle('a'));
  assert.notOk(getClassList(elem).contains('a'));
  assert.ok(getClassList(elem).toggle('a'));
  assert.ok(getClassList(elem).contains('a'));

  assert.notOk(getClassList(elem).toggle('a', false));
  assert.notOk(getClassList(elem).contains('a'));
  assert.ok(getClassList(elem).toggle('a', true));
  assert.ok(getClassList(elem).contains('a'));
  assert.ok(getClassList(elem).toggle('a', true));
  assert.ok(getClassList(elem).contains('a'));
  assert.notOk(getClassList(elem).toggle('a', false));
  assert.notOk(getClassList(elem).contains('a'));

  elem = document.createElement('span');
  assert.equal(getClassList(elem).length, 0);

  assert.throws(function() { getClassList(elem).contains(''); });
  assert.throws(function() { getClassList(elem).add(''); });
  assert.throws(function() { getClassList(elem).remove(''); });
  assert.throws(function() { getClassList(elem).toggle(''); });

  assert.throws(function() { getClassList(elem).contains('a b'); });
  assert.throws(function() { getClassList(elem).add('a b'); });
  assert.throws(function() { getClassList(elem).remove('a b'); });
  assert.throws(function() { getClassList(elem).toggle('a b'); });

  // getRelList()
  elem = document.createElement('link');
  elem.setAttribute('rel', 'stylesheet');
  assert.equal(getRelList(elem).length, 1);
  assert.ok(getRelList(elem).contains('stylesheet'));
  assert.notOk(getRelList(elem).contains('next'));
  assert.notOk(getRelList(elem).contains('prev'));
  getRelList(elem).remove('stylesheet');
  getRelList(elem).add('next');
  getRelList(elem).toggle('prev');
  assert.equal(getRelList(elem).length, 2);
  assert.notOk(getRelList(elem).contains('stylesheet'));
  assert.ok(getRelList(elem).contains('next'));

  // TODO: addEvent/removeEvent
});

QUnit.test('next/previousElementSibling', function(assert) {
  assert.expect(6);

  assert.equal(document.querySelector('#one').previousElementSibling, null);
  assert.equal(document.querySelector('#two').previousElementSibling, document.querySelector('#one'));
  assert.equal(document.querySelector('#three').previousElementSibling, document.querySelector('#two'));

  assert.equal(document.querySelector('#one').nextElementSibling, document.querySelector('#two'));
  assert.equal(document.querySelector('#two').nextElementSibling, document.querySelector('#three'));
  assert.equal(document.querySelector('#three').nextElementSibling, null);
});

QUnit.test('first/lastElementChild, childElementCount', function(assert) {
  assert.expect(6);

  assert.equal(document.querySelector('#mixed').firstElementChild, document.querySelector('#one'));
  assert.equal(document.querySelector('#one').firstElementChild, null);

  assert.equal(document.querySelector('#mixed').lastElementChild, document.querySelector('#three'));
  assert.equal(document.querySelector('#one').lastElementChild, null);

  assert.equal(document.querySelector('#mixed').childElementCount, 3);
  assert.equal(document.querySelector('#one').childElementCount, 0);
});

QUnit.test("matches", function(assert) {
  assert.ok(document.querySelector('#foo').matches('.alpha'));
  assert.ok(document.querySelector('#baz').matches('.beta'));
});

QUnit.test("closest", function(assert) {
  assert.equal(document.querySelector('#bar').closest('#foo'), document.querySelector('#foo'));
  assert.equal(document.querySelector('#baz').closest('#foo'), document.querySelector('#foo'));
  assert.equal(document.querySelector('#foo').closest('#foo'), document.querySelector('#foo'));
  assert.notOk(document.querySelector('#baz').closest('#bat'));
});

QUnit.test('Mixin ParentNode: prepend()', function(assert) {
  var elem = document.querySelector('#mixin-parentnode');
  var orig = elem.innerHTML;

  assert.equal(elem.childNodes.length, 0);
  assert.equal(elem.childElementCount, 0);
  elem.prepend(document.createElement('span'));
  assert.equal(elem.childNodes.length, 1);
  assert.equal(elem.childElementCount, 1);
  assert.equal(elem.childNodes[0].nodeType, Node.ELEMENT_NODE);

  elem.prepend('text');
  assert.equal(elem.childNodes.length, 2);
  assert.equal(elem.childElementCount, 1);

  assert.equal(elem.childNodes[0].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[1].nodeType, Node.ELEMENT_NODE);

  elem.prepend('t2', document.createElement('span'), 't3');
  assert.equal(elem.childNodes.length, 5);
  assert.equal(elem.childElementCount, 2);

  assert.equal(elem.childNodes[0].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[0].textContent, 't2');
  assert.equal(elem.childNodes[1].nodeType, Node.ELEMENT_NODE);
  assert.equal(elem.childNodes[2].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[2].textContent, 't3');
  assert.equal(elem.childNodes[3].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[4].nodeType, Node.ELEMENT_NODE);

  elem.innerHTML = orig;
});

QUnit.test('Mixin ParentNode: append()', function(assert) {
  var elem = document.querySelector('#mixin-parentnode');
  var orig = elem.innerHTML;

  assert.equal(elem.childNodes.length, 0);
  assert.equal(elem.childElementCount, 0);
  elem.append(document.createElement('span'));
  assert.equal(elem.childNodes.length, 1);
  assert.equal(elem.childElementCount, 1);
  assert.equal(elem.childNodes[0].nodeType, Node.ELEMENT_NODE);

  elem.append('text');
  assert.equal(elem.childNodes.length, 2);
  assert.equal(elem.childElementCount, 1);

  assert.equal(elem.childNodes[0].nodeType, Node.ELEMENT_NODE);
  assert.equal(elem.childNodes[1].nodeType, Node.TEXT_NODE);

  elem.append('t2', document.createElement('span'), 't3');
  assert.equal(elem.childNodes.length, 5);
  assert.equal(elem.childElementCount, 2);

  assert.equal(elem.childNodes[0].nodeType, Node.ELEMENT_NODE);
  assert.equal(elem.childNodes[1].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[2].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[2].textContent, 't2');
  assert.equal(elem.childNodes[3].nodeType, Node.ELEMENT_NODE);
  assert.equal(elem.childNodes[4].nodeType, Node.TEXT_NODE);
  assert.equal(elem.childNodes[4].textContent, 't3');

  elem.innerHTML = orig;
});

QUnit.test('Mixin ChildNode: before()', function(assert) {
  var parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  var child = document.querySelector('#mixin-childnode *');

  assert.equal(parent.childNodes.length, 1);
  child.before(document.createElement('span'));
  assert.equal(parent.childNodes.length, 2);
  assert.equal(parent.childNodes[1], child);

  child.before('t1', document.createElement('span'), 't2');
  assert.equal(parent.childNodes.length, 5);
  assert.equal(parent.childNodes[0].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[1].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[1].textContent, 't1');
  assert.equal(parent.childNodes[2].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[3].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[3].textContent, 't2');
  assert.equal(parent.childNodes[4].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[4], child);

  parent.innerHTML = orig;
});

QUnit.test('Mixin ChildNode: after()', function(assert) {
  var parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  var child = document.querySelector('#mixin-childnode *');

  assert.equal(parent.childNodes.length, 1);
  child.after(document.createElement('span'));
  assert.equal(parent.childNodes.length, 2);
  assert.equal(parent.childNodes[0], child);

  child.after('t1', document.createElement('span'), 't2');
  assert.equal(parent.childNodes.length, 5);
  assert.equal(parent.childNodes[0].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[0], child);
  assert.equal(parent.childNodes[1].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[1].textContent, 't1');
  assert.equal(parent.childNodes[2].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[3].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[3].textContent, 't2');
  assert.equal(parent.childNodes[4].nodeType, Node.ELEMENT_NODE);

  parent.innerHTML = orig;
});

QUnit.test('Mixin ChildNode: replaceWith()', function(assert) {
  var parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  var child = document.querySelector('#mixin-childnode *');

  assert.equal(parent.childNodes.length, 1);
  assert.equal(parent.childNodes[0], child);
  child.replaceWith(document.createElement('span'));
  assert.equal(parent.childNodes.length, 1);
  assert.notEqual(parent.childNodes[0], child);
  assert.equal(child.parentNode, null);

  parent.innerHTML = orig;
  child = document.querySelector('#mixin-childnode *');

  assert.equal(parent.childNodes.length, 1);
  assert.equal(parent.childNodes[0], child);
  child.replaceWith('t1', document.createElement('span'), 't2');
  assert.equal(parent.childNodes.length, 3);
  assert.equal(parent.childNodes[0].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[0].textContent, 't1');
  assert.equal(parent.childNodes[1].nodeType, Node.ELEMENT_NODE);
  assert.equal(parent.childNodes[2].nodeType, Node.TEXT_NODE);
  assert.equal(parent.childNodes[2].textContent, 't2');
  assert.equal(child.parentNode, null);

  parent.innerHTML = orig;
});

QUnit.test('Mixin ChildNode: remove()', function(assert) {
  var parent = document.querySelector('#mixin-childnode');
  var orig = parent.innerHTML;
  var child = document.querySelector('#mixin-childnode *');

  assert.equal(parent.childNodes.length, 1);
  assert.equal(parent.childNodes[0], child);
  child.remove(document.createElement('span'));
  assert.equal(parent.childNodes.length, 0);
  assert.equal(child.parentNode, null);

  parent.innerHTML = orig;
});

QUnit.test('Mixin ParentNode: More prepend(), append()', function(assert) {
  var div = document.createElement('div');
  assert.equal(div.textContent, '', 'div should start empty');

  var span = document.createElement('span');
  assert.equal(span.textContent, '', 'span should start empty');
  span.append('s');
  assert.equal(span.textContent, 's', 'span should have inserted text');

  div.prepend('1', span);
  assert.equal(div.childNodes.length, 2, 'div should have only two children inserted');
  assert.equal(div.textContent, '1s', 'div should have two children inserted');

  div.append(span, '2');
  assert.equal(div.childNodes.length, 3, 'div should have only one new child inserted');
  assert.equal(div.textContent, '1s2', 'div should have only one new child inserted');

  span.before('a', 'b');
  assert.equal(div.childNodes.length, 5, 'div should have two new children inserted');
  assert.equal(div.textContent, '1abs2', 'div should have two new children inserted');

  span.after('e', 'f');
  assert.equal(div.childNodes.length, 7, 'div should have two new children inserted');
  assert.equal(div.textContent, '1absef2', 'div should have two new children inserted');

  span.replaceWith('c', 'd');
  assert.equal(div.childNodes.length, 8, 'replaceWith() should replace target with two nodes');
  assert.equal(div.textContent, '1abcdef2', 'replaceWith() should replace target with two nodes');
});

QUnit.test('Mixin ChildNode: More before(), after()', function(assert) {
  var div = document.createElement('div');
  var span = document.createElement('span');
  span.append('s');
  div.append(span);
  span.after('1');
  assert.equal(div.textContent, 's1', 'after() should work on last child');
  span.after('2');
  assert.equal(div.textContent, 's21', 'after() should work on not last child');
  span.before('3');
  assert.equal(div.textContent, '3s21', 'before() should work on first child');
  span.before('4');
  assert.equal(div.textContent, '34s21', 'before() should work on not first child');
});

QUnit.test('Mixin ChildNode: More remove()', function(assert) {
  var div = document.createElement('div');
  var span = document.createElement('span');
  span.append('s');
  div.append('a', span, 'b');
  assert.equal(div.textContent, 'asb');
  span.remove();
  assert.equal(div.textContent, 'ab', 'remove() should remove child');

  div = document.createElement('div');
  div.append(span, 'a', 'b');
  assert.equal(div.textContent, 'sab');
  span.remove();
  assert.equal(div.textContent, 'ab', 'remove() should remove child if first');

  div = document.createElement('div');
  div.append('a', 'b', span);
  assert.equal(div.textContent, 'abs');
  span.remove();
  assert.equal(div.textContent, 'ab', 'remove() should remove child if last');
});

QUnit.test('Mixin ChildNode: remove() - Behavior when no parent node', function(assert) {
  var div = document.createElement('div');
  var span = document.createElement('span');
  assert.equal(div.parentNode, null);
  assert.equal(span.parentNode, null);

  div.before(span);
  assert.equal(span.parentNode, null);

  div.after(span);
  assert.equal(span.parentNode, null);

  div.replaceWith(span);
  assert.equal(span.parentNode, null);

  div.remove(); // Shouldn't throw
});

QUnit.test('Mixin ChildNode: prepend, append, replaceWith - Behavior with no arguments', function(assert) {
  var div = document.createElement('div');
  var span = document.createElement('span');
  div.prepend();
  div.append();

  div.append(span);
  span.before();
  span.after();
  assert.equal(div.childNodes.length, 1);
  assert.equal(span.parentNode, div);
  span.replaceWith();
  assert.equal(div.childNodes.length, 0);
  assert.equal(span.parentNode, null);
});

QUnit.test('Mixin ChildNode: before, after, replaceWith - Behavior when nodes contains context node or siblings', function(assert) {
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
    assert.equal(div.textContent, '1234');
  }

  reset();
  s2.replaceWith(s3, s2);
  assert.equal(div.textContent, '1324', 'replaceWith should handle replacing self');

  reset();
  s1.before(s3, s2, s1);
  assert.equal(div.textContent, '3214', 'before should handle replacing self');

  reset();
  s2.before(s3, s2, s1);
  assert.equal(div.textContent, '3214', 'before should work when prior is removed');

  reset();
  s4.after(s4, s3, s2);
  assert.equal(div.textContent, '1432', 'after should handle replacing self');

  reset();
  s3.after(s4, s3, s2);
  assert.equal(div.textContent, '1432', 'after should work when successor is removed');
});

QUnit.test('CustomEvent: addEventListener and dispatchEvent', function(assert) {
  var done = assert.async();
  var div = document.getElementById('customev');
  div.addEventListener('customevent', function(e) {
    assert.equal(e.detail.teststring, "test string");
    done();
  });
  assert.ok(CustomEvent instanceof Function);
  div.dispatchEvent(new CustomEvent("customevent", { detail: { teststring: "test string" } }));
});
