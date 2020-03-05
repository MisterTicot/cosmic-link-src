"use strict"
/**
 * TxResultView - Displays TxResult instances
 */
const TxResult = require("@cosmic-plus/tx-result")
const { View, html } = require("@kisbox/browser")

/* Definition */

class TxResultView extends View {
  static async forCosmicLink (cosmicLink) {
    const result = await TxResult.forCosmicLink(cosmicLink)
    return new TxResultView(result)
  }

  static fromResponse (response) {
    const result = new TxResult(response)
    return new TxResultView(result)
  }

  constructor (txResult) {
    super(`
<div class="cosmiclink_description">

  <span class=%state>%title</span>

  <ul class="error" hidden=%validated>
    %{toLi:...errors}
  </ul>

</div>
    `)

    this.$import(txResult, ["title", "errors", "validated"])
    this.state = this.validated ? "info" : "error"
  }
}

TxResultView.helpers.toLi = any => html("li", [any])

/* Exports */
module.exports = TxResultView
