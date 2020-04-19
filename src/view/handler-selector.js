"use strict"
/**
 * Handler Selector
 *
 * * Import: authenticators
 * * Link: authenticatorName
 *
 * */
const { View, html } = require("@kisbox/browser")

/* Definition */

class HandlerSelector extends View {
  constructor (params) {
    super(`
<select class="HandlerSelector" value=%authenticatorName>
  %toOption:...authenticators
</select>
    `)

    this.$import(params, ["authenticators"])
    this.$link(params, ["authenticatorName"])
  }
}

/* Helpers */
const helpers = HandlerSelector.helpers

helpers.toOption = function (handler) {
  return html("option", { value: handler.name }, handler.fullName)
}

/* Export */
module.exports = HandlerSelector
