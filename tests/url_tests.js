/*global QUnit, URLSearchParams*/
function toArray(it) {
  var a = [];
  for (var cur = it.next(); !cur.done; cur = it.next()) {
    a.push(cur.value);
  }
  return a;
}


QUnit.test('URL IDL', function(assert) {
  var url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');
  assert.equal(typeof url.protocol, 'string', 'protocol');
  assert.equal(typeof url.host, 'string', 'host');
  assert.equal(typeof url.hostname, 'string', 'hostname');
  assert.equal(typeof url.port, 'string', 'port');
  assert.equal(typeof url.pathname, 'string', 'pathname');
  assert.equal(typeof url.search, 'string', 'search');
  assert.equal(typeof url.hash, 'string', 'hash');
  assert.equal(typeof url.origin, 'string', 'origin');
  assert.equal(typeof url.href, 'string', 'href');
});

QUnit.test('URL Stringifying', function(assert) {
  assert.equal(String(new URL('http://example.com')), 'http://example.com/');
  assert.equal(String(new URL('http://example.com:8080')), 'http://example.com:8080/');
});

QUnit.test('URL Parsing', function(assert) {
  var url = new URL('http://example.com:8080/foo/bar?a=1&b=2#p1');
  assert.equal(url.protocol, 'http:');
  assert.equal(url.hostname, 'example.com');
  assert.equal(url.port, '8080');
  assert.equal(url.host, 'example.com:8080');
  assert.equal(url.pathname, '/foo/bar');
  assert.equal(url.search, '?a=1&b=2');
  assert.equal(url.hash, '#p1');
  assert.equal(url.origin, 'http://example.com:8080');
  assert.equal(url.href, 'http://example.com:8080/foo/bar?a=1&b=2#p1');
});

QUnit.test('URL Mutation', function(assert) {
  var url = new URL('http://example.com');
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');
  assert.equal(url.host, 'example.com');

  url.protocol = 'ftp';
  assert.equal(url.protocol, 'ftp:');
  assert.equal(url.href, 'ftp://example.com/');
  assert.equal(url.origin, 'ftp://example.com');
  assert.equal(url.host, 'example.com');
  url.protocol = 'http';
  assert.equal(url.protocol, 'http:');
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');
  assert.equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.hostname = 'example.org';
  assert.equal(url.href, 'http://example.org/');
  assert.equal(url.origin, 'http://example.org');
  assert.equal(url.host, 'example.org');
  url.hostname = 'example.com';
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');
  assert.equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.port = 8080;
  assert.equal(url.href, 'http://example.com:8080/');
  assert.equal(url.origin, 'http://example.com:8080');
  assert.equal(url.host, 'example.com:8080');
  url.port = 80;
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');
  assert.equal(url.host, 'example.com');

  url = new URL('http://example.com');
  url.pathname = 'foo';
  assert.equal(url.href, 'http://example.com/foo');
  assert.equal(url.origin, 'http://example.com');
  url.pathname = 'foo/bar';
  assert.equal(url.href, 'http://example.com/foo/bar');
  assert.equal(url.origin, 'http://example.com');
  url.pathname = '';
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');

  url = new URL('http://example.com');
  url.search = 'a=1&b=2';
  assert.equal(url.href, 'http://example.com/?a=1&b=2');
  assert.equal(url.origin, 'http://example.com');
  url.search = '';
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');

  url = new URL('http://example.com');
  url.hash = 'p1';
  assert.equal(url.href, 'http://example.com/#p1');
  assert.equal(url.origin, 'http://example.com');
  url.hash = '';
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.origin, 'http://example.com');
});

QUnit.test('Parameter Mutation', function(assert) {
  var url = new URL('http://example.com');
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.search, '');
  assert.equal(url.searchParams.get('a'), null);
  assert.equal(url.searchParams.get('b'), null);

  url.searchParams.append('a', '1');
  assert.equal(url.searchParams.get('a'), '1');
  assert.deepEqual(url.searchParams.getAll('a'), ['1']);
  assert.equal(url.search, '?a=1');
  assert.equal(url.href, 'http://example.com/?a=1');

  url.searchParams.append('b', '2');
  assert.equal(url.searchParams.get('b'), '2');
  assert.deepEqual(url.searchParams.getAll('b'), ['2']);
  assert.equal(url.search, '?a=1&b=2');
  assert.equal(url.href, 'http://example.com/?a=1&b=2');

  url.searchParams.append('a', '3');
  assert.equal(url.searchParams.get('a'), '1');
  assert.deepEqual(url.searchParams.getAll('a'), ['1', '3']);
  assert.equal(url.search, '?a=1&b=2&a=3');
  assert.equal(url.href, 'http://example.com/?a=1&b=2&a=3');

  url.searchParams['delete']('a');
  assert.equal(url.search, '?b=2');
  assert.deepEqual(url.searchParams.getAll('a'), []);
  assert.equal(url.href, 'http://example.com/?b=2');

  url.searchParams['delete']('b');
  assert.deepEqual(url.searchParams.getAll('b'), []);
  assert.equal(url.href, 'http://example.com/');

  url.href = 'http://example.com?m=9&n=3';
  assert.equal(url.searchParams.has('a'), false);
  assert.equal(url.searchParams.has('b'), false);
  assert.equal(url.searchParams.get('m'), 9);
  assert.equal(url.searchParams.get('n'), 3);

  url.href = 'http://example.com';
  url.searchParams.set('a', '1');
  assert.deepEqual(url.searchParams.getAll('a'), ['1']);
  url.search = 'a=1&b=1&b=2&c=1';
  url.searchParams.set('b', '3');
  assert.deepEqual(url.searchParams.getAll('b'), ['3']);
  assert.equal(url.href, 'http://example.com/?a=1&b=3&c=1');
});

