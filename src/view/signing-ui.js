"use strict"
const main = exports

const cosmicLib = require("cosmic-lib")
const CosmicLink = cosmicLib.CosmicLink

const { dom, html } = require("@kisbox/browser")
const { environment } = require("@kisbox/helpers")

const TxResultView = require("./tx-result-view")

const authenticators = require("../data/authenticators")
const the = require("../app.state")

const {
  enableButton,
  disableButton,
  readWriteBox,
  readOnlyBox,
  disableBox,
  display,
  showIf
} = require("../helpers")

/* UI Components */
const qrCodeUI = require("./qr-code-ui")
const networkUI = require("./network-ui")

// Run once page is fully loaded
main.init = function () {
  // Step 1: Transaction
  if (!the.query) html.rewrite(dom.cosmiclink_description, "No transaction")

  // Step 2: Authenticator
  authenticators.nodes.forEach(entry => html.append(dom.authenticators, entry))
  dom.authenticators.value = the.authenticator.name

  // Step 3: Signing
  if (the.redirect) dom.redirectionCheckbox.checked = true

  // CosmicLib network setup
  for (let key in localStorage) {
    if (key.substr(0, 8) === "network:") {
      const id = key.substr(8)
      const passphrase = cosmicLib.resolve.networkPassphrase(id)
      cosmicLib.config.setupNetwork(id, localStorage[key], passphrase)
    }
  }
}

main.refresh = async function () {
  if (the.query) the.cosmicLink = new CosmicLink(the.query)
  else the.cosmicLink = { tdesc: {} }
  authenticatorUI.init()
  redirectionUI.init()
  if (the.cosmicLink.query) transactionUI.refresh()
}

the.$on(["network", "horizon"], () => main.refresh())

/*******************************************************************************
 * Step 1: Transaction UI
 */

const transactionUI = {}

transactionUI.refresh = function () {
  if (the.authenticator.needSource && !the.accountId) {
    if (!the.authenticator.getAccountId) {
      redirectionUI.error("Please set a source account")
    }
    return
  }
  if (the.authenticator.needNetwork) {
    if (!the.network || !the.horizon) {
      redirectionUI.error("Please fill custom network fields")
      return
    }
  }

  cosmicLib.config.source = the.accountId
  cosmicLib.config.network = the.network

  const saveTransaction = the.transaction = the.authenticator.handle(
    the.cosmicLink
  )

  the.transaction
    .then(function (value) {
      if (the.transaction === saveTransaction) redirectionUI.refresh(value)
    })
    .catch(function () {
      if (the.transaction === saveTransaction)
        redirectionUI.error(the.cosmicLink.status)
    })
}

/*******************************************************************************
 * Step 2: Authenticator UI
 */

const authenticatorUI = {}

authenticatorUI.init = function () {
  display(dom.accountMsgbox, "")

  if (the.authenticator.needSource) accountUI.init()
  else accountUI.disable()

  if (the.authenticator.refresh) the.authenticator.refresh(main.refresh)
}

/**
 * AccountID box UI
 */
const accountUI = {}

accountUI.disable = function () {
  html.hide(dom.accountDiv)
  the.accountId = undefined
}

accountUI.init = async function () {
  html.show(dom.accountDiv)

  if (!the.authenticator.getAccountId) {
    if (the.cosmicLink.tdesc.source) {
      if (the.cosmicLink.tdesc.source.error) {
        disableBox(dom.accountIdBox, the.cosmicLink.tdesc.source.error.message)
      } else {
        the.accountId = true
        readOnlyBox(dom.accountIdBox, the.cosmicLink.tdesc.source)
      }
    } else {
      readWriteBox(
        dom.accountIdBox,
        "Federated Address or Public Key",
        the.accountId
      )
    }
  } else {
    the.accountId = undefined
    disableBox(dom.accountIdBox, "Connecting...")

    const authenticator = the.authenticator
    try {
      const accountId = await the.authenticator.getAccountId()
      if (the.authenticator !== authenticator) return
      the.accountId = accountId
      readOnlyBox(dom.accountIdBox, accountId)
      transactionUI.refresh()
    } catch (error) {
      if (the.authenticator !== authenticator) return
      dom.accountIdBox.placeholder = "Error"
      display(dom.accountMsgbox, "error", error.message + ".")
      console.error(error)
    }
  }
}

