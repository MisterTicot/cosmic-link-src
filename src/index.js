"use_strict"
/**
 * Entry point of Cosmic.Link application. We redirect without showing the
 * interface when possible. Else, we load the GUI.
 */

// Service worker
const worker = navigator.serviceWorker
if (worker) {
  worker.register("worker.js")
  worker.addEventListener("controllerchange", () => location.reload())
}

// Requires
require("@cosmic-plus/domutils/es5/polyfill")
const authenticators = require("./authenticators")
const the = require("./shared")

// Variables initialization
the.query = location.search.length > 1 && location.search
the.authenticator =
  authenticators[localStorage.authenticator]
  || authenticators["Stellar Authenticator"]
the.redirect = localStorage.redirect === "true"
the.qrCode = localStorage.QR === "true"

// Immediate redirection when possible
if (the.query && the.redirect && the.authenticator.protocol === "cosmiclink") {
  location.replace(the.authenticator.url + location.search)
} else {
  history.replaceState(
    {},
    "",
    location.pathname.replace(/index.html$/, "")
      + location.search
      + location.hash
  )
}

// GUI loading
window.onload = () => import(/* webpackChunkName: "app" */ "./app")
