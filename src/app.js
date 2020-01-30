"use strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const the = require("./app.state")

if (the.contextIsWidget) {
  require("./app.widget")
} else {
  require("./app.interface")
}
