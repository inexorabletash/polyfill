
// Test around browser quirks:
//
var engine = '';
if (/MSIE/.test(navigator.userAgent)) {
  engine = 'trident'; // Internet Explorer
} else if (/WebKit\//.test(navigator.userAgent)) {
  engine = 'webkit'; // Safari/Chrome
} else if (/Gecko\//.test(navigator.userAgent)) {
  engine = 'gecko'; // Firefox
} else if (/Presto\//.test(navigator.userAgent)) {
  engine = 'presto'; // Opera
}

// Firefox, IE, Opera and older WebKit do not support |origin|
var testOrigin = 'origin' in document.createElement('a');

// IE does not include leading '/' in |pathname|
var expectLeadingSlash = engine !== 'trident';

// IE includes default port in |host|
var expectDefaultPort = engine === 'trident';

// Presto does not support observing property changes
var testPropertyChanges = engine !== 'presto';

test("URL IDL", testOrigin ? 16 : 15, function () {
  var url = new URL("http://example.com:8080/foo/bar?a=1&b=2#p1");
  equal(typeof url.protocol, 'string', 'protocol');
  equal(typeof url.host, 'string', 'host');
  equal(typeof url.hostname, 'string', 'hostname');
  equal(typeof url.port, 'string', 'port');
  equal(typeof url.pathname, 'string', 'pathname');
  equal(typeof url.search, 'string', 'search');
  equal(typeof url.hash, 'string', 'hash');
  equal(typeof url.filename, 'string', 'filename');
  if (testOrigin) equal(typeof url.origin, 'string', 'origin');
  equal(typeof url.parameterNames, 'object', 'parameterNames');
  ok(typeof url.parameterNames.length, 'number', 'parameterNames');
  equal(typeof url.getParameter, 'function', 'getParameter');
  equal(typeof url.getParameterAll, 'function', 'getParameterAll');
  equal(typeof url.appendParameter, 'function', 'appendParameter');
  equal(typeof url.clearParameter, 'function', 'clearParameter');
  equal(typeof url.href, 'string', 'href');
});

test("URL Parsing", testOrigin ? 11 : 10, function () {
  var url = new URL("http://example.com:8080/foo/bar?a=1&b=2#p1");
  equal(url.protocol, "http:");
  equal(url.hostname, "example.com");
  equal(url.port, "8080");
  equal(url.host, "example.com:8080");
  equal(url.pathname, expectLeadingSlash ? "/foo/bar" : "foo/bar");
  equal(url.search, "?a=1&b=2");
  equal(url.hash, "#p1");
  if (testOrigin) equal(url.origin, "http://example.com:8080");
  equal(url.href, "http://example.com:8080/foo/bar?a=1&b=2#p1");

  deepEqual(url.parameterNames, ["a", "b"]);
  equal(url.filename, "bar");
});

test("URL Mutation", testOrigin ? 37 : 23, function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url.protocol = "ftp";
  equal(url.protocol, "ftp:");
  equal(url.href, "ftp://example.com/");
  if (testOrigin) equal(url.origin, "ftp://example.com");
  equal(url.host, expectDefaultPort ? "example.com:21" : "example.com");
  url.protocol = "http";
  equal(url.protocol, "http:");
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.hostname = "example.org";
  equal(url.href, "http://example.org/");
  if (testOrigin) equal(url.origin, "http://example.org");
  equal(url.host, expectDefaultPort ? "example.org:80" : "example.org");
  url.hostname = "example.com";
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.port = 8080;
  equal(url.href, "http://example.com:8080/");
  if (testOrigin) equal(url.origin, "http://example.com:8080");
  equal(url.host, "example.com:8080");
  url.port = 80;
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.pathname = "foo";
  equal(url.href, "http://example.com/foo");
  if (testOrigin) equal(url.origin, "http://example.com");
  url.pathname = "foo/bar";
  equal(url.href, "http://example.com/foo/bar");
  if (testOrigin) equal(url.origin, "http://example.com");
  url.pathname = "";
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");

  url = new URL("http://example.com");
  url.search = "a=1&b=2";
  equal(url.href, "http://example.com/?a=1&b=2");
  if (testOrigin) equal(url.origin, "http://example.com");
  url.search = "";
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");

  url = new URL("http://example.com");
  url.hash = "p1";
  equal(url.href, "http://example.com/#p1");
  if (testOrigin) equal(url.origin, "http://example.com");
  url.hash = "";
  equal(url.href, "http://example.com/");
  if (testOrigin) equal(url.origin, "http://example.com");
});

