"use strict"
/**
 * CosmicLinkApp.State
 * */
const { type } = require("@kisbox/utils")

const CrudArray = require("./lib/crud-array")

const Authenticator = require("./model/authenticator")
const Protocol = require("./model/protocol")
const SigningFlow = require("./model/signing-flow")

/* Data */

Authenticator.protocols = new CrudArray(Protocol)
Authenticator.protocols.ingest(require("./data/protocols"))
const authenticators = new CrudArray(Authenticator)
authenticators.ingest(require("./data/wallets"))

/* Definition */

class AppState extends SigningFlow {
  constructor (params) {
    super(params)

    this.$import(params, [
      "automaticRedirection",
      "authenticators",
      "authenticatorId",
      "showQrCode"
    ])

    // Prevent UI loading
    if (this.interrupt === true) throw "redirect"
  }
}

/* Defaults */
const proto = AppState.prototype
proto.authenticators = authenticators

/* Computations */

proto.$define(
  "authenticator",
  ["authenticators", "authenticatorId"],
  function () {
    return this.authenticators.get(this.authenticatorId)
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
