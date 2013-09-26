test("Promise basics", function() {
  var fulfill, reject;
  new Promise(function (a, b) {
    fulfill = a;
    reject = b;
  });
  equal(typeof fulfill, 'function');
  equal(typeof reject, 'function');
});

asyncTest("Promise fulfill", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    equal(value, 5);
    start();
  }, function(reason) {
    ok(false);
    start();
  });

  fulfill(5);
});

asyncTest("Promise reject", function() {
  var reject;
  new Promise(function (a, b) {
    reject = b;
  }).then(function(value) {
    ok(false);
    start();
  }, function(reason) {
    equal(reason, 5);
    start();
  });

  reject(5);
});

asyncTest("Promise catch", function() {
  var reject;
  var p = new Promise(function (a, b) {
    reject = b;
  }).catch(function(reason) {
    equal(reason, 5);
    start();
  });

  reject(5);
});

asyncTest("Promise multi", function() {
  var fulfill;
  var p = new Promise(function (a, b) {
    fulfill = a;
  });

  var saw = [];
  p.then(function(value) {
    saw.push(value);
  });
  p.then(function(value) {
    saw.push(value);
    deepEqual(saw, [5, 5]);
    start();
  });

  fulfill(5);
});

asyncTest("Promise.resolve", function() {
  Promise.resolve(5).then(function(value) {
    equal(value, 5);
    start();
  });
});

asyncTest("Promise.reject", function() {
  Promise.reject(5).catch(function(value) {
    equal(value, 5);
    start();
  });
});

asyncTest("Promise resolved with promise", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  }).then(function(value) {
    equal(value, 5);
    start();
  });
  fulfill(Promise.resolve(5));
});

asyncTest("Promise rejected with promise", function() {
  var fulfill;
  new Promise(function (a, b) {
    fulfill = a;
  }).catch(function(value) {
    equal(value, 5);
    start();
  });
  fulfill(Promise.reject(5));
});

test("Promise.cast", function() {
  var p = new Promise(function(){});
  equal(Promise.cast(p), p);
  ok(Promise.cast(5) instanceof Promise);
});

asyncTest("Promise.race fulfill", function() {
  var f1, f2, f3;
  var p1 = new Promise(function(f, r) { f1 = f; });
  var p2 = new Promise(function(f, r) { f2 = f; });
  var p3 = new Promise(function(f, r) { f3 = f; });
  Promise.race([p1, p2, p3]).then(function(value) {
    equal(value, 2);
    start();
  });
  f2(2);
});

asyncTest("Promise.all fulfill", function() {
  Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
    ]).then(function(value) {
      deepEqual(value, [1,2,3]);
      start();
    });
});

asyncTest("Promise.all reject", function() {
  Promise.all([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3)
    ]).catch(function(reason) {
      equal(reason, 2);
      start();
    });
});
