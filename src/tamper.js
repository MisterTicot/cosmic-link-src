"use_strict"
/**
 * Robot tamper.
 */
const dom = require("@cosmic-plus/jsutils/dom")

function myHash () {
  if (localStorage.myHash) return localStorage.myHash

  var alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var size = 32

  var hash = ""
  for (var i = 0; i < size; i++) {
    hash += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  localStorage.myHash = hash
  return hash
}

dom.tamper.src = "https://robohash.org/" + myHash()
