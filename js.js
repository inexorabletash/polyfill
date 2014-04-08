//----------------------------------------------------------------------
//
// Non-standard JavaScript (Mozilla) functions
//
//----------------------------------------------------------------------

(function () {
  // JavaScript 1.8.1
  String.prototype.trimLeft = String.prototype.trimLeft || function () {
    return String(this).replace(/^\s+/, '');
  };

  // JavaScript 1.8.1
  String.prototype.trimRight = String.prototype.trimRight || function () {
    return String(this).replace(/\s+$/, '');
  };

  // JavaScript 1.?
  var ESCAPES = {
    //'\x00': '\\0', Special case in FF3.6, removed by FF10
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };
  String.prototype.quote = String.prototype.quote || function() {
    return '"' + String(this).replace(/[\x00-\x1F"\\\x7F-\uFFFF]/g, function(c) {
      if (Object.prototype.hasOwnProperty.call(ESCAPES, c))
        return ESCAPES[c];
      var cc = c.charCodeAt(0);
      if (cc <= 0xFF)
        return '\\x' + ('00' + cc.toString(16).toUpperCase()).slice(-2);
      return '\\u' + ('0000' + cc.toString(16).toUpperCase()).slice(-4);
    }) + '"';
  };
}());
