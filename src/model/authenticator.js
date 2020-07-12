"use strict"
/**
 * Authenticator
 */
const Protocol = require("./protocol")

/* Definition */

class Authenticator extends Protocol {
  constructor (params) {
    const protocol = Authenticator.protocols.get(params.protocol)
    super(protocol)
    delete this.id

    this.$import(params, [
      "id",
      // Values
      "name",
      "protocol",
      "url",
      "federation",
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
