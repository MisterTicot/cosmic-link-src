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

    this.$import(params, ["authenticator", "resolved", "action", "result"])
    this.$link(params, ["automaticRedirection"])
  }

  onclick () {
    this.action()
  }
}

/* Computations */
const proto = RedirectionButton.prototype

proto.$customDefine(
  "value",
  ["authenticator", "resolved", "result"],
  function () {
    if (type(this.signed) === "promise") {
      return "Signing..."
    } else if (type(this.result) === "promise") {
      return "Sending..."
    } else if (this.result) {
      return "Done"
    } else if (type(this.resolved) === "error") {
      return this.resolved
    } else if (type(this.resolved) === "promise") {
      return "..."
    } else if (!this.resolved) {
      return "No transaction"
    } else if (this.authenticator.signRequest) {
      return `Sign with ${this.authenticator.name}`
    } else if (this.authenticator.requestToUri) {
      return `Go to ${this.authenticator.name}`
    }
  }
)

proto.$customDefine("disabled", ["action", "result"], function () {
  return (
    !this.action
    || type(this.action) === "promise"
    || type(this.action) === "error"
    || this.result
  )
})

/* Export */
module.exports = RedirectionButton
