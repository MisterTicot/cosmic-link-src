"use strict"
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

// Context awarness
const pageName = location.pathname.replace(/.*\//, "")
the.contextIsWidget = !!pageName.match(/^widget(.html)?$/)

// Variables initialization
the.query = location.search.length > 1 && location.search
the.authenticator =
  authenticators[localStorage.authenticator]
  || authenticators["Stellar Authenticator"]
the.redirect = !the.contextIsWidget && localStorage.redirect === "true"
the.qrCode = localStorage.QR === "true"

// Immediate redirection when possible
if (the.query && the.redirect && the.authenticator.protocol === "cosmiclink") {
  const target = the.authenticator.url + location.search
  location.replace(target)
} else if (pageName === "index.html") {
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
