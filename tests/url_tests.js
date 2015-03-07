
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

test("URL Stringifying", function() {
  equal(String(new URL('http://example.com')), 'http://example.com/');
  equal(String(new URL('http://example.com:8080')), 'http://example.com:8080/');
});

test("URL Parsing", function () {
  var url = new URL("http://example.com:8080/foo/bar?a=1&b=2#p1");
  equal(url.protocol, "http:");
  equal(url.hostname, "example.com");
  equal(url.port, "8080");
  equal(url.host, "example.com:8080");
  equal(url.pathname, "/foo/bar");
  equal(url.search, "?a=1&b=2");
  equal(url.hash, "#p1");
  equal(url.origin, "http://example.com:8080");
  equal(url.href, "http://example.com:8080/foo/bar?a=1&b=2#p1");
});

test("URL Mutation", function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, "example.com");

  url.protocol = "ftp";
  equal(url.protocol, "ftp:");
  equal(url.href, "ftp://example.com/");
  equal(url.origin, "ftp://example.com");
  equal(url.host, "example.com");
  url.protocol = "http";
  equal(url.protocol, "http:");
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, "example.com");

  url = new URL("http://example.com");
  url.hostname = "example.org";
  equal(url.href, "http://example.org/");
  equal(url.origin, "http://example.org");
  equal(url.host, "example.org");
  url.hostname = "example.com";
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, "example.com");

  url = new URL("http://example.com");
  url.port = 8080;
  equal(url.href, "http://example.com:8080/");
  equal(url.origin, "http://example.com:8080");
  equal(url.host, "example.com:8080");
  url.port = 80;
  equal(url.href, "http://example.com/");
  equal(url.origin, "http://example.com");
  equal(url.host, "example.com");

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

  url.href = 'http://example.com?m=9&n=3';
  equal(url.searchParams.has('a'), false);
  equal(url.searchParams.has('b'), false);
  equal(url.searchParams.get('m'), 9);
  equal(url.searchParams.get('n'), 3);

  url.href = 'http://example.com';
  url.searchParams.set('a', '1');
  deepEqual(url.searchParams.getAll('a'), ['1']);
  url.search = 'a=1&b=1&b=2&c=1';
  url.searchParams.set('b', '3');
  deepEqual(url.searchParams.getAll('b'), ['3']);
  equal(url.href, 'http://example.com/?a=1&b=3&c=1');
});

test("Parameter Encoding", 7, function () {
  var url = new URL("http://example.com");
  equal(url.href, "http://example.com/");
  equal(url.search, "");
  url.searchParams.append("this\x00&that\x7f\xff", "1+2=3");
  equal(url.searchParams.get("this\x00&that\x7f\xff"), "1+2=3");
  equal(url.search, "?this%00%26that%7F%C3%BF=1%2B2%3D3");
  equal(url.href, "http://example.com/?this%00%26that%7F%C3%BF=1%2B2%3D3");
  url.search = "";
  url.searchParams.append("a  b", "a  b");
  equal(url.search, "?a++b=a++b");
  equal(url.searchParams.get("a  b"), "a  b");
});

test("Base URL", function () {
  expect(20);
  // fully qualified URL
  equal(new URL("http://example.com", "https://example.org").href, "http://example.com/");
  equal(new URL("http://example.com/foo/bar", "https://example.org").href, "http://example.com/foo/bar");

  // protocol relative
  equal(new URL("//example.com", "https://example.org").href, "https://example.com/");

  // path relative
  equal(new URL("/foo/bar", "https://example.org").href, "https://example.org/foo/bar");
  equal(new URL("/foo/bar", "https://example.org/baz/bat").href, "https://example.org/foo/bar");
  equal(new URL("./bar", "https://example.org").href, "https://example.org/bar");
  equal(new URL("./bar", "https://example.org/foo/").href, "https://example.org/foo/bar");
  equal(new URL("bar", "https://example.org/foo/").href, "https://example.org/foo/bar");
  equal(new URL("../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(new URL("../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(new URL("../../bar", "https://example.org/foo/baz/bat/").href, "https://example.org/foo/bar");
  equal(new URL("../../bar", "https://example.org/foo/baz/bat").href, "https://example.org/bar");
  equal(new URL("../../bar", "https://example.org/foo/baz/").href, "https://example.org/bar");
  equal(new URL("../../bar", "https://example.org/foo/").href, "https://example.org/bar");
  equal(new URL("../../bar", "https://example.org/foo/").href, "https://example.org/bar");

  // search/hash relative
  equal(new URL("bar?ab#cd", "https://example.org/foo/").href, "https://example.org/foo/bar?ab#cd");
  equal(new URL("bar?ab#cd", "https://example.org/foo").href, "https://example.org/bar?ab#cd");
  equal(new URL("?ab#cd", "https://example.org/foo").href, "https://example.org/foo?ab#cd");
  equal(new URL("?ab", "https://example.org/foo").href, "https://example.org/foo?ab");
  equal(new URL("#cd", "https://example.org/foo").href, "https://example.org/foo#cd");
});

if ('Symbol' in self && 'iterator' in self.Symbol) {
  test('URLSearchParams iteration', function() {
    var u = new URL('http://example.com?a=1&b=2');
    var it = u.searchParams[Symbol.iterator]();
    deepEqual(it.next(), {done: false, value: ['a', '1']});
    deepEqual(it.next(), {done: false, value: ['b', '2']});
    deepEqual(it.next(), {done: true, value: undefined});
  });
}
