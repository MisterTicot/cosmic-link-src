"use strict"
/**
 * QR Code Canvas
 */
const QrCode = require("qrcode")

const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")
const { timeout } = require("@kisbox/helpers")

/* Definition */

class QrCodeCanvas extends View {
  constructor (params) {
    super(`
<div class="QrCodeCanvas">
  <span class="cosmiclib_loadingAnim" hidden=%notPending:target></span>
  <canvas $ref="canvas" title=%target hidden=%not:target></canvas>
</div>
`)

    this.$import(params, ["target"])
  }
}

/* Computations */
const proto = QrCodeCanvas.prototype

proto.$on("target", function () {
  if (type(this.target) === "string") {
    setQr(this.$ref.canvas, this.target)
  } else if (this.$ref.canvas) {
    clearQr(this.$ref.canvas)
  }
})

/* Helpers */

function setQr (canvas, target) {
  // Make heavy computation async.
  timeout(1).then(() => {
    const scale = Math.max(3, 6 - Math.floor(Math.sqrt(target) / 10))
    QrCode.toCanvas(canvas, target, { margin: 0, scale })
  })
}

function clearQr (canvas) {
  const context = canvas.getContext("2d")
  context.clearRect(0, 0, canvas.width, canvas.height)
}

/* Exports */
module.exports = QrCodeCanvas
