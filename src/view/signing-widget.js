"use strict"
/**
 * Signing Widget
 * */
const { View } = require("@kisbox/browser")

const TxDescription = require("./tx-description")
const HandlerForm = require("./handler-form")
const RedirectionForm = require("./redirection-form")

/* Definition */

class SigningWidget extends View {
  constructor (signingFlow) {
    super(`
<section class="SigningWidget">
  <h2>Stellar Transaction Request</h2>
  <hr>

  <section>
    <h3>Step 1: Check the Transaction</h3>
    %txDescription
  </section>
  <hr>

  <section>
    <h3>Step 2: Selection a Signing Method</h3>
    %handlerForm
  </section>
  <hr>

  <section>
    <h3>Step 3: Sign the Transaction</h3>
    %redirectionForm
  </section>
    `)

    // Components
    this.txDescription = new TxDescription(signingFlow)
    this.handlerForm = new HandlerForm(signingFlow)
    this.redirectionForm = new RedirectionForm(signingFlow)
  }
}

/* Export */
module.exports = SigningWidget
