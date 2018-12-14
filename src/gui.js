"use_strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const dom = require("@cosmic-plus/jsutils/dom")
const cosmicLib = require("cosmic-lib")
const Page = require("@cosmic-plus/jsutils/page")

const { copyContent } = require("./helpers")

// cosmicLib stylesheet
cosmicLib.load.styles("cosmic-lib.css")

// Header
if (location.origin === "null") dom.websiteUrl.textContent = location.pathname
else dom.websiteUrl.textContent = location.origin + location.pathname
dom.query.textContent = location.search
dom.header.onclick = () => copyContent(dom.header)

// Robot tamper
require("./tamper")

// Signing interface
const signingUI = require("./signing-ui")
const signingPage = Page.add("Sign", dom.sign)
signingPage.onSelect = function () {
  history.replaceState("", null, location.pathname + location.search)
  signingUI.refresh()
}

signingUI.init()

// About page
Page.add("Help", dom.help)

// Default page
if (Page.current === signingPage) signingPage.onSelect()
else if (!Page.current) Page.select("#sign")
