"use strict"
/**
 * QR Code UI
 */
const { View } = require("@kisbox/browser")

const QrCodeCanvas = require("./qr-code-canvas")

/* Definition */

class QrCodeSwitcher extends View {
  constructor (params = {}) {
    super(`
<form id="qrForm">
  <input type="button" value="QR Code" onclick=%switch %disabled>
  <div %hidden>
    <span class="cosmiclib_loadingAnim" hidden=%has:value></span>
    %canvas
  </div>
</form>
  `)

    this.disabled = false
    this.hidden = true
    this.value = null
    this.$import(params, ["checked", "disabled", "value"])

    this.canvas = new QrCodeCanvas(this)
  }

  switch () {
    this.checked = !this.checked
  }
}

QrCodeSwitcher.prototype.$define("hidden", ["checked", "disabled"], function () {
  return !this.checked || this.disabled
})

/* Exports */
module.exports = QrCodeSwitcher
