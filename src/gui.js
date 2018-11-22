"use_strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const dom = require("@cosmic-plus/jsutils/dom")
const cosmicLib = require("cosmic-lib")

const { copyContent, switchPage } = require("./helpers")

// cosmicLib stylesheet
cosmicLib.load.css("cosmic-lib.css")

// Header
if (location.origin === "null") dom.websiteUrl.textContent = location.pathname
else dom.websiteUrl.textContent = location.origin + location.pathname
dom.query.textContent = location.search
dom.header.onclick = () => copyContent(dom.header)

// About page browsing
dom.aboutLink.onclick = () => switchPage(dom.sign, dom.explanation)
dom.backButton.onclick = () => switchPage(dom.explanation, dom.sign)

// Robot tamper
require("./tamper")

// signing interface
require("./signing-ui").init()
