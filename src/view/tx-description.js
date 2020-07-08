"use strict"
/**
 * Tx Description
 * */

const { View, html } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const format = require("cosmic-lib/es5/format")

/* Definition */

class TxDescription extends View {
  constructor (params) {
    super(`
<div class="TxDescription cosmiclink_description">
  %description
  %status
  %signers
</div>
    `)

    this.$import(params, ["cosmicLink", "result", "resolved"])
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

proto.$customDefine("status", ["resolved"], function () {
  if (this.cosmicLink.status) return
  if (!(this.resolved instanceof Error)) return

  const cosmicLink = this.resolved.cosmicLink
  if (!cosmicLink) return

  const descriptionDiv = cosmicLink.htmlDescription
  const statusDiv = html.grab(".cosmiclib_statusNode", descriptionDiv)
  return statusDiv
})

proto.$customDefine("signers", ["resolved"], function () {
  if (!this.resolved || !type(this.resolved) === "object") return

  const context = this.resolved
  const transaction = this.resolved.transaction
  if (!transaction) return

  const signersNode = format.signatures(context, transaction)
  return signersNode
})

/* Export */
module.exports = TxDescription
