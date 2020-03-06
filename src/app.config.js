"use strict"
/**
 * User (stored) Configuration
 */
const Storage = require("./lib/storage")

/* Upgrade from Cosmic.link v1 configuration */
Storage.rename("QR", "qrCode", x => x === "true")
Storage.rename("authenticator", "authenticatorName")
Storage.rename("myHash", "antiTamperHash")

/* Load */
const config = new Storage({
  accountId: "",
  antiTamperHash: "",
  authenticatorName: "Stellar Authenticator",
  customPassphrase: "",
  networkSelector: "public",
  qrCode: false,
  redirect: false
})

/* Export */
module.exports = config
