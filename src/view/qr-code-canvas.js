"use strict"
/**
 * QR Code Canvas
 */
const QrCode = require("qrcode")

const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")
const {
  promise: { timeout }
} = require("@kisbox/helpers")

/* Definition */

class QrCodeCanvas extends View {
  constructor (params) {
    super(`
<div class="QrCodeCanvas">
  <span class="cosmiclib_loadingAnim" hidden=%not:pending></span>
  <canvas $ref="canvas" title=%target %hidden></canvas>
</div>
`)

    this.$import(params, ["target"])
  }
}

/* Computations */
const proto = QrCodeCanvas.prototype

proto.$define("pending", ["target"], function () {
  return type(this.target) === "promise"
})

proto.$define("hidden", ["target"], function () {
  return !this.target || type(this.target) !== "string"
})

proto.$on("target", function () {
  if (this.hidden) {
    clearQr(this.$ref.canvas)
  } else {
    setQr(this.$ref.canvas, this.target)
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
