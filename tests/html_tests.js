/*global QUnit*/

QUnit.test("Parser Shiv", function(assert) {
  var div = document.getElementById('sectiondiv');
  var section = document.getElementById('section');
  var span = document.getElementById('sectionspan');
  assert.equal(div, section.parentNode, 'div should be parent of section');
  assert.equal(section, span.parentNode, 'section should be parent of span');
});

QUnit.test("document.head", function(assert) {
  assert.expect(2);

  // document.head
  assert.notEqual(document.head, null);
  assert.equal(document.head.tagName, "HEAD");
});

QUnit.test("base64 encoding", function(assert) {
  assert.expect(4);

  // window.atob() / window.btoa()
  assert.equal(window.btoa(''), '');
  assert.equal(window.atob(''), '');
  assert.equal(window.btoa('\x00\x01\x02\xfd\xfe\xff'), 'AAEC/f7/');
  assert.equal(window.atob('AAEC/f7/'), '\x00\x01\x02\xfd\xfe\xff');
});

QUnit.test("Element.dataset and data-* attributes", function(assert) {

  // dataset
  if ('dataset' in document.getElementById('datadiv')) {
    assert.expect(6);
    assert.equal(document.getElementById('datadiv').dataset.foo, "bar");
    assert.equal(document.getElementById('datadiv').dataset.bar, "123");
    assert.equal(document.getElementById('datadiv').dataset.aaBbCc, "abc");
    assert.equal(document.getElementById('dataspan').dataset['123'], "blah"); // Broken in Chrome 23!
    assert.notOk(document.getElementById('dataspan').dataset['abc']);

    document.getElementById('datadiv').dataset.foo = "new";
    assert.equal(document.getElementById('datadiv').dataset.foo, "new");
  }
});
