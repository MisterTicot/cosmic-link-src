const authenticators = exports

const wallets = require("@cosmic-plus/base/es5/wallets")

const { html } = require("@kisbox/browser")

const protocols = require("./protocols")

authenticators.array = []
authenticators.nodes = []
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

  get node () {
    return html("option", { value: this.name }, this.fullName)
  }
}

for (let entry in wallets) {
  const wallet = wallets[entry]
  const authenticator = new Authenticator(wallet)
  exports.array.push(authenticator)
  exports.nodes.push(authenticator.node)
  exports[authenticator.name] = authenticator
  exports.byId[entry] = authenticator
}
