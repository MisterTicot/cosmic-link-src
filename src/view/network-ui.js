"use strict"
/**
 * Network UI
 * */
const cosmicLib = require("cosmic-lib")

const NetworkSelector = require("./network-selector")
const state = require("../app.state")

/* Instance */
const networkUI = new NetworkSelector()

networkUI.$on("networkSelector", function () {
  if (!this.isCustom || this.disabled) return
  this.network = state.customPassphrase || this.network
})

networkUI.$on("horizon", function () {
  if (!this.isCustom || this.disabled) return

  if (this.network && this.horizon) {
    const passphrase = cosmicLib.resolve.networkPassphrase(this.network)
    cosmicLib.config.setupNetwork(this.network, this.horizon, passphrase)
    localStorage[`network:${passphrase}`] = this.horizon
  }
})

networkUI.$listen(state, "authenticator", authenticator => {
  if (authenticator.needNetwork) {
    networkUI.$show()
  } else {
    networkUI.$hide()
  }
})

networkUI.$link(state, ["horizon", "network", "networkSelector", "cosmicLink"])
networkUI.$mount("#networkDiv")

/* Export */
module.exports = networkUI
