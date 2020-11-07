"use strict"
/**
 * Entry point of Cosmic.Link application. We redirect without showing the
 * interface when possible. Else, we load the GUI.
 */
require("./helpers")

const { load } = require("@kisbox/browser")
const { extractPagename, extractQuery } = require("@kisbox/helpers")

const { StellarSdk } = require("@cosmic-plus/base")

const config = require("./storage")
const Parameters = require("./lib/parameters")

/* Initialization */
document.addEventListener("DOMContentLoaded", () => {
  const noscript = document.querySelector("#noscript")
  if (noscript) noscript.hidden = true
})

window.onload = async function () {
  // Service worker.
  const worker = navigator.serviceWorker
  if (worker) {
    worker.register("worker.js")
    worker.addEventListener("controllerchange", () => location.reload())
  }

  // Context
  let pagename = extractPagename(location.pathname)
  const pageIsEmbed = !!pagename.match(/^embed(.html)?$/)
  if (pagename.match(/^index(.html)?/)) {
    pagename = ""
  }

  // Config
  config.mode = pageIsEmbed ? "embed" : "full"
  config.query = location.search
  config.selectedTabId = location.hash.substr(1)
  const assetsLoading = parseHashQuery(config, location.hash)

  if (!config.testAccount) {
    config.testAccount = StellarSdk.Keypair.random().secret()
  }

  // Application
  const appModule = await import(/* webpackChunkName: "app" */ "./app")
  const CosmicLinkApp = appModule.default
  const app = new CosmicLinkApp(config)

  await assetsLoading
  app.$mount()

  // Save user preferences.
  config.$import(app.state, [
    "authenticatorId",
    "showQrCode",
    "automaticRedirection",
    "lastAccountId"
  ])

  // Sync address bar.
  app.$on("route", (route) => {
    history.replaceState(null, null, `/${pagename}${route}`)
  })
  history.replaceState(null, null, `/${pagename}${app.route}`)

  // Save last network.
  const state = app.state
  state.$on(["open", "cosmicLink"], (_, initialCosmicLink) => {
    const cosmicLink = initialCosmicLink || state.cosmicLink
    if (state.needNetwork && !cosmicLink.tdesc.network) {
      config.network = state.network
      config.horizon = state.horizon
    }
  })
}

async function parseHashQuery (config, hash = "#") {
  if (config.mode === "full") return

  const hashQuery = extractQuery(hash.substr(1))
  const params = hashQuery ? Parameters.fromQuery(hashQuery) : {}

  // [Boolean] allowAutoredirect
  if (!params.allowAutoredirect) {
    config.$off("redirect")
    config.redirect = false
  }

  // [Url] css/css+
  const referrer = document.referrer.split("/", 3).join("/")

  let promises = []
  if (params.css) {
    promises.push(loadStyle(params.css, referrer))
  } else {
    promises.push(loadStyle("embed.css"))
    if (params["css+"]) {
      promises.push(loadStyle(params["css+"], referrer))
    }
  }

  // Timing control
  return Promise.all(promises)
}

/* Helpers */

function loadStyle (url, base = ".") {
  const href = url.match(/^https:\/\//) ? url : `${base}/${url}`
  return load.css(href).catch(console.error)
}
