"use strict"
/**
 * CosmicLinkApp.State
 * */
const { type } = require("@kisbox/utils")

const authenticators = require("./data/authenticators")
const SigningFlow = require("./model/signing-flow")

/* Definition */

class AppState extends SigningFlow {
  constructor (params) {
    super(params)

    this.$import(params, [
      "automaticRedirection",
      "authenticators",
      "authenticatorName",
      "showQrCode"
    ])

    // Prevent UI loading
    if (this.interrupt) throw "redirect"
  }
}

/* Defaults */
const proto = AppState.prototype
proto.authenticators = authenticators.array

/* Computations */

proto.$define(
  "authenticator",
  ["authenticators", "authenticatorName"],
  function () {
    return this.authenticators.find(a => a.name === this.authenticatorName)
  }
)

proto.$define(
  "interrupt",
  ["automaticRedirection", "cosmicLink", "authenticator", "target"],
  function () {
    if (type(this.target) !== "string") return

    if (this.cosmicLink && this.automaticRedirection) {
      this.sign()
      return true
    }
  }
)

/* Events */
proto.$on("authenticator", function (current, previous) {
  if (previous && previous.onExit) {
    previous.onExit()
  }
})

/* Export */
module.exports = AppState
