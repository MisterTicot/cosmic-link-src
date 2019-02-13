"use_strict"

const ServiceWorker = require("@cosmic-plus/jsutils/service-worker")
const pkg = require("../package.json")

new ServiceWorker(pkg.name, pkg.version, "verbose")
  .fromCache([
    "/",
    "app.js",
    "index.css",
    "index.html",
    "index.js",
    "ledger.js",
    "stellar-sdk.js",
    "icons/512x512.png",
    "vendors~app.js",
    "vendors~ledger.js"
  ])
  .precache()
  .register()
