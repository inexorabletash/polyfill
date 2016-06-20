polyfill - JavaScript Polyfills, Shims and More
===============================================

* A *shim* lets you write the same code across all browsers by implementing a new API in downlevel browsers.
* A *polyfill* is a shim or collection of shims (and a catchy name).
* A *prollyfill* is a shim for a proposed API
* A *helper* helps write cross-browser code where a true API shim/polyfill is not possible.

My philosophy is that it's better to write future-looking code that takes advantage of new Web platform APIs where possible, and fill in the gaps with polyfills. There is no effort to produce 100% compliant behavior, or to completely hide differences in browser behavior.

I use these in various pages on my sites; most are by me, or I have at least tweaked them. A more comprehensive list of polyfills can be found at [The All-In-One Entirely-Not-Alphabetical No-Bullshit Guide to HTML5 Fallbacks](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills) by Paul Irish.

### Getting the Code ###

You're already here! Great, just download it, or use:

[git](https://git-scm.com/): `git clone https://github.com/inexorabletash/polyfill.git`

[bower](http://bower.io/): `bower install js-polyfills`

[npm](https://www.npmjs.com/): `npm install js-polyfills`

> It is *not* packaged as Node.js module(s); there's nothing to `require()`, this is just for distribution.

Or just include scripts directly in your page via CDN (c/o [RawGit](https://rawgit.com/)):

    <script src="https://cdn.rawgit.com/inexorabletash/polyfill/$TAGNAME/polyfill.min.js"></script>

(look at [Releases](https://github.com/inexorabletash/polyfill/releases) for the tag name, e.g. "v1.2.3")

### Files ###

The polyfills are roughly split up into files matching 1:1 with Web standards (specifications, living standards documents, etc). So there is [html.js](html.js) for [HTML](https://html.spec.whatwg.org), [dom.js](dom.js) for [DOM](https://dom.spec.whatwg.org), etc.

Since I generally use several in my hobby projects, bundled/minified versions are available:

* [web.js](web.js) (minified: [web.min.js](web.min.js)) includes the most common Web polyfills - it assumes ES2015 support
  * Includes: [html.js](html.js) [dom.js](dom.js) [xhr.js](xhr.js) [cssom.js](cssom.js) [timing.js](timing.js) [url.js](url.js) [fetch.js](fetch.js)
* [polyfill.js](polyfill.js) (minified: [polyfill.min.js](polyfill.min.js)) has everything in [web.js](web.js) plus [es5.js](es5.js) and [es6.js](es6.js)

Minification is done via https://github.com/mishoo/UglifyJS2


ECMAScript / JavaScript Polyfills
---------------------------------

[ECMAScript 5](es5.md) - Previous standard, supported by all modern browsers. Frozen.

[ECMAScript 2015](es6.md) - Most recent standard. Not fully supported by modern browsers yet.

[ECMAScript proposed](experimental/es-proposed.md) - Proposals for future editions of the standard. Here there be dragons.

[JavaScript 1.X String Extras](js.js) - [ref](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String)
  * String prototype: `trimLeft`, `trimRight`, `quote`


HTML
----
[script](html.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/html.html) -
[living standard](https://html.spec.whatwg.org)

* `document.head` (for IE8-)
* 'shiv' of newer HTML elements (`section`, `aside`, etc), to fix parsing (for IE8-)
* `dataset` and `data-*` attributes [spec](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes) (for IE8+, not available in IE7-)
  * `str = element.dataset[key]` - yields undefined if data-key attribute not present
  * `element.dataset[key] = str` - fails unless data-key attribute already present
* [Base64 utility methods](https://html.spec.whatwg.org/multipage/webappapis.html#atob) (for IE9-)
  * `encodedString = window.btoa(binaryString)` - Base64 Encode
  * `binaryString = window.atob(encodedString)` - Base64 Decode


DOM
---
[script](dom.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/dom.html) -
[living standard](https://dom.spec.whatwg.org)

* [Selectors](https://dom.spec.whatwg.org/#scope-match-a-selectors-string) (for IE7-) - adapted from [Paul Young](http://ajaxian.com/archives/creating-a-queryselector-for-ie-that-runs-at-native-speed)
  * `element = document.querySelector(selector)`
  * `elementArray = document.querySelectorAll(selector)`
* `elem.matches(selector)` (for IE, Firefox 3.6, early Webkit and Opera 15.0)
* `elementArray = document.getElementsByClassName(classNames)` (for IE8-)
* `e = element.nextElementSibling`, `e = element.previousElementSibling` (for IE8)
* Node constants: `Node.ELEMENT_NODE`, etc (for IE8-)
* DOMException constants: `DOMException.INDEX_SIZE_ERR` (for IE8-)
* [Events](https://dom.spec.whatwg.org/) (for IE8)
  * Where `EventTarget` is `window`, `document`, or any element:
    * `EventTarget.addEventListener(event, handler)` - for IE8+
    * `EventTarget.removeEventListener(event, handler)` - for IE8+
  * Event: `target`, `currentTarget`, `eventPhase`, `bubbles`, `cancelable`, `timeStamp`, `defaultPrevented`, `stopPropagation()`, `cancelBubble()`
* Non-standard Event helpers for IE7- - adapted from
[QuirksMode](http://www.quirksmode.org/blog/archives/2005/10/_and_the_winner_1.html)
  * `window.addEvent(EventTarget, event, handler)`
  * `window.removeEvent(EventTarget, event, handler)`
* [DOMTokenList](https://dom.spec.whatwg.org/#interface-domtokenlist) - `classList`[spec](https://dom.spec.whatwg.org/#dom-element-classlist), `relList`[spec](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element)
  * DOMTokenList: `length`, `item(index)`, `contains(token)`, `add(token)`, `remove(token)`, `toggle(token)`
  * `tokenList = elem.classList` - for IE8+
  * `tokenList = elem.relList` - for IE8+
  * Non-standard helpers for IE7-:
    * `tokenList = window.getClassList(element)`
    * `tokenList = window.getRelList(element)`


Fetch
-----
[script](fetch.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/fetch.html) -
[living standard](https://fetch.spec.whatwg.org)

Example:

```js
fetch('http://example.com/foo.json')
  .then(function(response) { return response.json(); })
  .then(function(data) { console.log(data); });
```

Supported:
* Headers: `new Headers()`, `append(name, value)`, `delete(name)`, `get(name)`, `getAll(name)`, `has(name)`, `set(name, value)`, `[Symbol.iterator]()`
* Body: `arrayBuffer()`, `blob()`, `formData()`, `json()`, `text()` - but conversions are limited
* Request: `new Request(input, init)`, `method`, `headers`, `body`, `url`
* Response: `new Response(body, init)`, `headers`, `url`, `status`, `statusText`, `body`
* `fetch(input, init)`


XMLHttpRequest
--------------
[script](xhr.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/xhr.html) -
[living standard](https://xhr.spec.whatwg.org/)
* [`XMLHttpRequest`](https://xhr.spec.whatwg.org/#interface-xmlhttprequest) (for IE6-)
* [`FormData`](https://xhr.spec.whatwg.org/#interface-formdata) (for IE9-)


Timing
------
[script](timing.js)

* [W3C Timing control for script-based animations](http://www.w3.org/TR/animation-timing/) - [demo page](https://inexorabletash.github.io/polyfill/demos/raf.html)
  * `id = window.requestAnimationFrame()`
  * `window.cancelAnimationFrame(id)`
* [Efficient Script Yielding](https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html)
  * `id = setImmediate(callback, args...)`
  * `clearImmediate(id)`


CSS OM
------
[script](cssom.js) - [spec](https://dev.w3.org/csswg/cssom-view/)

Polyfill for `width` and `height` in `getBoundingClientRect()` in IE8-


URL API
-------
[script](url.js) -
[tests](https://inexorabletash.github.io/polyfill/tests/url.html) -
[living standard](https://url.spec.whatwg.org/)

```javascript
var url = new URL(url, base);
var value = url.searchParams.get(name);
var valueArray = url.searchParams.getAll(name);
url.searchParams.append(name, valueOrValues);
url.searchParams.delete(name);

var p = new URLSearchParams('a=1&b=2');
```

* URL: `href`, `origin`, `protocol`, `username`, `password`, `host`, `hostname`, `port`, `pathname`, `search`, `searchParams`, `hash`
* URLSearchParams: `append(name, value)`, `delete(name)`, `get(name)`, `getAll(name)`, `has(name)`, `set(name, value)`, `entries()`, `keys()`, `values()`, `forEach(callback)` and `[Symbol.iterator]()` (if defined)


Keyboard Events
---------------
[script](keyboard.js) -
[demo page](https://inexorabletash.github.io/polyfill/demos/keyboard.html) -
[draft spec](https://w3c.github.io/uievents/) ([also](https://dvcs.w3.org/hg/d4e/raw-file/tip/source_respec.htm))

KeyboardEvent: `code`, `key`, `location`, `KeyboardEvent.queryKeyCap(code)`

IE7- only: Call `window.identifyKey(keyboardEvent);` in `keydown`/`keyup` handlers before accessing above properties.

[more details](keyboard.md)


Geolocation API
---------------
[script](geo.js) -
[demo page](https://inexorabletash.github.io/polyfill/demos/geo.html) -
[spec](http://www.w3.org/TR/geolocation-API/) -
uses [freegeoip.net](https://freegeoip.net/)

```javascript
navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
var watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
navigator.geolocation.clearWatch(watchId);
```

Obsolete
--------
[Obsolete and Unmaintained Polyfills](obsolete/README.md)
