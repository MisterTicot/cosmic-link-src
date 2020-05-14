"use strict"
/**
 * Account Input Box
 * */

const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const {
  html: { copyContent }
} = require("@kisbox/helpers")

/* Definition */

class AccountInput extends View {
  constructor (params) {
    super(`
<input type="text" value=%filter:accountId %onclick %readonly %placeholder
  disabled=%notAvailable:accountId autocomplete="stellar-address">
      `)

    this.accountId = ""
    this.$import(params, ["cosmicLink", "authenticator"])
    this.$link(params, ["accountId"])
  }

  onclick () {
    if (this.readonly) {
      copyContent(this.domNode)
    }
  }
}

/* Computations */
const proto = AccountInput.prototype

proto.$define("readonly", ["cosmicLink", "authenticator"], function () {
  return !!(
    this.cosmicLink && this.cosmicLink.tdesc.source
    || this.authenticator.getAddress
  )
})

proto.$customDefine("placeholder", ["accountId"], function () {
  switch (type(this.accountId)) {
  case "promise":
    return "Connecting..."
  case "error":
    return this.accountId
  default:
    return "Federated Address or Public Key"
  }
})

/* Helpers */
const helpers = AccountInput.helpers

helpers.filter = function (accountId) {
  if (type(accountId) === "string") {
    return accountId
  } else {
    return ""
  }
}

/* Export */
module.exports = AccountInput
