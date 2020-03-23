"use strict"
/**
 * QR Code Canvas
 */
const QrCode = require("qrcode")

const { View, html } = require("@kisbox/browser")
const {
  promise: { timeout }
} = require("@kisbox/helpers")

/* Definition */

class QrCodeCanvas extends View {
  constructor (params = {}) {
    super(`
<canvas $ref="canvas" title=%value hidden=%not:value></canvas>
`)

    this.value = null
    this.$import(params, ["value"])
  }
}

QrCodeCanvas.prototype.$on("value", function (value) {
  if (!value) {
    html.clear(this.$ref.canvas)
    return
  }

  // Make heavy computation async.
  timeout(1).then(() => {
    const scale = Math.max(3, 6 - Math.floor(Math.sqrt(value) / 10))
    QrCode.toCanvas(this.$ref.canvas, value, { margin: 0, scale })
  })
})

/* Exports */
module.exports = QrCodeCanvas
