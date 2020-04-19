"use strict"
/**
 * Network Selector
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class NetworkSelector extends View {
  constructor (params) {
    super(`
<div class="NetworkSelector">

  <div>
    <input type="radio" $group="networkSelector" value="public"
      disabled=%lockNetwork $label="Public">
    <input type="radio" $group="networkSelector" value="test"
      disabled=%lockNetwork $label="Test">
    <input type="radio" $group="networkSelector" value="custom"
      disabled=%lockNetwork $label="Custom">
  </div>

  <div hidden=%not:isCustom>
    <input type="text" value=%network disabled=%lockNetwork
      placeholder="Network Passphrase or Name">
    <input type="text" value=%horizon
      placeholder="Horizon URL">
  </div>
  
</div>
    `)

    this.$import(params, ["lockNetwork"])
    this.$link(params, ["network", "horizon"])
  }
}

/* Computations */
const proto = NetworkSelector.prototype

proto.$define("networkSelector", ["network"], function () {
  if (this.network === "public" || this.network === "test") {
    return this.network
  } else {
    return "custom"
  }
})

proto.$define("isCustom", ["networkSelector"], function () {
  return this.networkSelector === "custom"
})

/* Events */
proto.$on("networkSelector", function () {
  if (!this.isCustom) {
    this.network = this.networkSelector
  }
})

/* Export */
module.exports = NetworkSelector
