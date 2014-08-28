Experimental
============

### ES7

[Details](es7.md)

### Binary Data

[script](bindata.js) -
[demo page](http://inexorabletash.github.io/polyfill/experimental/demos/bindata.html)

Proposed for ES7 - http://wiki.ecmascript.org/doku.php?id=harmony:typed_objects

### Fetch

[Spec](fetch.spec.whatwg.org)
[Tests](http://inexorabletash.github.io/polyfill/experimental/tests/fetch.html)

Example:

```js
fetch('http://example.com/foo.json')
  .then(function(response) { return response.body.asJSON(); })
  .then(function(data) { console.log(data); });
```

Supported:
* Headers: `new Headers()`, `append(name, value)`, `delete(name)`, `get(name)`, `getAll(name)`, `has(name)`, `set(name, value)`, `[Symbol.iterator]()`
* FetchBodyStream: `asArrayBuffer()`, `asBlob()`, `asFormData()`, `asJSON()`, `asText()` - but conversions are limited
* Request: `new Request(input, init)`, `method`, `headers`, `body`, `url`
* Response: `new Response(body, init)`, `headers`, `url`, `status`, `statusText`, `body`
* `fetch(input, init)`
