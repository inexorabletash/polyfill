// Helpers

function promiseTest(name, func) {
  asyncTest(name, function() {
    new Promise(function(resolve, reject) { resolve(func()); })
      .catch(function(error) { ok(false, 'Unexpected error: ' + error); })
      .then(function() { QUnit.start(); });
  });
}

function rejectingPromiseTest(name, func, assert) {
  asyncTest(name, function() {
    new Promise(function(resolve, reject) { resolve(func()); })
      .then(function(v) { ok(false, 'Unexpected success: ' + v); },
            assert)
      .then(function() { QUnit.start(); });
  });
}

// Tests

promiseTest('basic fetch', function() {
  return fetch('sample.txt')
    .then(function(response) {
      equal(response.status, 200, 'Response status should be 200');
      return response.text();
    })
    .then(function(text) {
      equal(text, 'Hello, world!\n', 'Fetch should retrieve sample text');
    });
});

promiseTest('basic failed fetch', function() {
  return fetch('no-such-resource')
    .then(function(response) {
      equal(response.status, 404, 'Response status should be 404');
      equal(response.statusText, 'Not Found', 'Response status should be "Not Found"');
    });
});

promiseTest('CORS-denied fetch', function() {
  return fetch('http://example.com')
    .then(function(response) {
      ok(false, 'Cross-origin fetch should have failed');
    }, function(error) {
      equal(error.name, 'TypeError');
    });
});

promiseTest('CORS-accepted fetch (via httpbin.org)', function() {
  return fetch('//httpbin.org/get?key=value')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      deepEqual(json.args, {'key': 'value'});
    });
});

promiseTest('FetchBodyStream asText', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      equal(text, '{"key": "value"}\n', 'asText should produce string');
    });
});

promiseTest('FetchBodyStream asJSON', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      deepEqual(json, {key: 'value'}, 'asJSON should parse JSON data file');
    });
});

promiseTest('FetchBodyStream asArrayBuffer', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.arrayBuffer();
    })
    .then(function(buffer) {
      deepEqual([].slice.call(new Uint8Array(buffer)),
                [123, 34, 107, 101, 121, 34, 58, 32, 34, 118, 97, 108, 117, 101, 34, 125, 10],
               'asArrayBuffer should return buffer with expected octets');
    });
});

promiseTest('FetchBodyStream asBlob', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.blob();
    })
    .then(function(blob) {
      // TODO: Verify blob contents
      equal(blob.size, 17, 'asBlob should yield appropriately sized Blob');
    });
});

rejectingPromiseTest('FetchBodyStream read flag', function() {
  return fetch('sample.json')
    .then(function(response) {
      response.body.text();
      return response.body.text();
    });
}, function(error) {
  equal(error.name, 'TypeError',
        'FetchBodyStream.asXXX throws once read flag is set');
});

test('Request constructor - ScalarValueString', function() {
  var r = new Request('http://example.com');
  equal(r.method, 'GET', 'Default method is GET');
  equal(r.url, 'http://example.com/', 'url property is normalized');
  ok(r.headers instanceof Headers, 'headers property exists');
});

test('Request constructor - Request', function() {
  var o = new Request('http://example.com', {
    method: 'POST',
    headers: new Headers({A: 1, B: 2})
  });
  var r = new Request(o, {headers: new Headers({C: 3})});
  equal(r.method, 'POST', 'Method copied');
  equal(r.url, 'http://example.com/', 'URL copied');
  equal(r.headers.get('A'), '1');
  equal(r.headers.get('B'), '2');
  equal(r.headers.get('C'), '3');
});

promiseTest('FormData POST (via httpbin.org)', function() {
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
      deepEqual(json.form, {a: '1', b: '2'}, 'FormData key/value pairs should be sent');
    });
});

test('Invalid request header', function() {
  var request = new Request('http://example.com');
  var headers = request.headers;
  headers.append('Cookie', 'abc');
  equal(headers.get('Cookie'), null, 'Forbidden header should not be set, yielding null');
});

test('Method normalization', function() {
  equal(new Request('http://example.com', {method: 'get'}).method, 'GET',
        'Standard method should be normalized to upper case');
  equal(new Request('http://example.com', {method: 'nonstandard'}).method, 'nonstandard',
        'Nonstandard method should be normalized to upper case');
});

rejectingPromiseTest('Bad protocol', function() {
  return fetch('no-such-protocol://invalid');
}, function(error) {
  equal(error.name, 'TypeError', 'Network error appears as TypeError');
});
