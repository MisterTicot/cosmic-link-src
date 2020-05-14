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
      "getAddress",
      "resolveRequest",
      "requestToUri",
      "requestToXdr",
      "signRequest",
      "onExit"
    ])
  }

  async resolveRequest (cosmicLink) {
    await cosmicLink.lock()
    return cosmicLink
  }
}

/* Export */
module.exports = Protocol
