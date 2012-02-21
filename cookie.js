
// Adam Barth's abandoned(?) HTML Cookie API proposal
// https://docs.google.com/Doc?docid=0AZpchfQ5mBrEZGQ0cDh3YzRfMTRmdHFma21kMg&hl=en&pli=1

(function () {
  "use strict";

  /** @constructor */
  function Cookie(name, value) {
    this.name = name;
    this.value = value;
    this.httpOnly = false;
  }

  function parseCookies(findName) {
    var array = document.cookie.split(/;\s+/),
        i, str, idx, cookie;
    for (i = 0; i < array.length; i += 1) {
      str = array[i];
      idx = str.indexOf('=');
      cookie = new Cookie(str.substring(0, idx), str.substring(idx + 1));
      if (cookie.name === findName) {
        return cookie;
      } else {
        array[i] = cookie;
      }
    }
    return arguments.length > 0 ? null : array;
  }

  function getCookie(name, callback) {
    setTimeout(function () {
      callback(parseCookies(name));
    }, 0);
  }

  function getAllCookies(callback) {
    setTimeout(function () {
      callback(parseCookies());
    }, 0);
  }

  function setCookie(cookie, errback) {
    setTimeout(function () {
      var str = cookie.name + '=' + (cookie.value || ""),
          foundCookie, expectDeleted;

      if (cookie.expires) {
        str += "; expires=" + cookie.expires;
      }
      if (cookie.domain) {
        str += "; domain=" + cookie.domain;
      }
      if (cookie.secure) {
        str += "; secure";
      }
      str += "; path=" + (cookie.path || "/");
      document.cookie = str;

      foundCookie = parseCookies(cookie.name);
      expectDeleted = cookie.expires && (new Date(cookie.expires) < new Date());
      if (!foundCookie && !expectDeleted) {
        errback("Cookie not set");
      } else if (foundCookie.value !== cookie.value) {
        errback("Cookie not set");
      }
    }, 0);
  }

  function deleteCookie(name, errback) {
    setTimeout(function () {
      document.cookie = name + "=; expires=" + (new Date(0).toGMTString()) + "; path=/";
      var foundCookie = parseCookies(name);
      if (foundCookie) {
        errback("Cookie not deleted");
      }
    }, 0);
  }

  document.getCookie = document.getCookie || getCookie;
  document.getAllCookies = document.getAllCookies || getAllCookies;
  document.setCookie = document.setCookie || setCookie;
  document.deleteCookie = document.deleteCookie || deleteCookie;

} ());
