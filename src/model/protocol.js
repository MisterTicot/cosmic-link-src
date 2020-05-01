"use strict"
/**
 * Protocol
 */
const { LiveObject } = require("@kisbox/model")

/* Definition */

class Protocol extends LiveObject {
  constructor (params) {
    super()

    // Defaults
    this.redirection = true
    this.textarea = false
    this.qrCode = true

    this.$pick(params, [
      "id",
      // Values
      "redirection",
      "textArea",
      "qrCode",
      "buttonText",
      // Actions
      "getAccountId",
      "handler",
      "refresh",
      "onExit"
    ])
  }
}

/* Export */
module.exports = Protocol
