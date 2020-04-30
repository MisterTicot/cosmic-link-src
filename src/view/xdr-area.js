"use strict"
/**
 * XdrArea
 **/
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const {
  html: { copyContent }
} = require("@kisbox/helpers")

/* Definition */

class XdrArea extends View {
  constructor (params) {
    super(`
<textarea rows=3 readonly %value %onclick %placeholder disabled=%not:target>
</textarea>
    `)

    this.$import(params, ["target"])
  }

  onclick () {
    copyContent(this.domNode)
  }
}

/* Computations */
const proto = XdrArea.prototype

proto.$customDefine("placeholder", ["target"], function () {
  if (!this.target) {
    return "No transaction"
  } else if (type(this.target) === "promise") {
    return "Pending..."
  } else {
    return this.target
  }
})

proto.$customDefine("value", ["target"], function () {
  if (type(this.target) === "string" || type(this.target) === "error") {
    return this.target
  } else {
    return ""
  }
})

/* Export */
module.exports = XdrArea
