"use strict"
/**
 * CosmicLinkApp.State
 * */
const { StellarSdk } = require("@cosmic-plus/base")

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

    // Setup test account
    const testAccount = this.authenticators.get("TestAccount")
    testAccount.keypair = StellarSdk.Keypair.fromSecret(params.testAccount)
    if (this.authenticator === testAccount) {
      this.$trigger("authenticator")
    }

    // Beta debugging
    // eslint-disable-next-line no-console
    console.log("State:", this)
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
  ["automaticRedirection", "authenticator", "uri"],
  function () {
    if (!this.authenticator.url) return

    if (this.cosmicLink && this.automaticRedirection) {
      this.open()
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
