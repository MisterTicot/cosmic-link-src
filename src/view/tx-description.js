"use strict"
/**
 * Tx Description
 *
 * Input: cosmicLink
 * */

const { View, html } = require("@kisbox/browser")

/* Definition */

class TxDescription extends View {
  constructor (params) {
    super(`
<div class="TxDescription cosmiclink_description">
  %description
  %status
</div>
    `)

    this.$import(params, ["cosmicLink", "resolved"])
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

/* Export */
module.exports = TxDescription