test("Parameter Mutation", 24, function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.search, "");
  equal(url.getParameter("a"), "");
  equal(url.getParameter("b"), "");

  url.appendParameter("a", "1");
  equal(url.getParameter("a"), "1");
  deepEqual(url.getParameterAll("a"), ["1"]);
  equal(url.search, "?a=1");
  equal(url.href, "http://example.com/?a=1");

  url.appendParameter("b", "2");
  equal(url.getParameter("b"), "2");
  deepEqual(url.getParameterAll("b"), ["2"]);
  equal(url.search, "?a=1&b=2");
  equal(url.href, "http://example.com/?a=1&b=2");

  url.appendParameter("a", "3");
  equal(url.getParameter("a"), "3");
  deepEqual(url.getParameterAll("a"), ["1", "3"]);
  equal(url.search, "?a=1&b=2&a=3");
  equal(url.href, "http://example.com/?a=1&b=2&a=3");

  url.clearParameter("a");
  equal(url.search, "?b=2");
  deepEqual(url.getParameterAll("a"), []);
  equal(url.href, "http://example.com/?b=2");

  url.clearParameter("b");
  deepEqual(url.getParameterAll("b"), []);
  equal(url.href, "http://example.com/");

  url.appendParameter("c", ["7", "8", "9"]);
  deepEqual(url.getParameter("c"), "9");
  deepEqual(url.getParameterAll("c"), ["7", "8", "9"]);
  equal(url.search, "?c=7&c=8&c=9");
});

test("Parameter Encoding", 5, function () {

  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.search, "");
  url.appendParameter("this\x00&that\x7f\xff", "1+2=3");
  equal(url.getParameter("this\x00&that\x7f\xff"), "1+2=3");
  equal(url.search, "?this%00%26that%7F%C3%BF=1%2B2%3D3");
  equal(url.href, "http://example.com/?this%00%26that%7F%C3%BF=1%2B2%3D3");
});

test("Base URL", 20, function () {
  // fully qualified URL
  equal(URL("http://example.com", "https://example.org").href, "http://example.com/");
  equal(URL("http://example.com/foo/bar", "https://example.org").href, "http://example.com/foo/bar");

  // protocol relative
  equal(URL("//example.com", "https://example.org").href, "https://example.com/");

  // path relative
  equal(URL("/foo/bar", "https://example.org").href, "https://example.org/foo/bar");
  equal(URL("/foo/bar", "https://example.org/baz/bat").href, "https://example.org/foo/bar");
  equal(URL("./bar", "https://example.org").href, "https://example.org/bar");
  equal(URL("./bar", "https://example.org/foo/").href, "https://example.org/foo/bar");
  equal(URL("bar", "https://example.org/foo/").href, "https://example.org/foo/bar");
  equal(URL("../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(URL("../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(URL("../../bar", "https://example.org/foo/baz/bat/").href, "https://example.org/foo/bar");
  equal(URL("../../bar", "https://example.org/foo/baz/bat").href, "https://example.org/bar");
  equal(URL("../../bar", "https://example.org/foo/baz/").href, "https://example.org/bar");
  equal(URL("../../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(URL("../../bar", "https://example.org/foo/").href, "https://example.org/bar");

  // search/hash relative
  equal(URL("bar?ab#cd", "https://example.org/foo/").href, "https://example.org/foo/bar?ab#cd");
  equal(URL("bar?ab#cd", "https://example.org/foo").href, "https://example.org/bar?ab#cd");
  equal(URL("?ab#cd", "https://example.org/foo").href, "https://example.org/foo?ab#cd");
  equal(URL("?ab", "https://example.org/foo").href, "https://example.org/foo?ab");
  equal(URL("#cd", "https://example.org/foo").href, "https://example.org/foo#cd");
});

test("Property changes", testPropertyChanges ? 4 : 2, function() {
  var url = new URL("http://example.com/foo");
  equal(url.filename, "foo");
  deepEqual(url.parameterNames, []);

  if (testPropertyChanges) {
    url.pathname = "/bar";
    url.search = "a=1&b=1";
    equal(url.filename, "bar");
    deepEqual(url.parameterNames, ["a", "b"]);
  }
});
