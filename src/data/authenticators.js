"use strict"
/**
 * Authenticators
 * */
const authenticators = exports

const protocols = require("./protocols")
const wallets = require("./wallets")

authenticators.array = []
authenticators.byId = {}

class Authenticator {
  constructor (wallet) {
    Object.assign(this, wallet, protocols[wallet.protocol])
    this.name = wallet.name.replace(/ \(.*\)/, "")
    this.fullName = wallet.name

    if (!this.buttonText && this.redirection)
      this.buttonText = "Go to " + this.name
  }

  async handle (cosmicLink) {
    return this.handler(this, cosmicLink)
  }
}

for (let entry in wallets) {
  const wallet = wallets[entry]
  const authenticator = new Authenticator(wallet)
  authenticator.id = entry
  exports.array.push(authenticator)
  exports[authenticator.name] = authenticator
  exports.byId[entry] = authenticator
}
