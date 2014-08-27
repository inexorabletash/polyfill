function promiseTest(name, func) {
  asyncTest(name, function() {
    new Promise(function(resolve, reject) { resolve(func()); })
      .catch(function(error) { ok(false, 'Unexpected error: ' + error); })
      .then(function(value) { QUnit.start(); });
  });
}

promiseTest('basic fetch', function() {
  return fetch('sample.txt')
    .then(function(response) {
      equal(response.status, 200, 'Response status should be 200');
      return response.body.asText();
    })
    .then(function(text) {
      equal(text, 'Hello, world!\n', 'Fetch should retrieve sample text');
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

promiseTest('CORS-accepted fetch', function() {
  return fetch('https://cors-test.appspot.com/test')
    .then(function(response) {
      return response.body.asJSON();
    })
    .then(function(json) {
      deepEqual(json, {status: 'ok'});
    });
});

promiseTest('FetchBodyStream asText', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.body.asText();
    })
    .then(function(text) {
      equal(text, '{"key": "value"}\n', 'asText should produce string');
    });
});

promiseTest('FetchBodyStream asJSON', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.body.asJSON();
    })
    .then(function(json) {
      deepEqual(json, {key: 'value'}, 'asJSON should parse JSON data file');
    });
});

promiseTest('FetchBodyStream asArrayBuffer', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.body.asArrayBuffer();
    })
    .then(function(buffer) {
      buffer = [].slice.call(new Uint8Array(buffer));
      deepEqual(buffer,
                [123, 34, 107, 101, 121, 34, 58, 32, 34, 118, 97, 108, 117, 101, 34, 125, 10],
               'asArrayBuffer should return buffer with expected octets');
    });
});

promiseTest('FetchBodyStream asBlob', function() {
  return fetch('sample.json')
    .then(function(response) {
      return response.body.asBlob();
    })
    .then(function(blob) {
      // TODO: Verify blob contents
      equal(blob.size, 17, 'asBlob should yield appropriately sized Blob');
    });
});

promiseTest('FetchBodyStream read flag', function() {
  return fetch('sample.json')
    .then(function(response) {
      response.body.asText();
      return response.body.asText();
    })
    .then(function(v) { ok(false, 'Unexpected successful second asXXX call: ' + v); },
          function(error) { equal(error.name, 'TypeError',
                                  'FetchBodyStream.asXXX throws once read flag is set'); });
});

test('Request constructor', function() {
  var r = new Request('http://example.com');
  equal(r.method, 'GET', 'Default method is GET');
  equal(r.url, 'http://example.com/', 'url property is normalized');
  ok(r.headers instanceof Headers, 'headers property exists');
});
