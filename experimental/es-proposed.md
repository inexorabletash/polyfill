# ECMAScript - Proposals for Future Editions

Per https://github.com/tc39/ecma262

[script](es-proposed.js) -
[unit tests](https://inexorabletash.github.io/polyfill/experimental/tests/es-proposed.html)

#### Stage 3

* `Array.prototype.includes()` [ref](https://github.com/domenic/Array.prototype.contains/)

See also:

* SIMD - see https://github.com/tc39/ecmascript_simd/blob/master/src/ecmascript_simd.js

#### Stage 2

* Object iterators: `Object.values()`, `Object.entries()` [ref](https://github.com/ljharb/proposal-object-values-entries)

See also:

* [Object.observe polyfill](https://gist.github.com/inexorabletash/8010316)

#### Stage 1

* String prototype: `trimLeft()`, `trimRight()` [ref](https://github.com/sebmarkbage/ecmascript-string-left-right-trim)
* String padding:  `padLeft()`, `padRight()` [ref](https://github.com/ljharb/proposal-string-pad-left-right)
* String.prototype: `matchAll()` [ref](https://github.com/ljharb/String.prototype.matchAll)

#### Stage 0

* `String.prototype.at()` [ref](https://github.com/mathiasbynens/String.prototype.at)
* `Object.getOwnPropertyDescriptors` [ref](https://gist.github.com/WebReflection/9353781)

See also:

* [Int64](https://github.com/inexorabletash/int64)

#### Informal Proposals

* Number: `compare()`
* Array prototype: `pushAll()`
* Reflection: `Object.getPropertyDescriptor(o)`, `Object.getPropertyNames(o)`
