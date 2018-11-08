const cosmicLib = require("cosmic-lib")
const CosmicLink = cosmicLib.CosmicLink
const dom = require("@cosmic-plus/jsutils/dom")
const html = require("@cosmic-plus/jsutils/html")
const QrCode = require("qrcode")

const authenticators = require("./authenticators")

// Service worker
if (navigator.serviceWorker) navigator.serviceWorker.register("worker.js")

// Global variables
const the = {}

the.query = location.search.length > 1 && location.search
the.cosmicLink = undefined
the.transaction = undefined

the.authenticator = authenticators[localStorage.authenticator || "Stellar Authenticator"]
the.accountId = undefined
the.network = localStorage.network

the.redirect = localStorage.redirect === "true"
the.qrCode = localStorage.QR === "true"


// Run once page is fully loaded
exports.init = function () {
  // Header
  if (location.origin === "null") dom.websiteUrl.textContent = location.pathname
  else dom.websiteUrl.textContent = location.origin + location.pathname
  dom.query.textContent = location.search

  // Step 1: Transaction
  if (!the.query) html.rewrite(dom.cosmiclink_description, "No transaction")

  // Step 2: Authenticator
  authenticators.nodes.forEach(entry => html.append(dom.authenticators, entry))
  dom.authenticators.value = the.authenticator.name
  dom.accountIdBox.value = the.accountId
  networkUI.set(the.network)

  // Step 3: Signing
  if (the.redirect) dom.redirectionCheckbox.checked = true
  if (the.qrCode) qrCodeUI.enable()

  setTamper()

  authenticatorUI.init()
}


/**
 * Computational path:
 *
 * authenticatorUI.init() => transactionUI.init() => redirectionUI.init() =>
 * authenticatorUI.refresh() => transactionUI.refresh() => redirectionUI.refresh()
 *
 * transactionUI depends on authenticatorUI
 * redirectionUI depends on both authenticatorUI & transactionUI
 */

/*******************************************************************************
 * Step 1: Transaction UI
 */

const transactionUI = {}

transactionUI.init = async function () {
  redirectionUI.init()
  if (!the.query) return

  await cosmicLib.load.css("cosmic-lib.css")
  the.cosmicLink = new CosmicLink(location.search)

  if (the.authenticator.accountId) {
    authenticatorUI.refresh()
    if (!the.accountId) return
  }

  transactionUI.refresh()
}

transactionUI.refresh = function () {
  cosmicLib.config.source = the.accountId
  cosmicLib.config.network = the.network
  the.cosmicLink.selectNetwork()
  const saveTransaction = the.transaction = the.authenticator.handle(the.cosmicLink)

  the.transaction.then(function (value) {
    if (the.transaction === saveTransaction) redirectionUI.refresh(value)
  }).catch(function (error) {
    if (the.transaction === saveTransaction) redirectionUI.error(error)
  })
}

/*******************************************************************************
 * Step 2: Authenticator UI
 */

const authenticatorUI = {}

authenticatorUI.init = function () {
  // TODO: Prevent next line to run on initialization (no big deal).
  if (the.authenticator && the.authenticator.onExit) the.authenticator.onExit()
  the.authenticator = authenticators[dom.authenticators.value]
  localStorage.authenticator = the.authenticator.name

  if (the.authenticator.accountId) authenticatorUI.enableAccountForm()
  else authenticatorUI.disableAccountForm()

  if (the.authenticator.refresh) the.authenticator.refresh(authenticatorUI.init)

  transactionUI.init()
}

authenticatorUI.refresh = function () {
  const tdesc = the.cosmicLink.tdesc

  if (tdesc.source && !the.authenticator.getAccountId) {
    accountUI.setReadOnly(tdesc.source)
  }

  if (tdesc.network) {
    dom.publicNetworkRadio.disabled = true
    dom.testNetworkRadio.disabled = true
    if (tdesc.network === "public") dom.publicNetworkRadio.checked = true
    else if (tdesc.network === "test") dom.testNetworkRadio.checked = true
  }
}


authenticatorUI.enableAccountForm = function () {
  html.show(dom.accountIdBox, dom.accountDiv)
  display(dom.accountMsgbox, "")
  the.network = networkUI.get()
  accountUI.init()
}

authenticatorUI.disableAccountForm = function () {
  html.hide(dom.accountIdBox, dom.accountDiv)
  the.network = "public"
  the.accountId = undefined
}

/**
 * AccountID box UI
 */
const accountUI = {}

accountUI.init = async function () {
  if (!the.authenticator.getAccountId) {
    dom.accountIdBox.placeholder = "Your Account Address or ID"
    accountUI.setReadWrite(localStorage.accountId)
  } else {
    dom.accountIdBox.placeholder = "Connecting..."
    accountUI.setReadOnly(undefined)
    dom.accountIdBox.disabled = true

    const authenticator = the.authenticator
    try {
      const accountId = await the.authenticator.getAccountId()
      if (the.authenticator !== authenticator) return
      accountUI.setReadOnly(accountId)
      transactionUI.refresh()
    } catch (error) {
      if (the.authenticator !== authenticator) return
      dom.accountIdBox.placeholder = "Error"
      display(dom.accountMsgbox, "error", error.message + ".")
    }
  }
}

accountUI.setReadWrite = function (address) {
  accountUI.set(address)
  dom.accountIdBox.disabled = false
  dom.accountIdBox.readOnly = false
  dom.accountIdBox.onclick = undefined
  dom.accountIdBox.style.cursor = undefined
}

