# ECMAScript 2015 Polyfill

[script](es6.js) -
[unit tests](https://inexorabletash.github.io/polyfill/tests/es6.html)

This assumes ES5, so use [es5.js](es5.js) for older browsers (IE9-).

[ECMAScript 2015 Standard](http://www.ecma-international.org/ecma-262/6.0/)

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
* String prototype: `codePointAt()`, `endsWith()`, `includes()`, `repeat()`, `startsWith()`, `[@@iterator]()`
  * Not supported: `String.prototype.normalize()` - see https://github.com/walling/unorm/
* RegExp prototype: `@@match()`, `@@replace()`, `@@search()`, `@@split()`, `flags`
* String.prototype `match()`, `replace()`, `search()`, and `split()` dispatch through RegExp symbol methods

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

See also: [uate - ES5 "tagged template strings"](https://github.com/inexorabletash/uate)


<a name="typedarray"></name>
# Typed Arrays
[script](typedarray.js) -
[unit tests](https://inexorabletash.github.io/polyfill/tests/typedarray.html) -
[spec](https://www.khronos.org/registry/typedarray/specs/latest/)

Originally specified separately, Typed Arrays are now included in ES2015.

* `ArrayBuffer`
* `Uint8Array`, `Int8Array`, `Uint16Array`, `Int16Array`, `Uint32Array`, `Int32Array`, `Float32Array`, `Float64Array`
* `DataView`

Creating index getter/setters (i.e. `array[0]`, `array[1]`, etc) is slow and consumes significant memory. Arrays larger than 100k entries will be too slow to initialize in most cases so an upper limit is placed on the size of arrays and exception is thrown on construction.
