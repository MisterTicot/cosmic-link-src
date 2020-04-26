"use strict"
/**
 * App Full
 *
 * inouts: query, selectedTabId, antiTamperHash, signingFlow
 * outputs: route
 *
 * */
const { sep7Utils } = require("cosmic-lib")
const { View, html } = require("@kisbox/browser")

const AppState = require("./app.state")
const Navigation = require("./lib/navigation")

const AntiTamper = require("./view/anti-tamper")
const SigningWidget = require("./view/signing-widget")

const {
  html: { copyContent }
} = require("@kisbox/helpers")

/* Definition */

class AppFull extends View {
  constructor (params) {
    super(`
<div class="CosmicLinkApp">
  <header onclick=%copyHeader>
    <h1>%location</h1><span>%query</span>
  </header>

  <img id="logo" src="icons/512x512.png" alt="">

  <main>
    %navigation
    <hr>
    %selectedTabView
  </main>

  <footer>
    <a id="registerSep7Handler" onclick=%registerSep7Handler
        hidden=%not:isSep7Supported>
      Register as web+stellar links handler (SEP-0007)
    </a>
  </footer>

  %antiTamper
</div>
`)
    this.selectedTabId = "sign"
    this.state = new AppState(params)
    this.$import(this.state, ["query"])
    this.$import(params, ["selectedTabId"])

    // Header
    if (location.origin === "null") {
      this.location = location.pathname
    } else {
      this.location = `${location.origin}${location.pathname}`
    }

    // Navigation
    this.navigation = new Navigation([
      {
        id: "sign",
        title: "Sign",
        view: new SigningWidget(this.state)
      },
      {
        id: "about",
        title: "About",
        view: html.grab("#about")
      }
    ])

    this.navigation.$link(this, ["selectedTabView", "selectedTabId"])
    if (!this.selectedTabView) {
      this.selectedTabId = "sign"
    }

    // SEP-0007
    this.isSep7Supported = sep7Utils.isWebHandlerSupported()

    // Robot anti-tamper
    this.antiTamper = new AntiTamper(params)
  }

  copyHeader () {
    copyContent(this.$ref(":scope > header"))
  }

  registerSep7Handler () {
    const currentPageUrl = location.href.split(/[?#]/, 1)[0]
    sep7Utils.registerWebHandler(currentPageUrl, "Cosmic.link")
  }
}

/* Computations */
const proto = AppFull.prototype

proto.$define("route", ["query", "selectedTabId"], function () {
  const tab = this.selectedTabId
  const query = tab === "sign" ? this.query || "" : ""
  const hash = tab === "sign" ? "" : `#${this.selectedTabId}`
  return `${query}${hash}`
})

/* Export */
module.exports = AppFull
