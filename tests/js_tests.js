
test("Non-Standard JavaScript 1.x Extras", function () {

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
