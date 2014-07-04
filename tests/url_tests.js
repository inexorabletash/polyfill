
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

// IE does not include leading '/' in |pathname|
var expectLeadingSlash = engine !== 'trident';

// IE includes default port in |host|
var expectDefaultPort = false;//engine === 'trident';

// Presto does not support observing property changes
var testPropertyChanges = engine !== 'presto';

test("URL IDL", function () {
  var url = new URL("http://example.com:8080/foo/bar?a=1&b=2#p1");
  equal(typeof url.protocol, 'string', 'protocol');
  equal(typeof url.host, 'string', 'host');
  equal(typeof url.hostname, 'string', 'hostname');
  equal(typeof url.port, 'string', 'port');
  equal(typeof url.pathname, 'string', 'pathname');
  equal(typeof url.search, 'string', 'search');
  equal(typeof url.hash, 'string', 'hash');
  equal(typeof url.origin, 'string', 'origin');
  equal(typeof url.href, 'string', 'href');
});

test("URL Parsing", function () {
  var url = new URL("http://example.com:8080/foo/bar?a=1&b=2#p1");
  equal(url.protocol, "http:");
  equal(url.hostname, "example.com");
  equal(url.port, "8080");
  equal(url.host, "example.com:8080");
  equal(url.pathname, expectLeadingSlash ? "/foo/bar" : "foo/bar");
  equal(url.search, "?a=1&b=2");
  equal(url.hash, "#p1");
  equal(url.origin, "http://example.com:8080");
  equal(url.href, "http://example.com:8080/foo/bar?a=1&b=2#p1");
});

test("URL Mutation", function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url.protocol = "ftp";
  equal(url.protocol, "ftp:");
  equal(url.href, "ftp://example.com/");
  equal(url.origin, "ftp://example.com");
  equal(url.host, expectDefaultPort ? "example.com:21" : "example.com");
  url.protocol = "http";
  equal(url.protocol, "http:");
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.hostname = "example.org";
  equal(url.href, "http://example.org/");
  equal(url.origin, "http://example.org");
  equal(url.host, expectDefaultPort ? "example.org:80" : "example.org");
  url.hostname = "example.com";
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.port = 8080;
  equal(url.href, "http://example.com:8080/");
  equal(url.origin, "http://example.com:8080");
  equal(url.host, "example.com:8080");
  url.port = 80;
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, expectDefaultPort ? "example.com:80" : "example.com");

  url = new URL("http://example.com");
  url.pathname = "foo";
  equal(url.href, "http://example.com/foo");
  equal(url.origin, "http://example.com");
  url.pathname = "foo/bar";
  equal(url.href, "http://example.com/foo/bar");
  equal(url.origin, "http://example.com");
  url.pathname = "";
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");

  url = new URL("http://example.com");
  url.search = "a=1&b=2";
  equal(url.href, "http://example.com/?a=1&b=2");
  equal(url.origin, "http://example.com");
  url.search = "";
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");

  url = new URL("http://example.com");
  url.hash = "p1";
  equal(url.href, "http://example.com/#p1");
  equal(url.origin, "http://example.com");
  url.hash = "";
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
});

test("Parameter Mutation", function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.search, "");
  equal(url.searchParams.get("a"), null);
  equal(url.searchParams.get("b"), null);

  url.searchParams.append("a", "1");
  equal(url.searchParams.get("a"), "1");
  deepEqual(url.searchParams.getAll("a"), ["1"]);
  equal(url.search, "?a=1");
  equal(url.href, "http://example.com/?a=1");

  url.searchParams.append("b", "2");
  equal(url.searchParams.get("b"), "2");
  deepEqual(url.searchParams.getAll("b"), ["2"]);
  equal(url.search, "?a=1&b=2");
  equal(url.href, "http://example.com/?a=1&b=2");

  url.searchParams.append("a", "3");
  equal(url.searchParams.get("a"), "1");
  deepEqual(url.searchParams.getAll("a"), ["1", "3"]);
  equal(url.search, "?a=1&b=2&a=3");
  equal(url.href, "http://example.com/?a=1&b=2&a=3");

  url.searchParams['delete']("a");
  equal(url.search, "?b=2");
  deepEqual(url.searchParams.getAll("a"), []);
  equal(url.href, "http://example.com/?b=2");

  url.searchParams['delete']("b");
  deepEqual(url.searchParams.getAll("b"), []);
  equal(url.href, "http://example.com/");
});

test("Parameter Encoding", 5, function () {

  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.search, "");
  url.searchParams.append("this\x00&that\x7f\xff", "1+2=3");
  equal(url.searchParams.get("this\x00&that\x7f\xff"), "1+2=3");
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
