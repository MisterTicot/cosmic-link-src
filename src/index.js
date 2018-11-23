"use_strict"
/**
 * Entry point of Cosmic.Link application. We redirect without showing the
 * interface when possible. Else, we load the GUI.
 */
const authenticators = require("./authenticators")
const the = require("./shared")

// Service worker
if (navigator.serviceWorker) navigator.serviceWorker.register("worker.js")

// Variables initialization
the.query = location.search.length > 1 && location.search
the.authenticator = authenticators[localStorage.authenticator]
  || authenticators["Stellar Authenticator"]
the.redirect = localStorage.redirect === "true"
the.qrCode = localStorage.QR === "true"

// Immediate redirection when possible
if (the.query && the.redirect && the.authenticator.protocol === "cosmiclink") {
  location.replace(the.authenticator.url + location.search)
} else {
  history.replaceState({}, "",
    location.pathname.replace(/index.html$/,"") + location.search + location.hash)
}

// GUI loading
document.body.onload = () => import(/* webpackChunkName: "gui" */ "./gui")
