"use strict"
/**
 * Signing Flow
 **/
const { CosmicLink, config } = require("cosmic-lib")
const TxResult = require("@cosmic-plus/tx-result")

const {
  environment: { isEmbedded }
} = require("@kisbox/helpers")

const SigningContext = require("./signing-context")

/* Definition */

class SigningFlow extends SigningContext {
  constructor (params) {
    super(params)

    this.result = null
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

/* Computations */
const proto = SigningFlow.prototype

proto.$define(
  "request",
  ["cosmicLink", "authenticator", "accountId", "network", "horizon"],
  function () {
    if (!this.cosmicLink) {
      return this.authenticator.url || null
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
  if (typeof this.request === "string") {
    return this.request
  } else {
    return null
  }
})

proto.$define("sign", ["request"], function () {
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
