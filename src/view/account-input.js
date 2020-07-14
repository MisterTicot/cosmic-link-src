"use strict"
/**
 * Account Input Box
 * */

const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const { copyContent } = require("@kisbox/helpers")

/* Definition */

class AccountInput extends View {
  constructor (params) {
    super(`
<div class="AccountInput">
  <input type="text" value=%user autocomplete="stellar-user"
    placeholder="Username"
    hidden=%not:federation>
  <input type="text" value=%filter:accountId %onclick %readonly %placeholder
    disabled=%notAvailable:accountId autocomplete="stellar-address"
    hidden=%federation >
</div>
      `)

    /* Defaults */
    this.accountId = ""

    /* Imports */
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

proto.$on(["user", "federation"], function () {
  if (!this.federation) return
  this.accountId = this.user ? `${this.user}*${this.federation}` : null
})

proto.$on(["federation", "accountId"], function () {
  if (!this.federation || !this.accountId) {
    this.user = null
    return
  }

  const federationPattern = `\\*${this.federation}$`
  const federationRegexp = new RegExp(federationPattern)

  if (this.accountId.match(federationRegexp)) {
    this.user = this.accountId.replace(federationRegexp, "")
  } else {
    this.accountId = null
    this.user = null
  }
})

proto.$define("federation", ["authenticator"], function () {
  return this.authenticator.federation
})

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
  }
}

/* Export */
module.exports = AccountInput
