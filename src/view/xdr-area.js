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
<textarea rows=3 readonly %value %onclick %placeholder disabled=%not:xdr>
</textarea>
    `)

    this.$import(params, ["xdr"])
  }

  onclick () {
    copyContent(this.domNode)
  }
}

/* Computations */
const proto = XdrArea.prototype

proto.$customDefine("placeholder", ["xdr"], function () {
  if (!this.xdr) {
    return "No transaction"
  } else if (type(this.xdr) === "promise") {
    return "Pending..."
  } else {
    return this.xdr
  }
})

proto.$customDefine("value", ["xdr"], function () {
  if (type(this.xdr) === "string" || type(this.xdr) === "error") {
    return this.xdr
  } else {
    return ""
  }
})

/* Export */
module.exports = XdrArea
