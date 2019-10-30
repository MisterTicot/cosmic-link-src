"use strict"
/**
 * Widget interface initialization.
 */
const the = require("./shared")

/* Functions */

async function initWidget () {
  const hash = location.hash
  const params = parseQuery(hash)

  // Interface control.
  if (params.qrcode) {
    the.qrCode = params.qrcode !== "false"
  }

  // Interface initialization.
  require("./app-interface")

  // Consistent reload (app-interface mess with location.hash)
  location.hash = hash
}

/* Helpers */
function parseQuery (query) {
  const params = {}

  query
    .substr(1)
    .split("&")
    .forEach(keyval => {
      const key = keyval.split("=", 1)[0]
      const val = keyval.substr(key.length + 1)
      params[key] = decodeURIComponent(val)
    })

  return params
}

/* Initialization */
initWidget()
