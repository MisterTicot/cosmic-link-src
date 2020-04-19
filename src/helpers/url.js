"use strict"
/**
 * URL helpers
 * */
const my = exports

/* Library */

my.extractPagename = function (url) {
  return url.replace(/^[^?#]*\//, "").replace(/[?#].*/, "")
}

my.extractQuery = function (url) {
  return url.replace(/^[^?]*/, "").replace(/#.*/, "")
}
