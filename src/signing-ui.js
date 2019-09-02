"use_strict"
const main = exports

const cosmicLib = require("cosmic-lib")
const CosmicLink = cosmicLib.CosmicLink
const dom = require("@cosmic-plus/domutils/es5/dom")
const env = require("@cosmic-plus/jsutils/es5/env")
const html = require("@cosmic-plus/domutils/es5/html")
const QrCode = require("qrcode")
const { timeout } = require("@cosmic-plus/jsutils/es5/misc")

const authenticators = require("./authenticators")
const the = require("./shared")

const {
  enableButton,
  disableButton,
  readWriteBox,
  readOnlyBox,
  disableBox,
  display,
  showIf
} = require("./helpers")

// Run once page is fully loaded
main.init = function () {
  // Step 1: Transaction
  if (!the.query) html.rewrite(dom.cosmiclink_description, "No transaction")

  // Step 2: Authenticator
  authenticators.nodes.forEach(entry => html.append(dom.authenticators, entry))
  dom.authenticators.value = the.authenticator.name

  // Step 3: Signing
  if (the.redirect) dom.redirectionCheckbox.checked = true
  if (the.qrCode) qrCodeUI.enable()

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
  if (the.cosmicLink) transactionUI.refresh()
}

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
    if (dom.customNetwork.checked && (!the.horizon || !the.network)) {
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
  the.authenticator = authenticators[dom.authenticators.value]
  localStorage.authenticator = the.authenticator.name

  if (the.authenticator.needSource) accountUI.init()
  else accountUI.disable()
  if (the.authenticator.needNetwork) networkUI.init()
  else networkUI.disable()

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
      the.accountId = localStorage.accountId
      readWriteBox(
        dom.accountIdBox,
        "Your Account Address or ID",
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
    }
  }
}

/**
 * Network selection UI
 */
const networkUI = {}

networkUI.disable = function () {
  html.hide(dom.networkDiv)
  the.network = "public"
  the.horizon = undefined
}

networkUI.init = function () {
  html.show(dom.networkDiv)
  html.hide(dom.customNetworkSetup)
  the.network = the.cosmicLink.tdesc.network || localStorage.networkSelector
  the.horizon = undefined

  switch (the.network) {
  case undefined:
  case "public":
    dom.publicNetwork.checked = true
    dom.networkSelector.scrollLeft = 0
    break
  case "test":
    dom.testNetwork.checked = true
    break
  default:
    if (dom.networkSelector.onscroll) dom.networkSelector.onscroll()
    // Doesn't works when called synchronously.
    timeout(1).then(() => dom.networkSelector.scrollLeft = 999)
    dom.customNetwork.checked = true

    html.show(dom.customNetworkSetup)
    if (!the.network) the.network = localStorage.customPassphrase
    the.horizon =
        cosmicLib.resolve.horizon(the.network || "")
        || the.cosmicLink.tdesc.horizon
    dom.customPassphrase.value = the.network || ""
    dom.customHorizon.value = the.horizon || ""
  }

  if (the.cosmicLink.tdesc.network) networkUI.lock()
}

networkUI.lock = function () {
  readOnlyBox(dom.customPassphrase)
  dom.publicNetwork.disabled = true
  dom.testNetwork.disabled = true
  dom.customNetwork.disabled = true
}

networkUI.switch = function (selector) {
  localStorage.networkSelector = selector
  main.refresh()
}

/**
 * HTML Elements Events
 */

dom.authenticators.onchange = function () {
  if (the.authenticator && the.authenticator.onExit) the.authenticator.onExit()
  the.redirect = localStorage.redirect = false
  dom.redirectionCheckbox.checked = false
  main.refresh()
}

dom.accountIdBox.onchange = function () {
  the.accountId = localStorage.accountId = dom.accountIdBox.value
  main.refresh()
}

dom.networkSelector.onscroll = function () {
  dom.networkSelector.style.textOverflow = "initial"
  dom.networkSelector.onscroll = undefined
}

