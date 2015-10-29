# ECMAScript 5 Polyfill

[script](es5.js) -
[unit tests](https://inexorabletash.github.io/polyfill/tests/es5.html)

[ECMAScript 5](http://www.ecma-international.org/publications/standards/Ecma-262.htm) Object, Function, String and Date extras:
* Object: `getPrototypeOf`, `getOwnPropertyNames`, `create`, `defineProperty`, `defineProperties`, `keys`
* Function prototype: `bind`
* Array: `isArray`
* Array prototype: `indexOf`, `lastIndexOf`, `every`, `some`, `forEach`, `map`, `filter`, `reduce`, `reduceRight`
* String prototype: `trim`
* Date: `now`
* Date prototype: `toISOString`

Does not include JSON - use [json2.js](https://github.com/douglascrockford/JSON-js)
