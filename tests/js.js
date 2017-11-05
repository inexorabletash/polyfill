/*global QUnit*/
QUnit.test("Non-Standard JavaScript 1.x Extras", function(assert) {

  // String.prototype.trimLeft()
  assert.equal(''.trimLeft(), '');
  assert.equal('  '.trimLeft(), '');
  assert.equal('abc'.trimLeft(), 'abc');
  assert.equal('   abc'.trimLeft(), 'abc');
  assert.equal(' \t\n\rabc'.trimLeft(), 'abc');
  assert.equal(' a b c '.trimLeft(), 'a b c ');

  // String.prototype.trimRight()
  assert.equal(''.trimRight(), '');
  assert.equal('  '.trimRight(), '');
  assert.equal('abc'.trimRight(), 'abc');
  assert.equal('abc   '.trimRight(), 'abc');
  assert.equal('abc \t\n\r'.trimRight(), 'abc');
  assert.equal(' a b c '.trimRight(), ' a b c');

  // String.prototype.quote()
  assert.equal(''.quote(), "\"\"");
  assert.equal('abc'.quote(), "\"abc\"");
  assert.equal('"'.quote(), '"\\""');
  assert.equal('\b\r\n\t\f'.quote(), "\"\\b\\r\\n\\t\\f\"");
  //assert.equal('\u0000'.quote(), "\"\\x00\""); // Older FF produces \0
  assert.equal('\u001f'.quote(), "\"\\x1F\"");
  assert.equal('\u0020'.quote(), "\" \"");
  assert.equal('\u007f'.quote(), "\"\\x7F\"");
  assert.equal('\u0080'.quote(), "\"\\x80\"");
  assert.equal('\u00ff'.quote(), "\"\\xFF\"");
  assert.equal('\u0100'.quote(), "\"\\u0100\"");
  assert.equal('\u0fff'.quote(), "\"\\u0FFF\"");
  assert.equal('\u1000'.quote(), "\"\\u1000\"");
  assert.equal('\u1234'.quote(), "\"\\u1234\"");
  assert.equal('\ucdef'.quote(), "\"\\uCDEF\"");
  assert.equal('\uffff'.quote(), "\"\\uFFFF\"");
});
