"use strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const { dom } = require("@kisbox/browser")
const state = require("./app.state")

/* Logic */

dom.$ingest()

if (state.contextIsWidget) {
  require("./app.widget")
} else {
  require("./app.interface")
}
