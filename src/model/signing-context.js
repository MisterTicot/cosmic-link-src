"use strict"
/**
 * Signing Context
 **/
const { CosmicLink, resolve, config } = require("cosmic-lib")
const { LiveObject } = require("@kisbox/model")

/* Definition */

class SigningContext extends LiveObject {
  constructor (params) {
    super()

    this.network = "public"
    this.$import(params, [
      "network",
      "horizon",
      "accountId",
      "authenticator",
      "query",
      "cosmicLink"
    ])
  }
}

/* Computations: inputs */
const proto = SigningContext.prototype

proto.$on("network", function () {
  // Turns passphrases into network names. (e.g: "public")
  const name = resolve.networkName(this.network)
  if (this.network !== name) {
    this.network = name
    return
  }
})

proto.$define("horizon", ["network"], function () {
  return (
    resolve.horizon(this.network)
    || this.cosmicLink && this.cosmicLink.tdesc.horizon
    || ""
  )
})

proto.$define("cosmicLink", ["query"], function () {
  if (this.query && this.query.length > 1) {
    return new CosmicLink(this.query)
  } else {
    return null
  }
})

proto.$define("query", ["cosmicLink"], function () {
  if (this.cosmicLink) {
    return this.cosmicLink.query
  } else {
    return null
  }
})

/* Computations: intermediate */

proto.$define("needSource", ["authenticator"], function () {
  if (this.authenticator) {
    return !!this.authenticator.needSource
  }
})

proto.$define("needNetwork", ["authenticator"], function () {
  if (this.authenticator) {
    return !!this.authenticator.needNetwork
  }
})

proto.$define("lockSource", ["cosmicLink"], function () {
  if (this.cosmicLink) {
    return !!this.cosmicLink.tdesc.source
  }
})

proto.$define("lockNetwork", ["cosmicLink"], function () {
  if (this.cosmicLink) {
    return !!this.cosmicLink.tdesc.network
  }
})

proto.$define("accountId", ["authenticator", "cosmicLink"], function () {
  if (this.authenticator.getAccountId) {
    return this.authenticator.getAccountId()
  } else if (this.lockSource) {
    return this.cosmicLink.tdesc.source
  } else if (typeof this.accountId === "string") {
    return this.accountId
  } else {
    return ""
  }
})

proto.$define("network", ["cosmicLink"], function () {
  if (this.lockNetwork) {
    return this.cosmicLink.tdesc.network
  } else {
    return this.network || "public"
  }
})

/* Events: intermediate */

proto.$on("horizon", function () {
  if (this.horizon.length > 4 && this.horizon.substr(0, 4) !== "http") {
    this.horizon = `https://${this.horizon}`
    return
  }

  // Save network/horizon association
  const passphrase = resolve.networkPassphrase(this.network)
  config.setupNetwork(this.network, this.horizon, passphrase)
})

/* Export */
module.exports = SigningContext
