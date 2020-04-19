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
<input type="text" value=%filter:accountId %onclick %readonly %disabled
  %placeholder autocomplete="stellar-address">
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

proto.$define("disabled", ["cosmicLink", "authenticator"], function () {
  return type(this.accountId) === "promise" || type(this.accountId) === "error"
})

proto.$define("readonly", ["cosmicLink", "authenticator"], function () {
  return !!(
    this.cosmicLink && this.cosmicLink.tdesc.source
    || this.authenticator.getAccountId
  )
})

proto.$define("placeholder", ["accountId"], function () {
  if (type(this.accountId) === "promise") {
    return "Connecting..."
  } else if (type(this.accountId) === "error") {
    return this.accountId
  } else {
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
