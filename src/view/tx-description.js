"use strict"
/**
 * Tx Description
 *
 * Input: cosmicLink
 * */

const { View } = require("@kisbox/browser")

/* Definition */

class TxDescription extends View {
  constructor (params) {
    super(`
<div class="TxDescription">%description</div>
    `)

    this.$import(params, ["cosmicLink"])
  }
}

/* Computations */
const proto = TxDescription.prototype

proto.$define("description", ["cosmicLink"], function () {
  if (this.cosmicLink && this.cosmicLink.tdesc.operations) {
    return this.cosmicLink.htmlDescription
  } else {
    return "No transaction"
  }
})

/* Export */
module.exports = TxDescription
