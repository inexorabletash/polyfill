/*global QUnit*/
QUnit.test('Array.prototype.includes', function(assert) {
  assert.ok('includes' in Array.prototype);
  assert.equal(typeof Array.prototype.includes, 'function');
  assert.ok([1,2,3].includes(1));
  assert.notOk([1,2,3].includes(0));
  assert.ok([1,NaN,3].includes(NaN));
  assert.notOk([1,2,3].includes(NaN));
  assert.ok([1,-0,3].includes(-0));
  assert.ok([1,-0,3].includes(0));
  assert.notOk([1,[],3].includes([]));
  assert.notOk([1,{},3].includes({}));
  assert.notOk([1,2,3].includes(Math));
  assert.ok([1,Math,3].includes(Math));
  assert.notOk([1,2,3].includes(undefined));
  assert.ok([1,undefined,3].includes(undefined));
  assert.notOk([1,2,3].includes(null));
  assert.ok([1,null,3].includes(null));

  assert.ok([1,2,3].includes(3, 2));
  assert.notOk([1,2,3].includes(2, 2));
});
