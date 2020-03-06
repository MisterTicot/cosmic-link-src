"use strict"
/**
 * Anti-tamper robot.
 */
const { View } = require("@kisbox/browser")

/* Definition */

class AntiTamper extends View {
  constructor (params = {}) {
    super(`<img class="AntiTamper" %src>`)
    this.$import(params, "hash")
  }
}

const proto = AntiTamper.prototype
proto.$define("src", ["hash"], the => `https://robohash.org/${the.hash}`)

/* Utilities */
AntiTamper.makeHash = function (size = 32) {
  const alphabet =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

  let hash = ""
  for (let i = 0; i < size; i++) {
    const random = Math.floor(Math.random() * alphabet.length)
    hash += alphabet.charAt(random)
  }

  return hash
}

/* Export */
module.exports = AntiTamper
