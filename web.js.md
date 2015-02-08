Web Standards Bundle
--------------------
[script](web.js) -
[unit tests](http://inexorabletash.github.io/polyfill/tests/web.html)

Bundled together; nearly every page I create needs at least some of
these. These will change over time, and going forward I will only
target IE8 and later. (Since IE7 and earlier did not support modifying
built-in object prototypes, helper functions used instead that can be
used if IE7 compatibility is needed.)

This bundles shims for:

* HTML
* DOM
* XMLHttpRequest
* Timing
* CSSOM
