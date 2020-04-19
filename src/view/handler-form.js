"use strict"
/**
 * Handler Form
 *
 * *Inputs:* authenticators, signingFlow*
 *
 * *: Can be edited by user input.
 **/
const { View } = require("@kisbox/browser")

const AccountInput = require("./account-input")
const HandlerSelector = require("./handler-selector")
const NetworkSelector = require("./network-selector")

/* Definition */

class HandlerForm extends View {
  constructor (signingFlow) {
    super(`
<form class="HandlerForm" onsubmit="return false">
  %handlerSelector
  <div hidden=%not:needSource>%accountInput</div>
  <div hidden=%not:needNetwork>%networkSelector</div>
</form>
    `)

    // Inputs
    this.$import(signingFlow, ["needSource", "needNetwork"])

    // Components
    this.handlerSelector = new HandlerSelector(signingFlow)
    this.accountInput = new AccountInput(signingFlow)
    this.networkSelector = new NetworkSelector(signingFlow)
  }
}

/* Export */
module.exports = HandlerForm
