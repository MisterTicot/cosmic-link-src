"use strict"
/**
 * App interface initialization.
 */
const cosmicLib = require("cosmic-lib")

const { dom, html } = require("@kisbox/browser")
const Page = require("./lib/page")

const the = require("./app.state")
const { copyContent } = require("./helpers")

/* Functions */

function initInterface () {
  // Signing interface
  const signingUI = require("./view/signing-ui")
  const signingPage = Page.add("Sign", dom.sign)
  signingPage.onSelect = function () {
    history.replaceState("", null, location.pathname + location.search)
    signingUI.refresh()
  }
  signingUI.init()

  // Non-widget components
  if (!the.contextIsWidget) {
    initNonWidgetInterface()
  }

  // Default page
  if (Page.current === signingPage) signingPage.onSelect()
  else if (!Page.current) Page.select("#sign")
}

function initNonWidgetInterface () {
  // Header
  if (location.origin === "null") {
    dom.websiteUrl.textContent = location.pathname
  } else {
    dom.websiteUrl.textContent = location.origin + location.pathname
  }
  dom.query.textContent = location.search

  const header = html.grab("header")
  header.onclick = () => copyContent(header)

  // About page
  Page.add("About", dom.about)

  // SEP-0007
  if (cosmicLib.sep7Utils.isWebHandlerSupported()) {
    dom.registerSep7Handler.onclick = () => {
      cosmicLib.sep7Utils.registerWebHandler(
        location.href.split(/[?#]/, 1)[0],
        "Cosmic.link"
      )
    }
  } else {
    // (hack) Keep the collapsed bottom margin.
    dom.registerSep7Handler.textContent = ""
  }
  html.show(dom.registerSep7Handler)

  // Robot tamper
  require("./view/tamper")
}

/* Init */
initInterface()
