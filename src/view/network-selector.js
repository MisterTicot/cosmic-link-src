"use strict"
/**
 * Network Selector
 * */
const cosmicLib = require("cosmic-lib")
const { View } = require("@kisbox/browser")

const {
  constructor: { shortcuts }
} = require("@kisbox/helpers")

/* Definition */

class NetworkSelector extends View {
  constructor (params = {}) {
    super(`
<section class="NetworkSelector">

  <div>
    <input type="radio" $group="networkSelector" value="public" %disabled
      $label="Public">
    <input type="radio" $group="networkSelector" value="test" %disabled
      $label="Test">
    <input type="radio" $group="networkSelector" value="custom" %disabled
      $label="Custom">
  </div>

  <div hidden=%not:isCustom>
    <input type="text" value=%network %disabled
      placeholder="Network Passphrase or Name">
    <input type="text" value=%horizon
      placeholder="Horizon URL">
  </div>
  
</section>
    `)

    this.networkSelector = "public"
    this.$import(params, [
      "networkSelector",
      "network",
      "horizon",
      "disabled",
      "cosmicLink"
    ])
  }
}

const { proto } = shortcuts(NetworkSelector)

proto.$define("isCustom", ["networkSelector"], function () {
  return this.networkSelector === "custom"
})

proto.$on("cosmicLink", function () {
  this.disabled = false
  if (!this.cosmicLink) return

  const tdesc = this.cosmicLink.tdesc
  if (tdesc.network) {
    this.disabled = true
    if (tdesc.network === "public" || tdesc.network === "test") {
      this.networkSelector = tdesc.network
    } else {
      this.networkSelector = "custom"
      this.network = tdesc.network
    }
  }
})

proto.$on("networkSelector", function () {
  if (!this.isCustom) {
    this.network = this.networkSelector
  }
})

proto.$on("network", function () {
  // Turns passphrase into network name (e.g: "public")
  const name = cosmicLib.resolve.networkName(this.network)
  if (this.network !== name) {
    this.network = name
    return
  }

  this.horizon =
    cosmicLib.resolve.horizon(this.network)
    || this.cosmicLink && this.cosmicLink.tdesc.horizon
    || ""
})

/* Export */
module.exports = NetworkSelector
