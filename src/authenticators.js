const authenticators = exports

const html = require("@cosmic-plus/domutils/es5/html")
const wallets = require("@cosmic-plus/base/es5/wallets")

const protocols = require("./protocols")

authenticators.array = []
authenticators.nodes = []
authenticators.byId = {}

class Authenticator {
  constructor (wallet) {
    Object.assign(this, wallet, protocols[wallet.protocol])
    if (!this.buttonText && this.redirection)
      this.buttonText = "Go to " + this.name
  }

  async handle (cosmicLink) {
    return this.handler(this, cosmicLink)
  }

  get node () {
    return html.create("option", { value: this.name }, this.name)
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
