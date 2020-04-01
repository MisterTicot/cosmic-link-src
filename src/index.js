"use strict"
/**
 * Entry point of Cosmic.Link application. We redirect without showing the
 * interface when possible. Else, we load the GUI.
 */
const state = require("./app.state")

/* Logic */

function init () {
  if (
    state.query
    && state.redirect
    && state.authenticator.protocol === "cosmiclink"
  ) {
    redirect()
  } else {
    loadInterface()
  }
}

function redirect () {
  const target = state.authenticator.url + location.search
  location.replace(target)
}

function loadInterface () {
  // Service worker (does it means users with automatic redirection set never
  // get updates?)
  const worker = navigator.serviceWorker
  if (worker) {
    worker.register("worker.js")
    worker.addEventListener("controllerchange", () => location.reload())
  }

  // (hack) api.cosmic.link redirects at `index.html` to shortcut itself, but we
  // don't want it to show into the address bar.
  const pageName = location.pathname.replace(/.*\//, "")
  if (pageName === "index.html") {
    const path = location.pathname.replace(/index.html$/, "")
    const url = `${path}${location.search}${location.hash}`
    history.replaceState({}, "", url)
  }

  // GUI loading
  window.onload = () => {
    import(/* webpackChunkName: "app" */ "./app")
  }
}

init()
