polyfill - JavaScript Polyfills, Shims and More
===============================================

* A *shim* lets you write the same code across all browsers by implementing a new API in downlevel browsers.
* A *polyfill* is a shim or collection of shims (and a catchy name).
* A *prollyfill* is a shim for a proposed API
* A *helper* helps write cross-browser code where a true API shim/polyfill is not possible.

Note that my general approach to polyfills is not to produce 100% compliant behavior, but to provide a broad subset of functionality so that, where possible, cooperative code can be written to take advantage of new APIs. No assumptions should be made about security or edge cases. It is preferrable to use a shim where it is possible to create one on supported browsers. If not possible, a helper should be used that lets the same code be used in all browsers.

I use these in various pages on my sites; most are by me, or I have at least tweaked them. A more comprehensive list can be found at [The All-In-One Entirely-Not-Alphabetical No-Bullshit Guide to HTML5 Fallbacks](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills) by Paul Irish.


ECMAScript / JavaScript Polyfills
---------------------------------

[ECMAScript 5](es5.md) - Most recent standard, supported by all modern browsers. Frozen.

[ECMAScript 6](es6.md) - Based on nearly complete draft standard. Should be stable apart from bug fixes.

[ECMAScript 7](es7.md) - At the initial proposal/strawman stage. Here there be dragons.


Web Standards / Browser Compat
------------------------------
[script](web.js) -
[unit tests](http://inexorabletash.github.io/polyfill/tests/web.html)

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
* [W3C Timing control for script-based animations](http://www.w3.org/TR/animation-timing/) - [demo page](http://inexorabletash.github.io/polyfill/demos/raf.html)
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


WHATWG URL API
--------------
[script](url.js) -
[unit tests](http://inexorabletash.github.io/polyfill/tests/url.html) -
[draft spec](http://url.spec.whatwg.org/) - See script for cross-browser quirks

```javascript
var url = new URL(url, base);
var value = url.searchParams.get(name);
var valueArray = url.searchParams.getAll(name);
url.searchParams.append(name, valueOrValues);
url.searchParams.delete(name);
```

URL objects have properties:
* `href`
* `origin`
* `protocol`
* `username`
* `password`
* `host`
* `hostname`
* `port`
* `pathname`
* `search`
* `searchParams`
  * `append(name, value)`
  * `delete(name)`
  * `get(name)`
  * `getAll(name)`
  * `has(name)`
  * `set(name, value)`
* `hash`

W3C Keyboard Events (polyfill)
----------------------------
[script](keyboard.js) -
[demo page](http://inexorabletash.github.io/polyfill/demos/keyboard.html) -
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

W3C Geolocation API
-------------------
[script](geo.js) -
[demo page](http://inexorabletash.github.io/polyfill/demos/geo.html) -
[spec](http://www.w3.org/TR/geolocation-API/) -
uses [freegeoip.net](http://freegeoip.net/)

```javascript
navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
var watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
navigator.geolocation.clearWatch(watchId);
```

Obsolete
--------
[Obsolete and Unmaintained Polyfills](obsolete/README.md)
