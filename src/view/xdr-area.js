"use strict"
/**
 * XdrArea
 **/
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const { html: copyContent } = require("@kisbox/helpers")

/* Definition */

class XdrArea extends View {
  constructor (params) {
    super(`
<textarea rows=3 %value %onclick %disabled %readonly %placeholder></textarea>
    `)

    this.$import(params, ["target"])
  }

  onclick () {
    if (this.readonly) {
      copyContent(this.domNode)
    }
  }
}

/* Computations */
const proto = XdrArea.prototype

proto.$define("disabled", ["target"], function () {
  return (
    !this.target
    || type(this.target) === "promise"
    || type(this.target) === "error"
  )
})

proto.$define("readonly", ["target"], function () {
  return !!this.target
})

proto.$define("placeholder", ["target"], function () {
  if (!this.target) {
    return "No transaction"
  } else if (type(this.target) === "promise") {
    return "Pending..."
  } else {
    return this.target
  }
})

proto.$define("value", ["target"], function () {
  if (this.disabled) {
    return ""
  } else {
    return this.target
  }
})

/* Export */
module.exports = XdrArea
