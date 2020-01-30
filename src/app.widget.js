"use strict"
/**
 * Widget interface initialization.
 */
const html = require("@cosmic-plus/domutils/es5/html")
const load = require("@cosmic-plus/domutils/es5/load")

const authenticators = require("./data/authenticators")
const the = require("./app.state")

/* Functions */

async function initWidget () {
  const referrer = document.referrer.split("/", 3).join("/")
  const hash = location.hash
  const params = parseQuery(hash)

  // Strengthen Content-Security-Policy.
  const csp = html.grab("meta[http-equiv='Content-Security-Policy']")
  csp.content = csp.content.replace(
    "style-src *  ;",
    `
    style-src 'self'
      'sha256-UpnKee22eAiBMULu1lvaV7de7xOzTjdN7K/WZDBil10='
      ${referrer};
  `
  )

  // Interface control.
  if (params.handler) {
    const handler = authenticators.byId[params.handler]
    if (handler) {
      the.authenticator = handler
    } else {
      console.error(`Unknown handler: ${params.handler}`)
    }
  }
  if (params.qrcode) {
    the.qrCode = params.qrcode !== "false"
  }
  // eslint-disable-next-line no-console
  console.log("Valid handlers: ", Object.keys(authenticators.byId))

  // Style control (asynchronous).
  let loading = []
  if (params.css) {
    loading.push(load.css(`${referrer}/${params.css}`).catch(console.error))
  } else {
    loading.push(load.css("widget.css").catch(console.error))
    if (params["css+"]) {
      loading.push(
        load.css(`${referrer}/${params["css+"]}`).catch(console.error)
      )
    }
  }
  Promise.all(loading).then(() => html.show(document.body))

  // Interface initialization.
  require("./app.interface")

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
