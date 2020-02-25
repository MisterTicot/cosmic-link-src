"use strict"
/**
 * QR Code UI
 */
const QrCode = require("qrcode")

const dom = require("@cosmic-plus/domutils/es5/dom")
const html = require("@cosmic-plus/domutils/es5/html")

const {
  promise: { timeout }
} = require("@kisbox/helpers")

const the = require("../app.state")

/* Definiton */
const qrCodeUI = {}

qrCodeUI.loadingAnim = function () {
  html.rewrite(dom.qrCode, html.create("span", ".cosmiclib_loadingAnim"))
}

qrCodeUI.refresh = async function (value) {
  // Makes that fuction non-blocking.
  await timeout(0)

  if (!the.authenticator.qrCode || !value) return

  const canvas = html.create("canvas", { title: value })
  const scale = Math.max(3, 6 - Math.floor(Math.sqrt(value) / 10))
  QrCode.toCanvas(canvas, value, { margin: 0, scale })

  html.rewrite(dom.qrCode, canvas)
}

qrCodeUI.switch = function () {
  the.qrCode = localStorage.QR = !the.qrCode
  if (the.qrCode) qrCodeUI.enable()
  else qrCodeUI.disable()
}

qrCodeUI.enable = function () {
  dom.qrButton.className = "enabled"
  html.show(dom.qrCode)
}

qrCodeUI.disable = function () {
  dom.qrButton.className = undefined
  html.hide(dom.qrCode)
}

/* Events */

dom.qrButton.onclick = qrCodeUI.switch

/* Exports */
module.exports = qrCodeUI