accountUI.setReadOnly = function (address) {
  accountUI.set(address)
  dom.accountIdBox.disabled = !address
  dom.accountIdBox.readOnly = true
  dom.accountIdBox.style.cursor = "pointer"
  dom.accountIdBox.onclick = () => exports.copyContent(dom.accountIdBox)
}

accountUI.set = function (address) {
  dom.accountIdBox.value = address || ""
  the.accountId = address
}

/**
 * Network selection UI
 */
const networkUI = {}

networkUI.get = function () {
  return dom.publicNetworkRadio.checked ? "public" : "test"
}

networkUI.set = function (network) {
  switch (network) {
  case "public": dom.publicNetworkRadio.checked = true; break
  case "test": dom.testNetworkRadio.checked = true; break
  }
}

/**
 * HTML Elements Events
 */

dom.authenticators.onchange = function () {
  the.redirect = localStorage.redirect = false
  dom.redirectionCheckbox.checked = false
  authenticatorUI.init()
}

dom.accountIdBox.onchange = function () {
  the.accountId = localStorage.accountId = dom.accountIdBox.value
  transactionUI.init()
}

dom.publicNetworkRadio.onchange = dom.testNetworkRadio.onchange = function () {
  the.network = localStorage.network = networkUI.get()
  transactionUI.init()
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
      dom.redirectionButton.value = the.authenticator.buttonText
      dom.redirectionButton.disabled = undefined
      dom.redirectionButton.onclick = () => location.href = the.authenticator.url
    } else {
      dom.redirectionButton.value = "No transaction"
      dom.redirectionButton.disabled = true
    }
  } else {
    if (the.authenticator.redirection) {
      dom.redirectionButton.value = "…"
      dom.redirectionButton.disabled = true
    }
    if (the.authenticator.textarea) {
      dom.xdrBox.placeholder = "Computing..."
      dom.xdrBox.value = ""
      dom.xdrBox.disabled = true
    }
    if (the.authenticator.qrCode) qrCodeUI.loadingAnim()
  }
}

redirectionUI.noSourceAccount = function () {
  if (the.authenticator.redirection) dom.redirectionButton.value = "No source defined"
  if (the.authenticator.textarea) dom.xdrBox.placeholder = "No source defined"
  if (the.authenticator.qrCode) html.clear(dom.qrCode)
}

redirectionUI.refresh = function (value) {
  if (the.authenticator.redirection) {
    dom.redirectionButton.value = the.authenticator.buttonText
    dom.redirectionButton.disabled = undefined
    dom.redirectionButton.onclick = () => redirectionUI.click(value)
  }

  if (the.redirect) redirectionUI.click(value)

  if (the.authenticator.textarea) {
    dom.xdrBox.value = value
    dom.xdrBox.disabled = undefined
  }

  if (the.authenticator.qrCode) qrCodeUI.refresh(value)
}

redirectionUI.error = function () {
  if (the.authenticator.url) dom.redirectionButton.value = the.cosmicLink.status
  if (the.authenticator.textarea) dom.xdrBox.placeholder = the.cosmicLink.status
  html.clear(dom.qrCode)
}

redirectionUI.click = async function (value) {
  if (typeof value === "string") {
    location.replace(value)
  } else if (typeof value === "function") {
    display(dom.redirectionMsgbox, "info", "Waiting for confirmation...")
    dom.redirectionButton.disabled = true

    try {
      const transaction = await value()
      redirectionUI.sendTransaction(transaction)
    } catch (error) {
      console.error(error.response)
      redirectionUI.display("error", error.message.replace(/\.$/, "") + ".")
      dom.redirectionButton.disabled = false
    }
  }
}

redirectionUI.sendTransaction = async function () {
  redirectionUI.display("info", "Sending to the network...")
  history.replaceState({}, "", the.cosmicLink.query)
  dom.query.textContent = the.cosmicLink.query

  authenticatorUI.refresh()

  await the.cosmicLink.send()
  redirectionUI.display("info", "Transaction validated")
  if (document.referrer) {
    dom.redirectionButton.value = "Close"
    dom.redirectionButton.onclick = () => history.back()
    dom.redirectionButton.disabled = false
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


/*******************************************************************************
 * Robot Tamper
 */

function setTamper () {
  dom.tamper.src = "https://robohash.org/" + myHash()
}

function myHash () {
  if (localStorage.myHash) return localStorage.myHash

  var alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var size = 32

  var hash = ""
  for (var i = 0; i < size; i++) {
    hash += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  localStorage.myHash = hash
  return hash
}


/*******************************************************************************
 * Helpers
 */

function display (element, type = "", message = "") {
  const classname = type ? "." + type : null
  const messageNode = classname ? html.create("span", classname, message) : message
  html.rewrite(element, html.create("span", classname, messageNode))
}

function showIf (flag, element) {
  flag ? html.show(element) : html.hide(element)
}

exports.switchPage = function (from, to) {
  html.append(dom.body, from)
  html.append(dom.main, to)
}

exports.copyContent = function (element) {
  if (html.copyContent(element) && document.activeElement.value) {
    const prevNode = html.grab("#copied")
    if (prevNode) html.destroy(prevNode)
    const copiedNode = html.create("span", "#copied", "Copied")
    element.parentNode.insertBefore(copiedNode, element)
    setTimeout(() => { copiedNode.hidden = true }, 3000)
  }
}
