# ES6

[script](es6.js) -
[unit tests](http://inexorabletash.github.io/polyfill/tests/es6.html)

The standardization of ES6 is currently in progress.
This will attempt to track the evolving spec, so may change at any time.
This assumes ES5, so use [es5.js](es5.js) for older browsers (IE9-).

In the [ES6 Drafts](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts):

#### Fundamental Objects
* Object: `assign()`, `is()`, `setPrototypeOf()`
* Symbol: `Symbol(description)`, `Symbol.for()`, `Symbol.keyFor()`, `Symbol.iterator`, `Symbol.toStringTag`
  * No security, just creates an object with a unique string representation. `typeof Symbol()` will incorrectly report `"object"` but `Symbol() instanceof Symbol` will return `true`
* Not supported: `Function.prototype.toMethod()`

#### Numbers and Dates
* Number: `EPILON`, `isFinite()`, `isInteger()`, `isNaN()`, `isSafeInteger()`, `MAX_SAFE_INTEGER`, `MIN_SAFE_INTEGER`, `parseFloat()`, `parseInt()`
* Math: `acosh()`, `asinh()`, `atanh()`, `cbrt()`, `clz32()`, `cosh()`, `expm1()`, `fround`, `hypot()`, `imul()`, `log1p()`, `log10()`, `log2()`, `sign()`, `sinh()`, `tanh()`, `trunc()`

#### Text Processing
* See also: [uate - ES5 "Tagged Template Strings"](https://github.com/inexorabletash/uate)
* String: `fromCodePoint()`, `raw`
* String prototype: `codePointAt()`, `contains()`, `endsWith()`, `repeat()`, `startsWith()`, `[@@iterator]()`
  * Not supported: `String.prototype.normalize()` - see https://github.com/walling/unorm/
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

#### Syntax Helpers
* `forOf(o, function(i) { ... })` - since `for (i of o) { ... }` can't be polyfilled. Uses iterators, so works with arrays, maps, sets, and strings, via implicit @@iterator and explicit iterators returned by keys/values/entries methods and functions.

See also: [uate - ES5 "tagged template strings"](https://github.com/inexorabletash/uate)
