polyfill - JavaScript Polyfills, Shims and More
===============================================

* A *shim* lets you write the same code across all browsers by implementing a new API in downlevel browsers.
* A *polyfill* is a shim or collection of shims (and a catchy name).
* A *prollfill* is a shim for a proposed API
* A *helper* helps write cross-browser code where a true API shim/polyfill is not possible.

Note that my general approach to polyfills is not to produce 100% compliant behavior, but to provide a broad subset of functionality so that, where possible, cooperative code can be written to take advantage of new APIs. No assumptions should be made about security or edge cases. It is preferrable to use a shim where it is possible to create one on supported browsers. If not possible, a helper should be used that lets the same code be used in all browsers.

I use these in various pages on my sites; most are by me, or I have at least tweaked them. A more comprehensive list can be found at [The All-In-One Entirely-Not-Alphabetical No-Bullshit Guide to HTML5 Fallbacks](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills) by Paul Irish.

ECMAScript 5 & Browser Compat
-----------------------------
[script](https://github.com/inexorabletash/polyfill/blob/master/polyfill.js) - 
[tests](http://calormen.com/polyfill/polyfill.html)

Bundled together; nearly every page I create needs at least some of these. These will change over time, 
and going forward I will only target IE8 and later.

* ECMAScript 5 Object, Function, String and Date extras
  * Object: `getPrototypeOf`, `getOwnPropertyNames`, `create`, `defineProperty`, `defineProperties`, `keys`
  * Function prototype: `bind`
  * Array: `isArray`
  * Array prototype: `indexOf`, `lastIndexOf`, `every`, `some`, `forEach`, `map`, `filter`, `reduce`, `reduceRight`
  * String prototype: `trim`
  * Date: `now`
  * Date prototype: `toISOString`
* [`XMLHttpRequest`](http://xhr.spec.whatwg.org/) (for IE6-)
* [Selector API](http://www.w3.org/TR/selectors-api/) (for IE7-) - adapted from [Paul Young](http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed)
  * `element = document.querySelector(selector)`
  * `elementArray = document.querySelectorAll(selector)`
* [DOM Events](http://dom.spec.whatwg.org/)
  * Where `EventTarget` is `window`, `document`, or any element:
  * `EventTarget.addEventListener(event, handler)` - for IE8+
  * `EventTarget.removeEventListener(event, handler)` - for IE8+
  * `window.addEvent(EventTarget, event, handler)` - helper for IE7- support - adapted from [QuirksMode](http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html)
  * `window.removeEvent(EventTarget, event, handler)` - helper for IE7- support - adapted from [QuirksMode](http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html)
  * `Event.target`
  * `Event.currentTarget`
  * `Event.eventPhase`
  * `Event.bubbles`
  * `Event.cancelable`
  * `Event.timeStamp`
  * `Event.defaultPrevented`
  * `Event.stopPropagation()`
  * `Event.cancelBubble()`
* [DOM Miscellany](http://dom.spec.whatwg.org/)
  * `document.head`
  * `elementArray = document.getElementsByClassName(classNames)`
* HTML Web Application APIs (shim for IE9-)
  * `encodedString = window.btoa(binaryString)` - Base64 Encode
  * `binaryString = window.atob(encodedString)` - Base64 Decode
* HTML5 Infrastructure - `classList`, `relList`
  * `tokenList = elem.classList` - for IE8+
  * `tokenList = elem.relList` - for IE8+
  * `tokenList = window.getClassList(element)` - helper for IE7- support
  * `tokenList = window.getRelList(element)` - helper for IE7- support
  * `tokenList.length`
  * `tokenList.item(index)`
  * `tokenList.contains(token)`
  * `tokenList.add(token)`
  * `tokenList.remove(token)`
  * `tokenList.toggle(token)`
* W3C Timing control for script-based animations - [demo page](http://calormen.com/polyfill/raf.html)
  * `id = window.requestAnimationFrame()`
  * `window.cancelAnimationFrame(id)`
* Efficient Script Yielding
  * `id = setImmediate(callback, args...)`
  * `clearImmediate(id)`
* `dataset` and `data-*` attributes (for IE8+, not available in IE7-)
  * `str = element.dataset[key]` - yields undefined if data-key attribute not present
  * `element.dataset[key] = str` - fails unless data-key attribute already present
* JavaScript 1.X String Extras
  * String prototype: `trimLeft`, `trimRight`, `quote`


ECMAScript 6 / "Harmony" (polyfill)
-----------------------------------
[script](https://github.com/inexorabletash/polyfill/blob/master/harmony.js) - 
[unit tests](http://calormen.com/polyfill/harmony.html)

"Harmony" is the aspirational term for the future of ECMAScript (the standardized version of JavaScript) beyond ES5. 
The standardization of ES6 is currently in progress.  
This will attempt to track the evolving spec, so may change at any time.

In the ES6 Drafts:
* Object: `assign()`, `is()`
* Number: `EPILON`, `MAX_INTEGER`, `parseInt()`, `parseFloat()`, `isFinite()`, `isNaN()`, `isInteger()`, `toInteger()`
* Number prototype: `clz()`
* String: `fromCodePoint()`
* String.prototype: `codePointAt()`, `repeat()`, `startsWith()`, `endsWith()`, `contains()`
* Math: `log10()`, `log2()`, `log1p()`, `expm1()`, `cosh()`, `sinh()`, `tanh()`, `acosh()`, `asinh()`, `atanh()`, `hypot()`, `trunc()`, `sign()`, `cbrt()`, `imul()`
* Array: `of()`, `from()`
* Array prototype: `items()`, `keys()`, `values()`, `@@iterator()`
* Map: `clear()`, `delete()`, `forEach()`, `get()`, `has()`, `items()`, `keys()`, `set()`, `size`, `values()`, `@@iterator()`
* Set: `add()`, `clear()`, `delete()`, `forEach()`, `has()`, `size`, `values()`, `@@iterator()`
* WeakMap (intrusive; modifies valueOf property of key): `clear()`, `delete()`, `get()`, `has()`, `set()`

Not yet approved:
* Number: `compare()`
* Array prototype: `pushAll()`, `contains()` [ref]
* String prototype: `@@iterator()` [ref]
* Dict: `keys(dict)`, `values(dict)`, `entries(dict)`
  * `dict()` is shortcut for `Object.create(null)`
* Symbol: `Symbol`, `isSymbol`
  * No security, just creates an object with a unique string representation.

Helpers:
* `forOf(o, function(i) { ... })` - since `for (i of o) { ... }` can't be polyfilled. Uses iterators, so works with arrays, maps, sets, and strings, via implicit @@iterator and explicit iterators returned by keys/values/entries methods and functions.

*NOTE: Uses old StopIteration iterator style. Need to update to latest TC39 consensus design.*

### Binary Data

[script](https://github.com/inexorabletash/polyfill/blob/master/bindata.js) -
[tests](http://calormen.com/polyfill/bindata.html)

Proposed for ES6 - http://wiki.ecmascript.org/doku.php?id=harmony:binary_data


Typed Arrays (polyfill)
-----------------------
[script](https://github.com/inexorabletash/polyfill/blob/master/typedarray.js) - 
[unit tests](http://calormen.com/polyfill/typedarray.html) - 
[spec](http://www.khronos.org/registry/typedarray/specs/latest/)

* `ArrayBuffer`
* `Uint8Array`, `Int8Array, `Uint16Array`, `Int16Array`, `Uint32Array`, `Int32Array`, `Float32Array`, `Float64Array`
* `DataView`


WHATWG URL API
--------------
[script](https://github.com/inexorabletash/polyfill/blob/master/url.js) -
[unit tests](http://calormen.com/polyfill/url.html) -
[draft spec](http://url.spec.whatwg.org/) - See script for cross-browser quirks

    url = new URL(url, base)
    value = url.getParameter(name)
    valueArray = url.getParameterAll(name)
    url.appendParameter(name, valueOrValues)
    url.clearParameter(name)
    nameArray = url.parameterNames

URL objects have properties:
* `protocol`
* `host`
* `hostname`
* `port`
* `pathname`
* `search`
* `hash`
* `filename`
* `href`


W3C Keyboard Events (helper)
----------------------------
[script](https://github.com/inexorabletash/polyfill/blob/master/keyboard.js) - 
[interactive test](http://calormen.com/polyfill/keyboard.html) - 
[draft spec](https://dvcs.w3.org/hg/d4e/raw-file/tip/source_respec.htm#keyboard-events)

    // In your keydown/keyup handler, call:
    window.identifyKey(keyboardEvent); 
    
    // This adds the following properties to keyboardEvent:
    keyboardEvent.code
    keyboardEvent.location

    // You can get a label for the key using:
    KeyboardEvent.queryKeyCap(code);


W3C Web Storage
---------------
[script](http://calormen.com/polyfill/storage.js) - 
[spec](http://dev.w3.org/html5/webstorage/) - 
adapted from [Remy Sharp](https://gist.github.com/350433)

    storage = window.localStorage
    storage = window.sessionStorage
    storage.clear()
    valueString = storage.getItem(keyString)
    valueString = storage.key(index)
    storage.removeItem(keyString)
    storage.setItem(keyString, valueString)
    storage.length


W3C Geolocation API
-------------------
[script](https://github.com/inexorabletash/polyfill/blob/master/geo.js) - 
[demo page](http://calormen.com/polyfill/geo.html) - 
[spec](http://www.w3.org/TR/geolocation-API/) - 
uses [freegeoip.net](http://freegeoip.net/)

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
    navigator.geolocation.clearWatch(watchId);


W3C Workers
-----------
[script](https://github.com/inexorabletash/polyfill/blob/master/workers.js) - 
[spec](http://dev.w3.org/html5/workers/) - 
just for kicks; you probably don't want to use this


Console
-------
[script](https://github.com/inexorabletash/polyfill/blob/master/console.js) - 
[unit tests](http://calormen.com/polyfill/console.html) - 
*de facto* standard in modern browsers based on [FireBug Console API](http://getfirebug.com/wiki/index.php/Console_API)

    console.log(messageObject, arguments...); // and variations: debug, info, warn, error
    console.assert(assertion, messageObject, arguments...);
    console.count(name);
    console.time(name); console.timeEnd(name);
    console.group(name); console.groupEnd();
    console.trace();
    console.clear();


Cookie API
----------
[script](https://github.com/inexorabletash/polyfill/blob/master/cookie.js) - 
Adam Barth's [Cookie API proposal](https://docs.google.com/Doc?docid=0AZpchfQ5mBrEZGQ0cDh3YzRfMTRmdHFma21kMg&hl=en&pli=1) -
abandoned

    cookie = document.getCookie(name, callback);
    alert(cookie.name);
    alert(cookie.value);
    
    cookieArray = document.getAllCookies(callback);
    document.setCookie(cookie, errorCallback);
    document.deleteCookie(name, errorCallback);


DOMException (helper)
---------------------
[script](https://github.com/inexorabletash/polyfill/edit/master/domexception.js) - 
[demo page](http://calormen.com/polyfill/domexception.html) - 

Creates a native DOMException of the specified type if possible,
otherwise a similar looking object. Useful when implementing other polyfills.

    exception = DOMException.create(code)


sprintf (other)
---------------
[script](https://github.com/inexorabletash/polyfill/blob/master/sprintf.js) - 
[unit tests](http://calormen.com/polyfill/sprintf.html) - 
used for a few C-to-JavaScript porting projects

    var str = sprintf("Foo %s bar %d", "hello", 123);

