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
  %toOption:...authenticators
</select>
    `)

    this.$import(params, ["authenticators"])
    this.$link(params, ["authenticatorId"])
  }
}

/* Helpers */
const helpers = HandlerSelector.helpers

helpers.toOption = function (handler) {
  return html("option", { value: handler.id }, handler.name)
}

/* Export */
module.exports = HandlerSelector
