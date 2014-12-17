(function(global) {
  var POW_2_32 = 0x100000000;

  function Int64(lo, hi) {
    this.lo = lo | 0;
    this.hi = hi | 0;
  }

  Int64.prototype = {
    // https://esdiscuss.org/topic/efficient-64-bit-arithmetic
    add: function(other) {
      if (typeof other === 'number') other = Int64.fromNumber(other);
      var lo = this.lo + other.lo;
      var hi = Math.iaddh(this.lo, this.hi, other.lo, other.hi);
      return new Int64(lo, hi);
    },

    sub: function(other) {
      if (typeof other === 'number') other = Int64.fromNumber(other);
      var lo = this.lo - other.lo;
      var hi = Math.isubh(this.lo, this.hi, other.lo, other.hi);
      return new Int64(lo, hi);
    },

    mul: function(other) {
      if (typeof other === 'number') other = Int64.fromNumber(other);
      var lo = Math.imul(this.lo, other.lo);
      var hi = Math.imulh(this.lo, other.lo) + Math.imul(this.lo, other.hi) | 0;
      hi = (hi + Math.imul(other.lo, this.hi));
      return new Int64(lo, hi);
    },

    neg: function() {
      return Int64.ZERO.sub(this);
    },

    not: function() {
      return new Int64(!this.lo, !this.hi);
    },

    valueOf: function() {
      return this.hi * POW_2_32 + (this.lo >>> 0);
    }
  };

  Int64.ZERO = new Int64(0, 0);
  Int64.ONE = new Int64(1, 0);
  Int64.MIN_VALUE = new Int64(0, 0x80000000);
  Int64.MAX_VALUE = new Int64(0xFFFFFFFF, 0x7FFFFFFF);

  Int64.fromNumber = function(n) {
    if (!isFinite(n) || !n) return new Int64(0, 0);
    if (n <= Int64.MIN_VALUE) return Int64.MIN_VALUE;
    if (n >= Int64.MAX_VALUE) return Int64.MAX_VALUE;
    if (n < 0) return Int64.fromNumber(-n).neg();
    return new Int64(n % POW_2_32, n / POW_2_32);
  };

  global.Int64 = Int64;
}(self));
