"use strict"
/**
 * QR Code UI
 */
const QrCodeSwitcher = require("./qr-code-switcher")
const state = require("../app.state")

/* Instance */
const qrCode = new QrCodeSwitcher()

qrCode.$pull("checked", state, "qrCode")
qrCode.$push("checked", state, "qrCode")

qrCode.$listen(state, "error", () => {
  qrCode.disabled = true
})

qrCode.$listen(state, "authenticator", () => {
  qrCode.disabled = false
  qrCode.value = null
})

qrCode.$mount("#qrForm")

/* Exports */
module.exports = qrCode
