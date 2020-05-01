"use strict"
/**
 * Authenticator
 */
const { LiveObject } = require("@kisbox/model")

/* Definition */

class Authenticator extends LiveObject {
  constructor (params) {
    super()

    Object.assign(this, Authenticator.protocols.get(params.protocol))
    delete this.id

    this.$import(params, [
      "id",
      // Values
      "name",
      "protocol",
      "url",
      "target",
      "needSource",
      "needNetwork"
    ])

    if (!this.buttonText && this.redirection)
      this.buttonText = "Go to " + this.name
  }
}

/* Export */
module.exports = Authenticator