dom.publicNetwork.onchange = () => networkUI.switch("public")
dom.testNetwork.onchange = () => networkUI.switch("test")
dom.customNetwork.onchange = () => networkUI.switch("")

dom.customPassphrase.onchange = function () {
  const networkName = cosmicLib.resolve.networkName(dom.customPassphrase.value)
  localStorage.customPassphrase = networkName
  networkUI.switch("")
}

dom.customHorizon.onchange = function () {
  the.horizon = dom.customHorizon.value
  if (the.horizon && the.horizon.substr(0, 4) !== "http") {
    the.horizon = "https://" + the.horizon
  }
  if (the.network && the.horizon) {
    const passphrase = cosmicLib.resolve.networkPassphrase(the.network)
    cosmicLib.config.setupNetwork(the.network, the.horizon, passphrase)
    localStorage["network:" + passphrase] = the.horizon
  }
  if (the.network) main.refresh()
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
    if (the.authenticator.qrCode) qrCodeUI.loadingAnim()
  }
}

redirectionUI.refresh = function (value) {
  if (the.authenticator.redirection) {
    const onclick = () => redirectionUI.click(value)
    enableButton(dom.redirectionButton, the.authenticator.buttonText, onclick)
  }

  if (the.redirect) dom.redirectionButton.onclick()

  if (the.authenticator.textarea) readOnlyBox(dom.xdrBox, value)
  if (the.authenticator.qrCode) qrCodeUI.refresh(value)
}

redirectionUI.error = function (error) {
  disableButton(dom.redirectionButton, error)
  disableBox(dom.xdrBox, error)
  html.clear(dom.qrCode)
}

redirectionUI.click = async function (value) {
  if (typeof value === "string") {
    if (env.isEmbedded && the.authenticator.target === "new") {
      open(value, "_blank")
      window.parent.postMessage("close", "*")
    } else if (env.isEmbedded && the.authenticator.target === "external") {
      open(value)
      window.parent.postMessage("close", "*")
    }
  } else if (typeof value === "function") {
    display(dom.redirectionMsgbox, "info", "Waiting for confirmation...")
    dom.redirectionButton.disabled = true

    try {
      const transaction = await value()
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
  dom.query.textContent = the.cosmicLink.query
  networkUI.lock()

  await the.cosmicLink.send()
  redirectionUI.display("info", "Transaction validated")
  if (env.isEmbedded) parent.postMessage("close", "*")
  if (document.referrer) {
    enableButton(dom.redirectionButton, "Close", () => history.back())
  } else {
    dom.redirectionButton.value = "Done"
  }
}

redirectionUI.display = function (type, message) {
  display(dom.redirectionMsgbox, type, message)
}

const qrCodeUI = {}

qrCodeUI.loadingAnim = function () {
  html.rewrite(dom.qrCode, html.create("canvas", ".cosmiclib_loadingAnim"))
}

qrCodeUI.refresh = function (value) {
  if (!the.authenticator.qrCode || !value) return

  const canvas = html.create("canvas")
  QrCode.toCanvas(canvas, value, { margin: 0, scale: 4 })
  canvas.title = value
  html.rewrite(dom.qrCode, canvas)
}

qrCodeUI.switch = function () {
  the.qrCode = localStorage.QR = !the.qrCode
  if (the.qrCode) qrCodeUI.enable()
  else qrCodeUI.disable()
}

qrCodeUI.enable = function () {
  dom.qrButton.className = "enabled"
  html.show(dom.qrCode)
}

qrCodeUI.disable = function () {
  dom.qrButton.className = undefined
  html.hide(dom.qrCode)
}

/**
 * HTML Elements Events
 */

dom.redirectionButton.onclick = redirectionUI.click
dom.qrButton.onclick = qrCodeUI.switch

dom.redirectionCheckbox.onchange = function () {
  the.redirect = localStorage.redirect = !the.redirect
}