/**
 * HTML Elements Events
 */

dom.authenticators.onchange = function () {
  if (the.authenticator && the.authenticator.onExit) the.authenticator.onExit()
  the.redirect = false
  dom.redirectionCheckbox.checked = false
  the.authenticatorName = dom.authenticators.value
  main.refresh()
}

dom.accountIdBox.onchange = function () {
  the.accountId = the.accountId = dom.accountIdBox.value
  main.refresh()
}

/*******************************************************************************
 * Step 3: Signing/Redirection UI
 */

const redirectionUI = {}

redirectionUI.init = function () {
  redirectionUI.display("")
  showIf(the.authenticator.redirection, dom.redirectionForm)
  showIf(the.authenticator.textarea, dom.textareaForm)
  showIf(the.query && the.authenticator.qrCode, dom.qrForm)

  if (!the.query) {
    if (the.authenticator.url) {
      const onclick = () => location.href = the.authenticator.url
      enableButton(dom.redirectionButton, the.authenticator.buttonText, onclick)
    } else {
      redirectionUI.error("No transaction")
    }
  } else {
    if (the.authenticator.redirection) disableButton(dom.redirectionButton, "…")
    if (the.authenticator.textarea) disableBox(dom.xdrBox, "Computing...")
    if (the.authenticator.qrCode) qrCodeUI.disabled = false
  }
}

redirectionUI.refresh = function (value) {
  if (the.authenticator.redirection) {
    const onclick = () => redirectionUI.click(value)
    enableButton(dom.redirectionButton, the.authenticator.buttonText, onclick)
  }

  if (the.redirect && !the.contextIsWidget) {
    dom.redirectionButton.onclick()
  }

  if (the.authenticator.textarea) readOnlyBox(dom.xdrBox, value)
  if (the.authenticator.qrCode) qrCodeUI.value = value
}

redirectionUI.error = function (error) {
  disableButton(dom.redirectionButton, error)
  disableBox(dom.xdrBox, error)
  the.error = error
}

redirectionUI.click = async function (action) {
  if (typeof action === "string") {
    if (
      the.contextIsWidget
      || environment.isEmbedded && the.authenticator.target === "new"
    ) {
      open(action, "_blank")
      window.parent.postMessage("close", "*")
    } else if (
      environment.isEmbedded
      && the.authenticator.target === "external"
    ) {
      open(action)
      window.parent.postMessage("close", "*")
    } else {
      location.replace(action)
    }
  } else if (typeof action === "function") {
    display(dom.redirectionMsgbox, "info", "Waiting for confirmation...")
    dom.redirectionButton.disabled = true

    try {
      const transaction = await action()
      await redirectionUI.sendTransaction(transaction)
    } catch (error) {
      console.error(error.response || error)
      redirectionUI.display("error", error.message.replace(/\.$/, ""))
      dom.redirectionButton.disabled = false
    }
  }
}

redirectionUI.sendTransaction = async function () {
  redirectionUI.display("info", "Sending to the network...")
  history.replaceState({}, "", the.cosmicLink.query)
  networkUI.readonly = true

  // Non-widget interface
  if (dom.query) {
    dom.query.textContent = the.cosmicLink.query
  }

  window.scrollTo(0, document.body.scrollHeight)
  const result = await TxResultView.forCosmicLink(the.cosmicLink)
  redirectionUI.display("", result)

  if (result.validated && environment.isEmbedded) {
    parent.postMessage("close", "*")
  }
  if (document.referrer) {
    enableButton(dom.redirectionButton, "Close", () => history.back())
  } else {
    dom.redirectionButton.value = "Done"
  }
}

redirectionUI.display = function (type, message) {
  display(dom.redirectionMsgbox, type, message)
}

/**
 * HTML Elements Events
 */

dom.redirectionButton.onclick = redirectionUI.click

dom.redirectionCheckbox.onchange = function () {
  the.redirect = !the.redirect
}
