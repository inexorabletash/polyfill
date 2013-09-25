(function(global){
  function assert(x, m) { if (!x) throw new Error("Assertion failure: " + arguments.callee.caller.name); }

  function QueueMicrotask(task) {
    // TODO: Use MutationObservers or setImmediate if available
    setTimeout(task, 0);
  }

  // TODO: Use higher fidelity ECMAScript internals shims
  function IsObject(x) { return (typeof x === 'object' && x !== null) || (typeof x === 'function'); }
  function SameValue(x, y) { return x === y; } // TODO: Handle NaN and -0
  function IsCallable(x) { return typeof x === 'function'; }
  function IsConstructor(x) { return IsCallable(x); }
  function Type(x) { return x === null ? 'null' : typeof x; }
  function WeakMap() {
    var data = [];
    this.has = function (key) {
      key = Object(key);
      for (var i = 0; i < data.length; ++i)
        if (data[i][0] === key) return true;
      return false;
    };
    this.get = function (key) {
      key = Object(key);
      for (var i = 0; i < data.length; ++i)
        if (data[i][0] === key) return data[i][1];
      return undefined;
    };
    this.set = function (key, value) {
      key = Object(key);
      for (var i = 0; i < data.length; ++i) {
        if (data[i][0] === key) { data[i][1] = value; return; }
      }
      data.push([key, value]);
    };
  }
  function forOf(iterable, func) {
    iterable.forEach(func);
  }
  // ................................

  var UNSET = Object.create(null);

  var ThenableCoercions = new WeakMap();

  function IsPromise(x) {
    if (IsObject(x) && x.__IsPromise__ === true) return true;
    return false;
  };

  function ToPromise(C, x) {
    if (IsPromise(x) && SameValue(x.__PromiseConstructor__, C) === true) return x;
    var deferred = GetDeferred(C);
    deferred.__Resolve__(x);
    return deferred.__Promise__;
  }

  function Resolve(p, x) {
    if (p.__Following__ !== UNSET || p.__Value__ !== UNSET || p.__Reason__ !== UNSET)
      return;
    if (IsPromise(x)) {
      if (SameValue(p, x)) {
        var selfResolutionError = new TypeError();
        SetReason(p, selfResolutionError);
      } else if (x.__Following__ !== UNSET) {
        p.__Following__ = x.__Following__;
        x.__Following__.__Derived__.push({__DerivedPromise__: p, __OnFulfilled__: undefined, __OnRejected__: undefined });
      } else if (x.__Value__ !== UNSET) {
        SetValue(p, x.__Value__);
      } else if (x.__Reason__ !== UNSET) {
        SetReason(p, x.__Reason__);
      } else {
        p.__Following__ = x;
        x.__Derived__.push({__DerivedPromise__: p, __OnFulfilled__: undefined, __OnRejected__: undefined});
      }
    } else {
      SetValue(p, x);
    }
  }

  function Reject(p, r) {
    if (p.__Following__ !== UNSET || p.__Value__ !== UNSET || p.__Reason__ !== UNSET) return;
    SetReason(p, r);
  }

  function Then(p, onFulfilled, onRejected) {
    if (p.__Following__ !== UNSET) {
      return Then(p.__Following__, onFulfilled, onRejected);
    }
    try {
      var C = p.constructor;
      var q = GetDeferred(C).__Promise__;
      var derived = { __DerivedPromise__: q, __OnFulfilled__: onFulfilled, __OnRejected__: onRejected };
      UpdateDerivedFromPromise(derived, p);
    } catch (e) {
      q = new Promise();
      Reject(q, e);
    }
    return q;
  }

  function PropagateToDerived(p) {
    assert((p.__Value__ === UNSET) !== (p.__Reason__ === UNSET));
    p.__Derived__.forEach(function (derived) {
      UpdateDerived(derived, p);
    });
    p.__Derived__.length = 0;
  }

  function UpdateDerived(derived, originator) {
    assert((originator.__Value__ === UNSET) !== (originator.__Reason__ === UNSET));
    if (originator.__Value__ !== UNSET) {
      if (IsObject(originator.__Value__)) {
        QueueMicrotask(function() {
          if (ThenableCoercions.has(originator.__Value__)) {
            var coercedAlready = ThenableCoercions.get(originator.__Value__);
            UpdateDerivedFromPromise(derived, coercedAlready);
          } else {
            try {
              var then = originator.__Value__["then"];
              if (IsCallable(then)) {
                var coerced = CoerceThenable(originator.__Value__, then);
                UpdateDerivedFromPromise(derived, coerced);
              } else {
                UpdateDerivedFromValue(derived, originator.__Value__);
              }
            } catch (e) {
              UpdateDerivedFromReason(derived, e);
            }
          }
        });
      } else {
        UpdateDerivedFromValue(derived, originator.__Value__);
      }
    } else {
      UpdateDerivedFromReason(derived, originator.__Reason__);
    }
  }

  function UpdateDerivedFromValue(derived, value) {
    if (IsCallable(derived.__OnFulfilled__))
      CallHandler(derived.__DerivedPromise__, derived.__OnFulfilled__, value);
    else
      SetValue(derived.__DerivedPromise__, value);
  }

  function UpdateDerivedFromReason(derived, reason) {
    if (IsCallable(derived.__OnRejected__))
      CallHandler(derived.__DerivedPromise__, derived.__OnRejected__, reason);
    else
      SetReason(derived.__DerivedPromise__, reason);
  }

  function UpdateDerivedFromPromise(derived, promise) {
    if (promise.__Value__ !== UNSET || promise.__Reason__ !== UNSET)
      UpdateDerived(derived, promise);
    else
      promise.__Derived__.push(derived);
  }

  function CallHandler(derivedPromise, handler, argument) {
    QueueMicrotask(function() {
      try {
        var v = handler.call(undefined, argument);
        Resolve(derivedPromise, v);
      } catch (e) {
        Reject(derivedPromise, e);
      }
    });
  }

  function SetValue(p, value) {
    assert(p.__Value__ === UNSET && p.__Reason__ === UNSET);
    p.__Value__ = value;
    p.__Following__ = UNSET;
    PropagateToDerived(p);
  }

  function SetReason(p, reason) {
    assert(p.__Value__ === UNSET && p.__Reason__ === UNSET);
    p.__Reason__ = reason;
    p.__Following__ = UNSET;
    PropagateToDerived(p);
  }

  function CoerceThenable(thenable, then) {
    assert(IsObject(thenable));
    assert(IsCallable(then));
    var p = new Promise();
    var resolve = function(x) { Resolve(p, x); };
    var reject = function(r) { Reject(p, r); };
    try {
      then.call(thenable, resolve, reject);
    } catch (e) {
      Reject(p, e);
    }
    ThenableCoercions.set(thenable, p);
    return p;
  }

  function GetDeferred(C) {
    if (IsConstructor(C)) {
      var resolve, reject;
      var resolver = function() { resolve = arguments[0]; reject = arguments[1]; };
      var promise = new C(resolver);
    } else {
      promise = new Promise();
      resolve = function(x) { Resolve(promise, x); };
      reject = function(r) { Reject(promise, r); };
    }
    return { __Promise__: promise, __Resolve__: resolve, __Reject__: reject };
  }

  function Promise(resolver) {
    var promise = this;
    if (Type(promise) !== 'object') throw new TypeError();
    if (promise.__IsPromise__ === UNSET) throw new TypeError();
    if (!IsCallable(resolver)) throw new TypeError();
    promise.__IsPromise__ = true;

    promise.__Following__ = UNSET;
    promise.__Value__ = UNSET;
    promise.__Reason__ = UNSET;
    promise.__Derived__ = [];
    promise.__PromiseConstructor__ = Promise;

    var resolve = function(x) { Resolve(promise, x); };
    var reject = function(r) { Reject(promise, r); };
    try {
      resolver.call(undefined, resolve, reject);
    } catch (e) {
      Reject(promise, e);
    }
    return promise;
  }
  global.Promise = Promise;

  Promise.resolve = function resolve(x) {
    var deferred = GetDeferred(this);
    deferred.__Resolve__(x);
    return deferred.__Promise__;
  };

  Promise.reject = function reject(r) {
    var deferred = GetDeferred(this);
    deferred.__Reject__(r);
    return deferred.__Promise__;
  };

  Promise.cast = function cast(x) {
    return ToPromise(this, x);
  };

  Promise.race = function race(iterable) {
    var promise = this;
    var deferred = GetDeferred(this);
    forOf(iterable, function(nextValue) {
      var nextPromise = ToPromise(promise, nextValue);
      Then(nextPromise, deferred.__Resolve__, deferred.__Reject__);
    });
    return deferred.__Promise__;
  };

  Promise.all = function all(iterable) {
    var promise = this;
    var deferred = GetDeferred(promise);
    var values = new Array(0);
    var countdown = 0;
    var index = 0;
    forOf(iterable, function(nextValue) {
      var currentIndex = index;
      var nextPromise = ToPromise(promise, nextValue);
      var onFulfilled = function(v) {
        values[currentIndex] = v;
        countdown = countdown - 1;
        if (countdown === 0) {
          deferred.__Resolve__(values);
        }
      };
      Then(nextPromise, onFulfilled, deferred.__Reject__);
      index = index + 1;
      countdown = countdown + 1;
    });
    if (index === 0) {
      deferred.__Resolve__(values);
    }
    return deferred.__Promise__;
  };

  Promise.prototype.constructor = Promise;

  Promise.prototype.then = function then(onFulfilled, onRejected) {
    if (!IsPromise(this)) throw new TypeError();
    return Then(this, onFulfilled, onRejected);
  };

  Promise.prototype.catch = function catch_(onRejected) {
    return this.then(undefined, onRejected);
  };

}(self));
