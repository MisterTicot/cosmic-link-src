"use strict"
/**
 * Entry point of Cosmic.Link application. We redirect without showing the
 * interface when possible. Else, we load the GUI.
 */
require("@cosmic-plus/domutils/es5/polyfill")

const authenticators = require("./data/authenticators")
const the = require("./app.state")

function init () {
  // Context awareness
  const pageName = location.pathname.replace(/.*\//, "")
  the.contextIsWidget = !!pageName.match(/^widget(.html)?$/)

  // Variables initialization
  the.query = location.search.length > 1 && location.search
  the.authenticator =
    authenticators[localStorage.authenticator]
    || authenticators["Stellar Authenticator"]
  the.redirect = !the.contextIsWidget && localStorage.redirect === "true"
  the.qrCode = localStorage.QR === "true"

  if (
    the.query
    && the.redirect
    && the.authenticator.protocol === "cosmiclink"
  ) {
    redirect()
  } else {
    loadInterface(pageName)
  }
}

function redirect () {
  const target = the.authenticator.url + location.search
  location.replace(target)
}

function loadInterface (pageName) {
  // Service worker (does it means users with automatic redirection set never
  // get updates?)
  const worker = navigator.serviceWorker
  if (worker) {
    worker.register("worker.js")
    worker.addEventListener("controllerchange", () => location.reload())
  }

  // (hack) api.cosmic.link redirects at `index.html` to shortcut itself, but we
  // don't want it to show into the address bar.
  if (pageName === "index.html") {
    const path = location.pathname.replace(/index.html$/, "")
    const url = `${path}${location.search}${location.hash}`
    history.replaceState({}, "", url)
  }

  // GUI loading
  window.onload = () => import(/* webpackChunkName: "app" */ "./app")
}

init()
