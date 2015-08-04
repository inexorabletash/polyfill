# ES7

[script](es7.js) -
[unit tests](http://inexorabletash.github.io/polyfill/experimental/tests/es7.html)

#### Stage 1

* `Array.prototype.includes()` [ref](https://github.com/domenic/Array.prototype.contains/)
* String prototype: `trimLeft()`, `trimRight()` [ref](https://gist.github.com/DmitrySoshnikov/65a2070477fffb465048)

#### Stage 0

* String padding:  `padLeft()`, `padRight()` [ref](http://wiki.ecmascript.org/doku.php?id=strawman:string_padding),
* `String.prototype.at()` [ref](http://wiki.ecmascript.org/doku.php?id=strawman:string_at),
* `Object.getOwnPropertyDescriptors` [ref](https://gist.github.com/WebReflection/9353781)

#### Informal Proposals

* Number: `compare()`
* Array prototype: `pushAll()`
* Object iterators: `Object.values()`, `Object.entries()`
* Reflection: `Object.getPropertyDescriptor(o)`, `Object.getPropertyNames(o)`


### See Also
* [Object.observe polyfill](https://gist.github.com/inexorabletash/8010316)
