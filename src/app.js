"use strict"
/**
 * Cosmic.Link Graphical User Interface
 */
const the = require("./shared")

if (the.contextIsWidget) {
  require("./app-widget")
} else {
  require("./app-interface")
}
