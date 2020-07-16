"use strict"
/**
 * Handler Selector
 *
 * * Import: authenticators
 * * Link: authenticatorId
 *
 * */
const { View, html } = require("@kisbox/browser")
const { timeout } = require("@kisbox/helpers")

/* Definition */

class HandlerSelector extends View {
  constructor (params) {
    super(`
<select class="HandlerSelector" value=%authenticatorId>
  %toOption:...filteredHandlers
</select>
    `)

    this.$import(params, ["authenticators", "cosmicLink"])
    this.$link(params, ["authenticatorId"])
  }
}

/* Computations */
const proto = HandlerSelector.prototype

proto.$define("filteredHandlers", ["authenticators", "cosmicLink"], function () {
  const network = this.cosmicLink && this.cosmicLink.tdesc.network
  if (!network) return this.authenticators

  return this.authenticators.filter(handler => {
    const wantNetwork = handler.needNetwork
    return typeof wantNetwork !== "string" || wantNetwork === network
  })
})

proto.$on("authenticatorId", function (authenticatorId) {
  if (!authenticatorId) return

  timeout(0).then(() => {
    const selectedHandler = this.$ref("select")
    if (selectedHandler) return

    switch (this.cosmicLink.network) {
    case "public":
    case null:
      this.authenticatorId = "Keybase"
      break
    case "test":
      this.authenticatorId = "TestAccount"
      break
    default:
      this.authenticatorId = "StellarLaboratory"
    }
  })
})

/* Helpers */
const helpers = HandlerSelector.helpers

helpers.toOption = function (handler) {
  return html("option", { value: handler.id }, handler.name)
}

/* Export */
module.exports = HandlerSelector
