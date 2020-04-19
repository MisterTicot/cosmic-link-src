"use strict"

const ServiceWorker = require("@kisbox/service-worker")
const pkg = require("../package.json")

new ServiceWorker(pkg.name, pkg.version, "verbose")
  .fromCache([
    // Application
    "app.js",
    "index.css",
    "index.html",
    "index.js",
    "ledger.js",
    "stellar-sdk.js",
    "vendors~app.js",
    "vendors~ledger.js",
    "vendors~trezor.js",

    // Embed
    "embed",
    "embed.css",
    "embed.html",

    // Fonts
    "fonts/rubik.woff",
    "fonts/rubik.woff2",
    "fonts/cousine.woff",
    "fonts/cousine.woff2",

    // Vendor configuration
    "browserconfig.xml",
    "manifest.json",

    // Icons
    "favicon.ico",
    "icons/16x16.png",
    "icons/32x32.png",
    "icons/192x192.png",
    "icons/512x512.png",
    "icons/apple-touch.png",
    "icons/mstile.png",
    "icons/safari.svg"
  ])
  .precache()
  .register()
