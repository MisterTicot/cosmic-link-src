"use strict"
/**
 * User (stored) Configuration
 */
const Storage = require("./lib/storage")

/* Upgrade from Cosmic.link v1 configuration */
Storage.rename("QR", "showQrCode", x => x === "true")
Storage.rename("accountId", "lastAccountId")
Storage.rename("authenticator", "authenticatorName")
Storage.rename("authenticatorName", "authenticatorId", x => {
  return x.replace("/ /g", "")
})
Storage.rename("myHash", "antiTamperHash")
Storage.rename("redirect", "automaticRedirection")

/* Load */
const config = new Storage({
  antiTamperHash: "",
  authenticatorId: "Keybase",
  automaticRedirection: false,
  horizon: "https://horizon.stellar.org",
  lastAccountId: null,
  network: "public",
  showQrCode: false,
  testAccount: null
})

/* Export */
module.exports = config
