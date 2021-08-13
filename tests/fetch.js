/*global QUnit, Request, Response, Headers, fetch*/

function promiseTest(name, func) {
  QUnit.test(name, function(assert) {
    var done = assert.async();
    new Promise(function(resolve, reject) { resolve(func(assert)); })
      .catch(function(error) { assert.ok(false, 'Unexpected rejection: ' + error); })
      .then(function() { done(); });
  });
}

function rejectingPromiseTest(name, func, assert_func) {
  QUnit.test(name, function(assert) {
    var done = assert.async();
    new Promise(function(resolve, reject) { resolve(func(assert)); })
      .then(function(v) { assert.ok(false, 'Unexpected fulfill: ' + v); },
            function(r) { assert_func(assert, r); })
      .then(function() { done(); });
  });
}

function blobAsText(blob, encoding) {
  encoding = encoding || 'utf-8';
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsText(blob, encoding);
    reader.onload = function(e) { resolve(reader.result); };
    reader.onerror = function(e) { reject(reader.error); };
  });
}

// Tests

promiseTest('basic fetch', function(assert) {
  return fetch('sample.txt')
    .then(function(response) {
      assert.equal(response.status, 200, 'Response status should be 200');
      assert.equal(response.ok, true, 'Response should be ok');
      return response.text();
    })
    .then(function(text) {
      assert.equal(text, 'Hello, world!\n', 'Fetch should retrieve sample text');
    });
});

promiseTest('basic failed fetch', function(assert) {
  return fetch('no-such-resource')
    .then(function(response) {
      assert.equal(response.status, 404, 'Response status should be 404');
      assert.equal(response.ok, false, 'Response should be not ok');
      assert.equal(response.statusText, 'Not Found', 'Response status should be "Not Found"');
    });
});

promiseTest('CORS-denied fetch', function(assert) {
  return fetch('http://example.com')
    .then(function(response) {
      assert.ok(false, 'Cross-origin fetch should have failed');
    }, function(error) {
      assert.equal(error.name, 'TypeError');
    });
});

promiseTest('CORS-accepted fetch (via httpbin.org)', function(assert) {
  return fetch('//httpbin.org/get?key=value')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      assert.deepEqual(json.args, {'key': 'value'});
    });
});

promiseTest('Response.text()', function(assert) {
  return fetch('sample.json')
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      assert.equal(text, '{"key": "value"}\n', 'text() should produce string');
    });
});

promiseTest('Response.json()', function(assert) {
  return fetch('sample.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      assert.deepEqual(json, {key: 'value'}, 'json() should parse JSON data file');
    });
});

promiseTest('Response.arrayBuffer()', function(assert) {
  return fetch('sample.json')
    .then(function(response) {
      return response.arrayBuffer();
    })
    .then(function(buffer) {
      assert.deepEqual([].slice.call(new Uint8Array(buffer)),
                       [123, 34, 107, 101, 121, 34, 58, 32, 34, 118, 97, 108, 117, 101, 34, 125, 10],
                       'arrayBuffer() should return buffer with expected octets');
    });
});

promiseTest('Response.blob()', function(assert) {
  return fetch('sample.json')
    .then(function(response) {
      return response.blob();
    })
    .then(function(blob) {
      assert.equal(blob.size, 17, 'blob() should yield appropriately sized Blob');
      return blobAsText(blob);
    })
    .then(function(text) {
      assert.equal(text, '{"key": "value"}\n', 'blob() should decode to expected text');
    });
});

rejectingPromiseTest('Response.bodyUsed flag', function(assert) {
  return fetch('sample.json')
    .then(function(response) {
      assert.equal(response.bodyUsed, false, 'bodyUsed flag is not set');
      response.body.text();
      assert.equal(response.bodyUsed, true, 'bodyUsed flag is not set');
      return response.body.text();
    });
}, function(assert, error) {
  assert.equal(error.name, 'TypeError',
               'FetchBodyStream.asXXX throws once read flag is set');
});

QUnit.test('Request constructor - ScalarValueString', function(assert) {
  var r = new Request('http://example.com');
  assert.equal(r.method, 'GET', 'Default method is GET');
  assert.equal(r.url, 'http://example.com/', 'url property is normalized');
  assert.ok(r.headers instanceof Headers, 'headers property exists');
});

QUnit.test('Request constructor - Request', function(assert) {
  var o = new Request('http://example.com', {
    method: 'POST',
    headers: new Headers({A: 1})
  });
  var r = new Request(o);
  assert.equal(r.method, 'POST', 'Method copied');
  assert.equal(r.url, 'http://example.com/', 'URL copied');
  assert.equal(r.headers.get('A'), '1');

  o = new Request('http://example.com', {
    method: 'POST',
    headers: new Headers({A: 1})
  });
  r = new Request(o, {headers: new Headers({B: 2})});
  assert.equal(r.method, 'POST', 'Method copied');
  assert.equal(r.url, 'http://example.com/', 'URL copied');
  assert.equal(r.headers.get('A'), null);
  assert.equal(r.headers.get('B'), '2');
});

QUnit.test('Response constructor', function(assert) {
  assert.equal(new Response().status, 200);
  assert.equal(new Response().statusText, 'OK');
  assert.equal(new Response().ok, true);
  assert.equal(new Response('', {status: 234}).status, 234);
  assert.equal(new Response('', {status: 234}).ok, true);
  assert.equal(new Response('', {status: 345}).ok, false);
  assert.equal(new Response('', {statusText: 'nope'}).statusText, 'nope');
  assert.throws(function() { new Response('', {status: 0}); });
  assert.throws(function() { new Response('', {status: 600}); });
  assert.throws(function() { new Response('', {statusText: 'bogus \u0100'}); });
});

promiseTest('Synthetic Response.text()', function(assert) {
  return new Response('sample body').text()
    .then(function(text) {
      assert.equal(text, 'sample body');
    });
});


promiseTest('FormData POST (via httpbin.org)', function(assert) {
  var fd = new FormData();
  fd.append('a', '1');
  fd.append('b', '2');
  return fetch('//httpbin.org/post', {
    method: 'POST',
    body: fd
  })
    .then(function(response) {
      window.r = response;
      return response.json();
    })
    .then(function(json) {
      assert.deepEqual(json.form, {a: '1', b: '2'}, 'FormData key/value pairs should be sent');
    });
});

QUnit.test('Invalid request header', function(assert) {
  var request = new Request('http://example.com');
  var headers = request.headers;
  headers.append('Cookie', 'abc');
  assert.equal(headers.get('Cookie'), null, 'Forbidden header should not be set, yielding null');
});

QUnit.test('Method normalization', function(assert) {
  assert.equal(new Request('http://example.com', {method: 'get'}).method, 'GET',
               'Standard method should be normalized to upper case');
  assert.equal(new Request('http://example.com', {method: 'nonstandard'}).method, 'nonstandard',
               'Nonstandard method should be normalized to upper case');
});

rejectingPromiseTest('Bad protocol', function(assert) {
  return fetch('no-such-protocol://invalid');
}, function(assert, error) {
  assert.equal(error.name, 'TypeError', 'Network error appears as TypeError');
});

QUnit.test('Regression test: Header name validity', function(assert) {
  var headers = new Headers({P3P: 1});
  assert.equal(headers.get('P3P'), '1', '0-9 are valid header characters');
});
