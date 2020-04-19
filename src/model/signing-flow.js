"use strict"
/**
 * Signing Flow
 *
 * - Input: authenticator
 * - InOut: query, cosmicLink, accountId, network, horizon
 * - Intermediate: needSource, needNetwork, lockSource, lockNetwork
 * - Output: request, target, sign, result
 *
 * *: May get replaced during execution.
 * */
const { CosmicLink, resolve, config } = require("cosmic-lib")
const TxResult = require("@cosmic-plus/tx-result")

const { LiveObject } = require("@kisbox/model")
const { type } = require("@kisbox/utils")
const {
  environment: { isEmbedded }
} = require("@kisbox/helpers")

/* Definition */

class SigningFlow extends LiveObject {
  constructor (params) {
    super()

    this.network = "public"
    this.result = null
    this.$import(params, [
      "network",
      "horizon",
      "accountId",
      "authenticator",
      "query",
      "cosmicLink"
    ])
  }

  signUsingUri () {
    if (
      isEmbedded
      && (this.authenticator.target === "new"
        || this.authenticator.target === "external")
    ) {
      open(this.target)
      window.parent.postMessage("close", "*")
    } else {
      location.replace(this.target)
    }
  }

  signUsingFunction () {
    this.result = this.request()
      .then(() => {
        this.cosmicLink = this.request.cosmicLink
        return TxResult.forCosmicLink(this.cosmicLink)
      })
      .catch(error => error)
  }
}

/* Computations: inputs */
const proto = SigningFlow.prototype

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

/* Computations: intermediate */

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

/* Computations: outputs */

proto.$define(
  "request",
  ["cosmicLink", "authenticator", "accountId", "network", "horizon"],
  function () {
    if (!this.cosmicLink) {
      return this.authenticator.url || null
    }

    if (
      type(this.accountId) === "promise"
      || type(this.accountId) === "error"
    ) {
      return new Promise(() => {})
    }

    if (this.needSource && !(this.lockSource || this.accountId)) {
      return new Error("Please set a source account")
    }
    if (this.needNetwork) {
      if (!(this.network || this.lockNetwork)) {
        return new Error("Please set a network")
      } else if (!this.horizon) {
        return new Error("Please set an Horizon address")
      }
    }

    const clone = new CosmicLink(this.cosmicLink.query)
    config.source = this.accountId
    config.network = this.network

    const response = this.authenticator.handler(clone, this.authenticator)
    return response
  }
)

proto.$define("target", ["request"], function () {
  if (type(this.request) === "promise") {
    return new Promise(() => {})
  } else if (type(this.request) === "error") {
    return this.request
  }

  if (typeof this.request === "string") {
    return this.request
  } else {
    return null
  }
})

proto.$define("sign", ["request"], function () {
  if (type(this.request) === "promise") {
    return new Promise(() => {})
  } else if (type(this.request) === "error") {
    return this.request
  }

  if (typeof this.request === "string") {
    return () => this.signUsingUri()
  } else if (this.request) {
    return () => this.signUsingFunction()
  } else {
    return null
  }
})

/* Events */
proto.$on(
  ["cosmicLink", "authenticator", "network", "horizon", "sign"],
  function () {
    this.result = null
  }
)

/* Export */
module.exports = SigningFlow
