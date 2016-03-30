Web Standards Bundle
--------------------
[script](web.js)

Bundled together; nearly every page I create needs at least some of
these. These will change over time, and going forward I will only
target IE8 and later. (Since IE7 and earlier did not support modifying
built-in object prototypes, helper functions used instead that can be
used if IE7 compatibility is needed.)

Many of these require ES5 or ES2015. See [polyfill.js](polyfill.js.md)

This bundles shims for:

* HTML            [script](html.js)   - [living standard](https://html.spec.whatwg.org)
* DOM             [script](dom.js)    - [living standard](https://dom.spec.whatwg.org)
* Fetch           [script](fetch.js)  - [living standard](https://fetch.spec.whatwg.org)
* URL             [script](url.js)    - [living standard](https://url.spec.whatwg.org)
* XMLHttpRequest  [script](xhr.js)    - [living standard](https://xhr.spec.whatwg.org)
* CSSOM           [script](cssom.js)  -  [spec](https://dev.w3.org/csswg/cssom-view/)
* Timing          [script](timing.js)

web.min.js is a minimized version, c/o http://javascript-minifier.com