QUnit.test('Parameter Encoding', function(assert) {
  assert.expect(7);

  var url = new URL('http://example.com');
  assert.equal(url.href, 'http://example.com/');
  assert.equal(url.search, '');
  url.searchParams.append('this\x00&that\x7f\xff', '1+2=3');
  assert.equal(url.searchParams.get('this\x00&that\x7f\xff'), '1+2=3');
  assert.equal(url.search, '?this%00%26that%7F%C3%BF=1%2B2%3D3');
  assert.equal(url.href, 'http://example.com/?this%00%26that%7F%C3%BF=1%2B2%3D3');
  url.search = '';
  url.searchParams.append('a  b', 'a  b');
  assert.equal(url.search, '?a++b=a++b');
  assert.equal(url.searchParams.get('a  b'), 'a  b');
});


QUnit.test('Base URL', function(assert) {
  assert.expect(20);
  // fully qualified URL
  assert.equal(new URL('http://example.com', 'https://example.org').href, 'http://example.com/');
  assert.equal(new URL('http://example.com/foo/bar', 'https://example.org').href, 'http://example.com/foo/bar');

  // protocol relative
  assert.equal(new URL('//example.com', 'https://example.org').href, 'https://example.com/');

  // path relative
  assert.equal(new URL('/foo/bar', 'https://example.org').href, 'https://example.org/foo/bar');
  assert.equal(new URL('/foo/bar', 'https://example.org/baz/bat').href, 'https://example.org/foo/bar');
  assert.equal(new URL('./bar', 'https://example.org').href, 'https://example.org/bar');
  assert.equal(new URL('./bar', 'https://example.org/foo/').href, 'https://example.org/foo/bar');
  assert.equal(new URL('bar', 'https://example.org/foo/').href, 'https://example.org/foo/bar');
  assert.equal(new URL('../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  assert.equal(new URL('../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  assert.equal(new URL('../../bar', 'https://example.org/foo/baz/bat/').href, 'https://example.org/foo/bar');
  assert.equal(new URL('../../bar', 'https://example.org/foo/baz/bat').href, 'https://example.org/bar');
  assert.equal(new URL('../../bar', 'https://example.org/foo/baz/').href, 'https://example.org/bar');
  assert.equal(new URL('../../bar', 'https://example.org/foo/').href, 'https://example.org/bar');
  assert.equal(new URL('../../bar', 'https://example.org/foo/').href, 'https://example.org/bar');

  // search/hash relative
  assert.equal(new URL('bar?ab#cd', 'https://example.org/foo/').href, 'https://example.org/foo/bar?ab#cd');
  assert.equal(new URL('bar?ab#cd', 'https://example.org/foo').href, 'https://example.org/bar?ab#cd');
  assert.equal(new URL('?ab#cd', 'https://example.org/foo').href, 'https://example.org/foo?ab#cd');
  assert.equal(new URL('?ab', 'https://example.org/foo').href, 'https://example.org/foo?ab');
  assert.equal(new URL('#cd', 'https://example.org/foo').href, 'https://example.org/foo#cd');
});

QUnit.test('URLSearchParams', function(assert) {
  var url = new URL('http://example.com?a=1&b=2');
  assert.ok(url.searchParams instanceof URLSearchParams);
  assert.throws(url.searchParams = new URLSearchParams());

  assert.equal(String(new URLSearchParams()), '');
  assert.equal(String(new URLSearchParams('')), '');
  assert.equal(String(new URLSearchParams('a=1')), 'a=1');
  assert.equal(String(new URLSearchParams('a=1&b=1')), 'a=1&b=1');
  assert.equal(String(new URLSearchParams('a=1&b&a')), 'a=1&b=&a=');

  assert.equal(String(new URLSearchParams('?')), '');
  assert.equal(String(new URLSearchParams('?a=1')), 'a=1');
  assert.equal(String(new URLSearchParams('?a=1&b=1')), 'a=1&b=1');
  assert.equal(String(new URLSearchParams('?a=1&b&a')), 'a=1&b=&a=');

  assert.equal(String(new URLSearchParams(new URLSearchParams('?'))), '');
  assert.equal(String(new URLSearchParams(new URLSearchParams('?a=1'))), 'a=1');
  assert.equal(String(new URLSearchParams(new URLSearchParams('?a=1&b=1'))), 'a=1&b=1');
  assert.equal(String(new URLSearchParams(new URLSearchParams('?a=1&b&a'))), 'a=1&b=&a=');
});

QUnit.test('URLSearchParams mutation', function(assert) {
  var p = new URLSearchParams();
  assert.equal(p.get('a'), null);
  assert.equal(p.get('b'), null);

  p.append('a', '1');
  assert.equal(p.get('a'), '1');
  assert.deepEqual(p.getAll('a'), ['1']);
  assert.equal(String(p), 'a=1');

  p.append('b', '2');
  assert.equal(p.get('b'), '2');
  assert.deepEqual(p.getAll('b'), ['2']);
  assert.equal(String(p), 'a=1&b=2');

  p.append('a', '3');
  assert.equal(p.get('a'), '1');
  assert.deepEqual(p.getAll('a'), ['1', '3']);
  assert.equal(String(p), 'a=1&b=2&a=3');

  p['delete']('a');
  assert.equal(String(p), 'b=2');
  assert.deepEqual(p.getAll('a'), []);

  p['delete']('b');
  assert.deepEqual(p.getAll('b'), []);

  p = new URLSearchParams('m=9&n=3');
  assert.equal(p.has('a'), false);
  assert.equal(p.has('b'), false);
  assert.equal(p.get('m'), 9);
  assert.equal(p.get('n'), 3);

  p = new URLSearchParams();
  p.set('a', '1');
  assert.deepEqual(p.getAll('a'), ['1']);
  p = new URLSearchParams('a=1&b=1&b=2&c=1');
  p.set('b', '3');
  assert.deepEqual(p.getAll('b'), ['3']);
  assert.equal(String(p), 'a=1&b=3&c=1');

  // Ensure copy constructor copies by value, not reference.
  var sp1 = new URLSearchParams('a=1');
  assert.equal(String(sp1), 'a=1');
  var sp2 = new URLSearchParams(sp1);
  assert.equal(String(sp2), 'a=1');
  sp1.append('b', '2');
  sp2.append('c', '3');
  assert.equal(String(sp1), 'a=1&b=2');
  assert.equal(String(sp2), 'a=1&c=3');

  var sp3 = new URLSearchParams('a=1');
  assert.equal(String(sp3), 'a=1');
  var sp4 = new URLSearchParams(sp3);
  assert.equal(String(sp4), 'a=1');
  sp4.set('a', 2);
  assert.equal(sp3.get('a'), 1);
  assert.equal(String(sp3), 'a=1');
  assert.equal(sp4.get('a'), 2);
  assert.equal(String(sp4), 'a=2');
});

QUnit.test('URLSearchParams serialization', function(assert) {
  var p = new URLSearchParams();
  p.append('this\x00&that\x7f\xff', '1+2=3');
  assert.equal(p.get('this\x00&that\x7f\xff'), '1+2=3');
  assert.equal(String(p), 'this%00%26that%7F%C3%BF=1%2B2%3D3');
  p = new URLSearchParams();
  p.append('a  b', 'a  b');
  assert.equal(String(p), 'a++b=a++b');
  assert.equal(p.get('a  b'), 'a  b');
});

QUnit.test('URLSearchParams iterable methods', function(assert) {
  var params = new URLSearchParams('a=1&b=2');
  assert.deepEqual(toArray(params.entries()), [['a', '1'], ['b', '2']]);
  assert.deepEqual(toArray(params.keys()), ['a', 'b']);
  assert.deepEqual(toArray(params.values()), ['1', '2']);

  var a = [], thisArg = {};
  params.forEach(function(key, value) {
    assert.equal(this, thisArg);
    a.push([key, value]);
  }, thisArg);
  assert.deepEqual(a, [['1', 'a'], ['2', 'b']]);

  if ('Symbol' in self && 'iterator' in self.Symbol) {
    assert.deepEqual(toArray(params[Symbol.iterator]()), [['a', '1'], ['b', '2']]);

    ['entries', 'keys', 'values'].forEach(function(m) {
      assert.equal(typeof params[m]()[Symbol.iterator], 'function',
                  'Iterator has @@iterator method');
      var instance = params[m]();
      assert.equal(instance, instance[Symbol.iterator](), '@@iterator returns self');
    });
  }
});

QUnit.test('URL contains native static methods', function(assert) {
    assert.ok(typeof URL.createObjectURL == 'function');
    assert.ok(typeof URL.revokeObjectURL == 'function');
});

QUnit.test('Regression tests', function(assert) {
  // IE mangles the pathname when assigning to search with 'about:' URLs
  var p = new URL('about:blank').searchParams;
  p.append('a', 1);
  p.append('b', 2);
  assert.equal(p.toString(), 'a=1&b=2');
});
