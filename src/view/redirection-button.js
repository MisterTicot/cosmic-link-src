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
  <input type="button" hidden=%not:cosmicLink value=%buttonText
    onclick=%linkAction disabled=%disabled>
  <input type="button" hidden=%has:cosmicLink value=%noLinkButtonText
    onclick=%noLinkAction disabled=%noLinkDisabled>
  <input type="checkbox" checked=%automaticRedirection
    $label="Automatic redirection">
</div>
    `)

    this.$import(params, [
      "authenticator",
      "resolved",
      "action",
      "result",
      "cosmicLink"
    ])
    this.$link(params, ["automaticRedirection"])
  }

  linkAction () {
    window.scrollTo(0, window.innerHeight)
    this.action()
  }

  noLinkAction () {
    open(this.authenticator.url)
  }
}

/* Computations */
const proto = RedirectionButton.prototype

proto.$define("noLinkButtonText", ["authenticator"], function () {
  if (this.authenticator.url) {
    const shortName = this.authenticator.name.replace(/ \(.*/, "")
    return `Go to ${shortName}`
  } else {
    return "No transaction"
  }
})

proto.$define("noLinkDisabled", ["authenticator"], function () {
  return !this.authenticator.url
})

proto.$customDefine(
  "buttonText",
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
    } else {
      return `Sign with ${this.authenticator.name}`
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
