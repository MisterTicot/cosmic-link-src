"use_strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const cosmicLib = require("cosmic-lib")
const dom = require("@cosmic-plus/domutils/es5/dom")
const html = require("@cosmic-plus/domutils/es5/html")
const Page = require("@cosmic-plus/domutils/es5/page")

const the = require("./shared")
const { copyContent } = require("./helpers")

if (!the.contextIsWidget) {
  // Header
  if (location.origin === "null") dom.websiteUrl.textContent = location.pathname
  else dom.websiteUrl.textContent = location.origin + location.pathname
  dom.query.textContent = location.search
  dom.header.onclick = () => copyContent(dom.header)

  // Robot tamper
  require("./tamper")

  // SEP-0007
  if (cosmicLib.sep7Utils.isWebHandlerSupported()) {
    html.show(dom.registerSep7Handler)
    dom.registerSep7Handler.onclick = () => {
      cosmicLib.sep7Utils.registerWebHandler(
        location.href.split(/[?#]/, 1)[0],
        "Cosmic.link"
      )
    }
  }
}

// Signing interface
const signingUI = require("./signing-ui")
const signingPage = Page.add("Sign", dom.sign)
signingPage.onSelect = function () {
  history.replaceState("", null, location.pathname + location.search)
  signingUI.refresh()
}

signingUI.init()

// About page
if (!the.contextIsWidget) Page.add("Help", dom.help)

// Default page
if (Page.current === signingPage) signingPage.onSelect()
else if (!Page.current) Page.select("#sign")
