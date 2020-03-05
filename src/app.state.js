"use strict"
/**
 * Application State (extends app.config.js)
 */
const authenticators = require("./data/authenticators")
const config = require("./app.config")

/* Definition */

const state = config

const pageName = location.pathname.replace(/.*\//, "")
state.contextIsWidget = !!pageName.match(/^widget(.html)?$/)

state.query = location.search.length > 1 && location.search

state.$define("authenticator", ["authenticatorName"], the => {
  return authenticators[the.authenticatorName]
})
state.$push("authenticator", state, "authenticatorName", auth => auth.name)

if (state.contextIsWidget) {
  // Lock redirect.
  state.$off("contextIsWidget")
  state.redirect = false
}

/* Exports */
module.exports = state

// eslint-disable-next-line no-console
console.log("State", state, "(partly persistent, edit at your own risk)")
