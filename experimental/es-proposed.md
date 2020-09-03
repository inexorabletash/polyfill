# ECMAScript - Proposals for Future Editions

Per https://github.com/tc39/ecma262

[script](es-proposed.js) -
[unit tests](https://inexorabletash.github.io/polyfill/experimental/tests/es-proposed.html)

#### Stage 3

See also:

* Promise prototype: `finally()` [ref](https://github.com/tc39/proposal-promise-finally)
* Array prototype: `flatten()` and `flatMap()` [ref](https://tc39.github.io/proposal-flatMap/)

#### Stage 2

* String prototype: `trimStart()`, `trimEnd()` (and `trimLeft()`, `trimRight()` aliases) [ref](https://github.com/sebmarkbage/ecmascript-string-left-right-trim)
* String.prototype: `matchAll()` [ref](https://github.com/ljharb/String.prototype.matchAll)

#### Stage 1

* Math extensions: `clamp()`, `scale()`, `radians()`, `degrees()`, `RAD_PER_DEG`, `DEG_PER_RAD` [ref](https://github.com/rwaldron/proposal-math-extensions/blob/master/README.md)
* Set/Map/WeakSet/WeakMap `.of()` and `.from()` [ref](https://github.com/leobalter/proposal-setmap-offrom)
* Promise: `try()` [ref](https://github.com/ljharb/proposal-promise-try)
* String prototype: `replaceAll()` [ref](https://github.com/tc39/proposal-string-replace-all)
* String prototype: `codePoints()` [ref](https://github.com/RReverser/string-prototype-codepoints)
* Math: `signbit()` [ref](http://jfbastien.github.io/papers/Math.signbit.html)

See also:

* [Intl.Segmenter](https://gist.github.com/inexorabletash/8c4d869a584bcaa18514729332300356)

#### Stage 0

* `String.prototype.at()` [ref](https://github.com/mathiasbynens/String.prototype.at)

See also:

* [Int64](https://github.com/inexorabletash/int64)

#### Obsolete/Abandoned Proposals

* Number: `compare()`
* Array prototype: `pushAll()`
* Reflection: `Object.getPropertyDescriptor(o)`, `Object.getPropertyNames(o)`
* Math: `denormz()`, `fdenormz()`
* 64-bit Math: `imulh()`, `umulh()`, `iaddh()`, `isubh()` [ref](https://gist.github.com/BrendanEich/4294d5c212a6d2254703)
