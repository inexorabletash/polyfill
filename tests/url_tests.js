function toArray(it) {
  var a = [];
  for (var cur = it.next(); !cur.done; cur = it.next()) {
    a.push(cur.value);
  }
  return a;
}


test('URL IDL', function () {
  var url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');
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

test('URL Stringifying', function() {
  equal(String(new URL('http://example.com')), 'http://example.com/');
  equal(String(new URL('http://example.com:8080')), 'http://example.com:8080/');
});

test('URL Parsing', function () {
  var url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');
  equal(url.protocol, 'http:');
  equal(url.hostname, 'example.com');
  equal(url.port, '8080');
  equal(url.host, 'example.com:8080');
  equal(url.pathname, '/foo/bar');
  equal(url.search, '?a=1&b=2');
  equal(url.hash, '#p1');
  equal(url.origin, 'http://example.com:8080');
  equal(url.href, 'http://example.com:8080/foo/bar?a=1&b=2#p1');
});

test('URL Mutation', function () {
  var url = new URL('http://example.com');
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');
  equal(url.host, 'example.com');

  url.protocol = 'ftp';
  equal(url.protocol, 'ftp:');
  equal(url.href, 'ftp://example.com/');
  equal(url.origin, 'ftp://example.com');
  equal(url.host, 'example.com');
  url.protocol = 'http';
  equal(url.protocol, 'http:');
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');
  equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.hostname = 'example.org';
  equal(url.href, 'http://example.org/');
  equal(url.origin, 'http://example.org');
  equal(url.host, 'example.org');
  url.hostname = 'example.com';
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');
  equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.port = 8080;
  equal(url.href, 'http://example.com:8080/');
  equal(url.origin, 'http://example.com:8080');
  equal(url.host, 'example.com:8080');
  url.port = 80;
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');
  equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.pathname = 'foo';
  equal(url.href, 'http://example.com/foo');
  equal(url.origin, 'http://example.com');
  url.pathname = 'foo/bar';
  equal(url.href, 'http://example.com/foo/bar');
  equal(url.origin, 'http://example.com');
  url.pathname = '';
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');

  url = new URL('http://example.com');
  url.search = 'a=1&b=2';
  equal(url.href, 'http://example.com/?a=1&b=2');
  equal(url.origin, 'http://example.com');
  url.search = '';
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');

  url = new URL('http://example.com');
  url.hash = 'p1';
  equal(url.href, 'http://example.com/#p1');
  equal(url.origin, 'http://example.com');
  url.hash = '';
  equal(url.href, 'http://example.com/');
  equal(url.origin, 'http://example.com');
});

test('Parameter Mutation', function () {
  var url = new URL('http://example.com');
  equal(url.href, 'http://example.com/');
  equal(url.search, '');
  equal(url.searchParams.get('a'), null);
  equal(url.searchParams.get('b'), null);

  url.searchParams.append('a', '1');
  equal(url.searchParams.get('a'), '1');
  deepEqual(url.searchParams.getAll('a'), ['1']);
  equal(url.search, '?a=1');
  equal(url.href, 'http://example.com/?a=1');

  url.searchParams.append('b', '2');
  equal(url.searchParams.get('b'), '2');
  deepEqual(url.searchParams.getAll('b'), ['2']);
  equal(url.search, '?a=1&b=2');
  equal(url.href, 'http://example.com/?a=1&b=2');

  url.searchParams.append('a', '3');
  equal(url.searchParams.get('a'), '1');
  deepEqual(url.searchParams.getAll('a'), ['1', '3']);
  equal(url.search, '?a=1&b=2&a=3');
  equal(url.href, 'http://example.com/?a=1&b=2&a=3');

  url.searchParams['delete']('a');
  equal(url.search, '?b=2');
  deepEqual(url.searchParams.getAll('a'), []);
  equal(url.href, 'http://example.com/?b=2');

  url.searchParams['delete']('b');
  deepEqual(url.searchParams.getAll('b'), []);
  equal(url.href, 'http://example.com/');

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

test('Parameter Encoding', 7, function () {
  var url = new URL('http://example.com');
  equal(url.href, 'http://example.com/');
  equal(url.search, '');
  url.searchParams.append('this\x00&that\x7f\xff', '1+2=3');
  equal(url.searchParams.get('this\x00&that\x7f\xff'), '1+2=3');
  equal(url.search, '?this%00%26that%7F%C3%BF=1%2B2%3D3');
  equal(url.href, 'http://example.com/?this%00%26that%7F%C3%BF=1%2B2%3D3');
  url.search = '';
  url.searchParams.append('a  b', 'a  b');
  equal(url.search, '?a++b=a++b');
  equal(url.searchParams.get('a  b'), 'a  b');
});


test('Base URL', function () {
  expect(20);
  // fully qualified URL
  equal(new URL('http://example.com', 'https://example.org').href, 'http://example.com/');
  equal(new URL('http://example.com/foo/bar', 'https://example.org').href, 'http://example.com/foo/bar');

  // protocol relative
  equal(new URL('//example.com', 'https://example.org').href, 'https://example.com/');

  // path relative
  equal(new URL('/foo/bar', 'https://example.org').href, 'https://example.org/foo/bar');
  equal(new URL('/foo/bar', 'https://example.org/baz/bat').href, 'https://example.org/foo/bar');
  equal(new URL('./bar', 'https://example.org').href, 'https://example.org/bar');
  equal(new URL('./bar', 'https://example.org/foo/').href, 'https://example.org/foo/bar');
  equal(new URL('bar', 'https://example.org/foo/').href, 'https://example.org/foo/bar');
  equal(new URL('../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  equal(new URL('../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  equal(new URL('../../bar', 'https://example.org/foo/baz/bat/').href, 'https://example.org/foo/bar');
  equal(new URL('../../bar', 'https://example.org/foo/baz/bat').href, 'https://example.org/bar');
  equal(new URL('../../bar', 'https://example.org/foo/baz/').href, 'https://example.org/bar');
  equal(new URL('../../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  equal(new URL('../../bar', 'https://example.org/foo/').href, 'https://example.org/bar');

  // search/hash relative
  equal(new URL('bar?ab#cd', 'https://example.org/foo/').href, 'https://example.org/foo/bar?ab#cd');
  equal(new URL('bar?ab#cd', 'https://example.org/foo').href, 'https://example.org/bar?ab#cd');
  equal(new URL('?ab#cd', 'https://example.org/foo').href, 'https://example.org/foo?ab#cd');
  equal(new URL('?ab', 'https://example.org/foo').href, 'https://example.org/foo?ab');
  equal(new URL('#cd', 'https://example.org/foo').href, 'https://example.org/foo#cd');
});

test('URLSearchParams', function () {
  var url = new URL('http://example.com?a=1&b=2');
  ok(url.searchParams instanceof URLSearchParams);
  raises(url.searchParams = new URLSearchParams());

  equal(String(new URLSearchParams()), '');
  equal(String(new URLSearchParams('')), '');
  equal(String(new URLSearchParams('a=1')), 'a=1');
  equal(String(new URLSearchParams('a=1&b=1')), 'a=1&b=1');
  equal(String(new URLSearchParams('a=1&b&a')), 'a=1&b=&a=');

  equal(String(new URLSearchParams('?')), '');
  equal(String(new URLSearchParams('?a=1')), 'a=1');
  equal(String(new URLSearchParams('?a=1&b=1')), 'a=1&b=1');
  equal(String(new URLSearchParams('?a=1&b&a')), 'a=1&b=&a=');

  equal(String(new URLSearchParams(new URLSearchParams('?'))), '');
  equal(String(new URLSearchParams(new URLSearchParams('?a=1'))), 'a=1');
  equal(String(new URLSearchParams(new URLSearchParams('?a=1&b=1'))), 'a=1&b=1');
  equal(String(new URLSearchParams(new URLSearchParams('?a=1&b&a'))), 'a=1&b=&a=');
});

test('URLSearchParams mutation', function () {
  var p = new URLSearchParams();
  equal(p.get('a'), null);
  equal(p.get('b'), null);

  p.append('a', '1');
  equal(p.get('a'), '1');
  deepEqual(p.getAll('a'), ['1']);
  equal(String(p), 'a=1');

  p.append('b', '2');
  equal(p.get('b'), '2');
  deepEqual(p.getAll('b'), ['2']);
  equal(String(p), 'a=1&b=2');

  p.append('a', '3');
  equal(p.get('a'), '1');
  deepEqual(p.getAll('a'), ['1', '3']);
  equal(String(p), 'a=1&b=2&a=3');

  p['delete']('a');
  equal(String(p), 'b=2');
  deepEqual(p.getAll('a'), []);

  p['delete']('b');
  deepEqual(p.getAll('b'), []);

  p = new URLSearchParams('m=9&n=3');
  equal(p.has('a'), false);
  equal(p.has('b'), false);
  equal(p.get('m'), 9);
  equal(p.get('n'), 3);

  p = new URLSearchParams();
  p.set('a', '1');
  deepEqual(p.getAll('a'), ['1']);
  p = new URLSearchParams('a=1&b=1&b=2&c=1');
  p.set('b', '3');
  deepEqual(p.getAll('b'), ['3']);
  equal(String(p), 'a=1&b=3&c=1');

  // Ensure copy constructor copies by value, not reference.
  var sp1 = new URLSearchParams('a=1');
  equal(String(sp1), 'a=1');
  var sp2 = new URLSearchParams(sp1);
  equal(String(sp2), 'a=1');
  sp1.append('b', '2');
  sp2.append('c', '3');
  equal(String(sp1), 'a=1&b=2');
  equal(String(sp2), 'a=1&c=3');
});

test('URLSearchParams serialization', function() {
  var p = new URLSearchParams();
  p.append('this\x00&that\x7f\xff', '1+2=3');
  equal(p.get('this\x00&that\x7f\xff'), '1+2=3');
  equal(String(p), 'this%00%26that%7F%C3%BF=1%2B2%3D3');
  p = new URLSearchParams();
  p.append('a  b', 'a  b');
  equal(String(p), 'a++b=a++b');
  equal(p.get('a  b'), 'a  b');
});

test('URLSearchParams iterable methods', function () {
  var params = new URLSearchParams('a=1&b=2');
  deepEqual(toArray(params.entries()), [['a', '1'], ['b', '2']]);
  deepEqual(toArray(params.keys()), ['a', 'b']);
  deepEqual(toArray(params.values()), ['1', '2']);

  var a = [], thisArg = {};
  params.forEach(function(key, value) {
    equal(this, thisArg);
    a.push([key, value]);
  }, thisArg);
  deepEqual(a, [['a', '1'], ['b', '2']]);

  if ('Symbol' in self && 'iterator' in self.Symbol) {
    deepEqual(toArray(params[Symbol.iterator]()), [['a', '1'], ['b', '2']]);
  }
});

test('URL contains native static methods', function () {
    ok(typeof URL.createObjectURL == 'function');
    ok(typeof URL.revokeObjectURL == 'function');
});

test('Regression tests', function() {
  // IE mangles the pathname when assigning to search with 'about:' URLs
  var p = new URL('about:blank').searchParams;
  p.append('a', 1);
  p.append('b', 2);
  equal(p.toString(), 'a=1&b=2');
});
