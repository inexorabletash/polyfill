Obsolete
========

These are basically unmaintained dead ends. Use at your own risk.

W3C Web Storage
---------------
[script](storage.js) -
[spec](http://dev.w3.org/html5/webstorage/) -
adapted from [Remy Sharp](https://gist.github.com/350433)

```javascript
storage = window.localStorage
storage = window.sessionStorage
storage.clear()
valueString = storage.getItem(keyString)
valueString = storage.key(index)
storage.removeItem(keyString)
storage.setItem(keyString, valueString)
storage.length
````

W3C Workers
-----------
[script](workers.js) -
[spec](http://dev.w3.org/html5/workers/) -
just for kicks; you probably don't want to use this


Console
-------
[script](console.js) -
[unit tests](https://inexorabletash.github.io/polyfill/obsolete/tests/console.html) -
*de facto* standard in modern browsers based on [FireBug Console API](http://getfirebug.com/wiki/index.php/Console_API)

```javascript
console.log(messageObject, arguments...); // and variations: debug, info, warn, error
console.assert(assertion, messageObject, arguments...);
console.count(name);
console.time(name); console.timeEnd(name);
console.group(name); console.groupEnd();
console.trace();
console.clear();
```

Cookie API
----------
[script](cookie.js) -
Adam Barth's [Cookie API proposal](https://docs.google.com/Doc?docid=0AZpchfQ5mBrEZGQ0cDh3YzRfMTRmdHFma21kMg&hl=en&pli=1) -
abandoned

```javascript
var cookie = document.getCookie(name, callback);
alert(cookie.name);
alert(cookie.value);

var cookieArray = document.getAllCookies(callback);
document.setCookie(cookie, errorCallback);
document.deleteCookie(name, errorCallback);
```

DOMException (helper)
---------------------
[script](domexception.js) -
[demo page](https://inexorabletash.github.io/polyfill/obsolete/demos/domexception.html) -

Creates a native DOMException of the specified type if possible,
otherwise a similar looking object. Useful when implementing other polyfills.

```javascript
exception = DOMException.create(code)
```

sprintf (other)
---------------
[script](sprintf.js) -
[unit tests](https://inexorabletash.github.io/polyfill/obsolete/tests/sprintf.html) -
used for a few C-to-JavaScript porting projects

```javascript
var str = sprintf("Foo %s bar %d", "hello", 123);
```


Binary Data
-----------
[script](bindata.js) -
[demo page](https://inexorabletash.github.io/polyfill/obsolete/demos/bindata.html)

Abandoned proposal for ECMAScript http://wiki.ecmascript.org/doku.php?id=harmony:typed_objects
