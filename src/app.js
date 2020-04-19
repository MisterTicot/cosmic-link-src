"use strict"
/**
 * CosmicLink application.
 */

/* Definiton */
class CosmicLinkApp {
  constructor (params) {
    if (params.mode === "embed") {
      return new CosmicLinkApp.Embed(params)
    } else {
      return new CosmicLinkApp.Full(params)
    }
  }
}

/* Exports */
CosmicLinkApp.Embed = require("./app.embed")
CosmicLinkApp.Full = require("./app.full")
module.exports = CosmicLinkApp
