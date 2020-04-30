"use strict"
/**
 * Redirection Button
 * */
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

/* Definition */

class RedirectionButton extends View {
  constructor (params) {
    super(`
<div class="RedirectionButton">
  <input type="button" %value %onclick %disabled>
  <input type="checkbox" checked=%automaticRedirection
    $label="Automatic redirection">
</div>
    `)

    this.$import(params, ["authenticator", "sign", "result"])
    this.$link(params, ["automaticRedirection"])
  }

  onclick () {
    this.sign()
  }
}

/* Computations */
const proto = RedirectionButton.prototype

proto.$customDefine("buttonText", ["authenticator", "sign"], function () {
  switch (type(this.sign)) {
    case "error": return this.sign
    case "promise": return "..."
  }
  if (this.sign) {
    return this.authenticator.buttonText
  } else {
    return "No transaction"
  }
})

proto.$customDefine("value", ["buttonText", "result"], function () {
  if (type(this.result) === "promise") {
    return "Signing..."
  } else if (this.result) {
    return "Done"
  } else {
    return this.buttonText
  }
})

proto.$customDefine("disabled", ["sign", "result"], function () {
  return (
    !this.sign
    || type(this.sign) === "promise"
    || type(this.sign) === "error"
    || this.result
  )
})

/* Export */
module.exports = RedirectionButton
