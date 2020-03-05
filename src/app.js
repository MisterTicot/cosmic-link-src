"use strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const { dom } = require("@kisbox/browser")
const the = require("./app.state")

/* Logic */

dom.$ingest()

if (the.contextIsWidget) {
  require("./app.widget")
} else {
  require("./app.interface")
}
