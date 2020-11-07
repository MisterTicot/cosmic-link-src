"use strict"
/**
 * Handler Selector
 *
 * * Import: authenticators
 * * Link: authenticatorId
 *
 * */
const { View, html } = require("@kisbox/browser")

/* Definition */

class HandlerSelector extends View {
  constructor (params) {
    super(`
<select class="HandlerSelector" value=%authenticatorId>
  %toOption:...filteredHandlers
</select>
    `)

    this.$import(params, ["authenticators", "cosmicLink", "resolved"])
    this.$link(params, ["authenticatorId"])
  }

  isTxHandlerValid (txHandlerId) {
    return this.filteredHandlers.some((txHandler) => {
      return txHandler.id === txHandlerId
    })
  }
}

/* Computations */
const proto = HandlerSelector.prototype

proto.$define(
  "filteredHandlers",
  ["authenticators", "cosmicLink"],
  function () {
    const network = this.cosmicLink && this.cosmicLink.tdesc.network
    if (!network) return this.authenticators
    if (this.resolved) return this.filteredHandlers

    return this.authenticators.filter((handler) => {
      const wantNetwork = handler.needNetwork
      return typeof wantNetwork !== "string" || wantNetwork === network
    })
  }
)

// Make sure selected handler is a valid option for this network.
proto.$on("authenticatorId", function (authenticatorId) {
  if (!authenticatorId) return
  if (this.isTxHandlerValid(this.authenticatorId)) return

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

/* Helpers */
const helpers = HandlerSelector.helpers

helpers.toOption = function (handler) {
  return html("option", { value: handler.id }, handler.name)
}

/* Export */
module.exports = HandlerSelector
