"use strict"
/**
 * QR Code UI
 */
const { View } = require("@kisbox/browser")

const QrCodeCanvas = require("./qr-code-canvas")

/* Definition */

class QrCodeSwitcher extends View {
  constructor (params) {
    super(`
<form id="qrForm">
  <input type="button" value="QR Code" onclick=%switch disabled=%failed:target>
  <div %hidden>%canvas</div>
</form>
  `)

    this.disabled = false
    this.hidden = true
    this.target = null
    this.$import(params, ["target"])
    this.$link(params, ["showQrCode"])

    this.canvas = new QrCodeCanvas(params)
  }

  switch () {
    this.showQrCode = !this.showQrCode
  }
}

/* Computations */
const proto = QrCodeSwitcher.prototype

proto.$define("hidden", ["showQrCode", "disabled"], function () {
  return !this.showQrCode || this.disabled
})

/* Exports */
module.exports = QrCodeSwitcher
