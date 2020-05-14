"use strict"
/**
 * QR Code UI
 */
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const QrCodeCanvas = require("./qr-code-canvas")

/* Definition */

class QrCodeSwitcher extends View {
  constructor (params) {
    super(`
<form id="qrForm">
  <input type="button" value="QR Code" onclick=%switch %disabled>
  <div %hidden>%canvas</div>
</form>
  `)

    this.$import(params, ["uri", "xdr"])
    this.$link(params, ["showQrCode"])

    this.canvas = new QrCodeCanvas(this)
  }

  switch () {
    this.showQrCode = !this.showQrCode
  }
}

/* Computations */
const proto = QrCodeSwitcher.prototype

proto.$define("target", ["uri", "xdr"], function () {
  return this.uri || this.xdr
})

proto.$customDefine("disabled", ["target"], function () {
  return type(this.target) === "error"
})

proto.$define("hidden", ["showQrCode", "disabled"], function () {
  return !this.showQrCode || this.disabled
})

/* Exports */
module.exports = QrCodeSwitcher
