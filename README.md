polyfill - JavaScript Polyfills, Shims and More
===============================================

* A *shim* lets you write the same code across all browsers by implementing a new API in downlevel browsers.
* A *polyfill* is a shim or collection of shims (and a catchy name).
* A *prollyfill* is a shim for a proposed API
* A *helper* helps write cross-browser code where a true API shim/polyfill is not possible.

Note that my general approach to polyfills is not to produce 100% compliant behavior, but to provide a broad subset of functionality so that, where possible, cooperative code can be written to take advantage of new APIs. No assumptions should be made about security or edge cases. It is preferrable to use a shim where it is possible to create one on supported browsers. If not possible, a helper should be used that lets the same code be used in all browsers.

I use these in various pages on my sites; most are by me, or I have at least tweaked them. A more comprehensive list can be found at [The All-In-One Entirely-Not-Alphabetical No-Bullshit Guide to HTML5 Fallbacks](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills) by Paul Irish.

Web Standards / Browser Compat
------------------------------
[script](web.js) -
[unit tests](http://calormen.com/polyfill/tests/web.html)

Bundled together; nearly every page I create needs at least some of these. These will change over time,
and going forward I will only target IE8 and later.

* [`XMLHttpRequest`](http://xhr.spec.whatwg.org/) (for IE6-)
* [`FormData`](http://xhr.spec.whatwg.org/) (for IE9-)
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
* [HTML Web Application APIs](http://www.whatwg.org/specs/web-apps/current-work/multipage/webappapis.html#atob) (for IE9-)
  * `encodedString = window.btoa(binaryString)` - Base64 Encode
  * `binaryString = window.atob(encodedString)` - Base64 Decode
* [HTML5 Infrastructure](http://dom.spec.whatwg.org/#interface-domtokenlist) - `classList`[spec](http://dom.spec.whatwg.org/#dom-element-classlist), `relList`[spec](http://www.whatwg.org/specs/web-apps/current-work/#dom-link-rellist)
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
* [W3C Timing control for script-based animations](http://www.w3.org/TR/animation-timing/) - [demo page](http://calormen.com/polyfill/demos/raf.html)
  * `id = window.requestAnimationFrame()`
  * `window.cancelAnimationFrame(id)`
* [Efficient Script Yielding](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html)
  * `id = setImmediate(callback, args...)`
  * `clearImmediate(id)`
* `dataset` and `data-*` attributes [spec](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#embedding-custom-non-visible-data-with-the-data-*-attributes) (for IE8+, not available in IE7-)
  * `str = element.dataset[key]` - yields undefined if data-key attribute not present
  * `element.dataset[key] = str` - fails unless data-key attribute already present
* [JavaScript 1.X String Extras](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String)
  * String prototype: `trimLeft`, `trimRight`, `quote`

ECMAScript 5 (polyfill)
-----------------------------------
[script](es5.js) -
[unit tests](http://calormen.com/polyfill/tests/es5.html)

[ECMAScript 5](http://www.ecma-international.org/publications/standards/Ecma-262.htm) Object, Function, String and Date extras:
* Object: `getPrototypeOf`, `getOwnPropertyNames`, `create`, `defineProperty`, `defineProperties`, `keys`
* Function prototype: `bind`
* Array: `isArray`
* Array prototype: `indexOf`, `lastIndexOf`, `every`, `some`, `forEach`, `map`, `filter`, `reduce`, `reduceRight`
* String prototype: `trim`
* Date: `now`
* Date prototype: `toISOString`

Does not include JSON - use [json2.js](https://github.com/douglascrockford/JSON-js)

ECMAScript "Harmony" (prollyfills)
-------------------------------------

"Harmony" is the aspirational term for the future of ECMAScript (the standardized version of JavaScript) beyond ES5.

### ES6

[script](harmony.js) -
[unit tests](http://calormen.com/polyfill/tests/harmony.html)

The standardization of ES6 is currently in progress.
This will attempt to track the evolving spec, so may change at any time.
This assumes ES5, so use es5.js for older browsers (IE9-).

In the [ES6 Drafts](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts):
#### Fundamental Objects
* Object: `assign()`, `is()`, `setPrototypeOf()`
* Symbol: `Symbol(description)`, `Symbol.for()`, `Symbol.keyFor()`, `Symbol.iterator`, `Symbol.toStringTag`
  * No security, just creates an object with a unique string representation. `typeof Symbol()` will incorrectly report `"object"` but `Symbol() instanceof Symbol` will return `true`

#### Numbers and Dates
* Number: `EPILON`, `isFinite()`, `isInteger()`, `isNaN()`, `isSafeInteger()`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `parseFloat()`, `parseInt()`
* Number prototype: `clz()`
* Math: `acosh()`, `asinh()`, `atanh()`, `cbrt()`, `cosh()`, `expm1()`, `fround`, `hypot()`, `imul()`, `log1p()`, `log10()`, `log2()`, `sign()`, `sinh()`, `tanh()`, `trunc()`

#### Text Processing
* String: `fromCodePoint()`
* String prototype: `codePointAt()`, `contains()`, `endsWith()`, `repeat()`, `startsWith()`, `[@@iterator]()`
* See also: [uate - ES5 "Tagged Template Strings"](https://github.com/inexorabletash/uate)
* RegExp prototype: `replace()`, `search()`, `match()`

#### Indexed Collections
* Array: `from()`, `of()`
* Array prototype: `copyWithin()`, `entries()`, `fill()`, `find()`, `findIndex()`, `keys()`, `values()`, `[@@iterator]()`
* _TypedArray_ - for browsers without native support (IE9-) include [typedarray.js](#typedarray)
* %TypedArray% prototype: `from()`, `of()`
* %TypedArray% prototype: `copyWithin()`, `entries()`, `every()`, `fill()`, `filter()`, `find()`, `findIndex()`, `forEach()`, `indexOf()`, `join()`, `keys()`, `lastIndexOf()`, `map()`, `reduce()`, `reduceRight()`, `reverse()`, `slice()`, `some()`, `sort()`, `values()`, `[@@iterator]()`

#### Keyed Collections
* Map: `clear()`, `delete()`, `entries()`, `forEach()`, `get()`, `keys()`, `has()`, `set()`, `size`, `values()`, `[@@iterator]()`
* Set: `add()`, `clear()`, `delete()`, `entries()`, `forEach()`, `has()`, `size`, `values()`, `[@@iterator]()`
* WeakMap: `clear()`, `delete()`, `get()`, `has()`, `set()`
* WeakSet: `add()`, `clear()`, `delete()`, `has()`
  * WeakMap and WeakSet are intrusive and modify the `valueOf` property of keys

#### Asynchronous Programming
* Promise: `p = new Promise()`, `Promise.resolve()`, `Promise.reject()`, `Promise.cast()`, `Promise.race()`, `Promise.all()`, `p.then()`, `p.catch()`
* [promises spec](https://github.com/domenic/promises-unwrapping)

#### Not Yet Approved
* Number: `compare()` - _probably won't be in ES6_
* Array prototype: `pushAll()`, `contains()` [ref](https://mail.mozilla.org/pipermail/es-discuss/2011-December/019099.html)
* @dict module: `keys(dict)`, `values(dict)`, `entries(dict)`
  * `dict()` is shortcut for `Object.create(null)` - _this needs a rework_

#### Syntax Helpers
* `forOf(o, function(i) { ... })` - since `for (i of o) { ... }` can't be polyfilled. Uses iterators, so works with arrays, maps, sets, and strings, via implicit @@iterator and explicit iterators returned by keys/values/entries methods and functions.

See also: [uate - ES5 "tagged template strings"](https://github.com/inexorabletash/uate)

<a name="typedarray"></name>
### Typed Arrays
[script](typedarray.js) -
[unit tests](http://calormen.com/polyfill/tests/typedarray.html) -
[spec](http://www.khronos.org/registry/typedarray/specs/latest/)

Originally specified separately, Typed Arrays are now included in ES6.

* `ArrayBuffer`
* `Uint8Array`, `Int8Array`, `Uint16Array`, `Int16Array`, `Uint32Array`, `Int32Array`, `Float32Array`, `Float64Array`
* `DataView`

Creating index getter/setters (i.e. `array[0]`, `array[1]`, etc) is slow and consumes significant memory. Arrays larger than 100k entries will be too slow to initialize in most cases so an upper limit is placed on the size of arrays and exception is thrown on construction.

### Binary Data

[script](bindata.js) -
[demo page](http://calormen.com/polyfill/demos/bindata.html)

Proposed for ES7 - http://wiki.ecmascript.org/doku.php?id=harmony:binary_data


WHATWG URL API
--------------
[script](url.js) -
[unit tests](http://calormen.com/polyfill/tests/url.html) -
[draft spec](http://url.spec.whatwg.org/) - See script for cross-browser quirks

```javascript
var url = new URL(url, base);
var value = url.getParameter(name);
var valueArray = url.getParameterAll(name);
url.appendParameter(name, valueOrValues);
url.clearParameter(name);
var nameArray = url.parameterNames;
```

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


W3C Keyboard Events (polyfill)
----------------------------
[script](keyboard.js) -
[demo page](http://calormen.com/polyfill/demos/keyboard.html) -
[draft spec](https://dvcs.w3.org/hg/d4e/raw-file/tip/source_respec.htm#keyboard-events)

```javascript
// Adds the following properties to each KeyboardEvent:
event.code
event.location

// You can get a label for the key using:
KeyboardEvent.queryKeyCap(code);

// IE7- only: In your keydown/keyup handler, call this in your handler
// before accessing the `code` or `location` properties:
window.identifyKey(keyboardEvent);
```

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

W3C Geolocation API
-------------------
[script](geo.js) -
[demo page](http://calormen.com/polyfill/demos/geo.html) -
[spec](http://www.w3.org/TR/geolocation-API/) -
uses [freegeoip.net](http://freegeoip.net/)

```javascript
navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
var watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
navigator.geolocation.clearWatch(watchId);
```

W3C Workers
-----------
[script](workers.js) -
[spec](http://dev.w3.org/html5/workers/) -
just for kicks; you probably don't want to use this


Console
-------
[script](console.js) -
[unit tests](http://calormen.com/polyfill/tests/console.html) -
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
[script](https://github.com/inexorabletash/polyfill/edit/master/domexception.js) -
[demo page](http://calormen.com/polyfill/demos/domexception.html) -

Creates a native DOMException of the specified type if possible,
otherwise a similar looking object. Useful when implementing other polyfills.

```javascript
exception = DOMException.create(code)
```

sprintf (other)
---------------
[script](sprintf.js) -
[unit tests](http://calormen.com/polyfill/tests/sprintf.html) -
used for a few C-to-JavaScript porting projects

```javascript
var str = sprintf("Foo %s bar %d", "hello", 123);
```
