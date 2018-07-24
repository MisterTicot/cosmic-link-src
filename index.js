const CosmicLink = require('cosmic-lib').CosmicLink
const node = require('./node')
const authenticators = require('./authenticators')
const QRCode = require('qrcode')

/// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('worker.js').catch(console.error)
}

/// HTML elements
const authenticatorSelector = node.grab('#authenticators')

const accountIdBox = node.grab('#accountId')
const networkDiv = node.grab('#network')
const publicNetworkRadio = node.grab('#publicNetwork')
const testNetworkRadio = node.grab('#testNetwork')

const redirectionForm = node.grab('#redirection')
const gotoButton = node.grab('input', redirectionForm)
const checkbox = node.grab('#checkbox')

const textareaForm = node.grab('#textarea')
const xdrBox = node.grab('textarea', textareaForm)

const qrForm = node.grab('#qrform')
const QrButton = node.grab('input', qrform)
const qrCode = node.grab('#qrcode')

let authenticator, cosmicLink, transaction

exports.init = function () {
  node.append(node.grab('#query'), location.search)

  authenticators.nodes.forEach(entry => node.append(authenticatorSelector, entry))
  if (localStorage.redirect === 'true') checkbox.checked = true
  if (localStorage.accountId) accountIdBox.value = localStorage.accountId
  if (localStorage.network) {
    if (localStorage.network === 'public') publicNetworkRadio.checked = true
    else if (localStorage.network === 'test') testNetworkRadio.checked = true
  }

  if (localStorage.QR === 'true') {
    QrButton.className = 'enabled'
    node.show(qrCode)
  }

  if (location.search.length < 2) {
    node.rewrite(node.grab('#CL_htmlNode'), 'No transaction')
    redirectionForm.onsubmit = () => false
  }

  if (localStorage.authenticator && authenticators[localStorage.authenticator]) {
    authenticatorSelector.value = localStorage.authenticator
  } else {
    authenticatorSelector.value = 'Stellar Authenticator'
  }
  authenticatorSelector.onchange()

  setTamper()
}

authenticatorSelector.onchange = function (event) {
  authenticator = authenticators[authenticatorSelector.value]
  localStorage.authenticator = authenticator.name

  if (authenticator.url) node.show(redirectionForm)
  else node.hide(redirectionForm)

  if (authenticator.accountId) node.show(accountIdBox, networkDiv)
  else node.hide(accountIdBox, networkDiv)
  
  if (authenticator.redirection) node.show(redirectionForm)
  else node.hide(redirectionForm)

  if (authenticator.textarea) node.show(textareaForm)
  else node.hide(textareaForm)
  
  if (authenticator.qrCode) node.show(qrForm)
  else node.hide(qrForm)

  if (event) {
    localStorage.redirect = false
    checkbox.checked = false
  }

  if (location.search.length < 2) {
    if (authenticator.url) {
      gotoButton.value = 'Go to ' + authenticator.name
      gotoButton.onclick = () => location = authenticator.url
      gotoButton.disabled = undefined
    }
  } else {
    computeTransaction()
  }
}

function computeTransaction () {
  if (location.search.length < 2) return

  gotoButton.value = '…'
  gotoButton.disabled = true
  xdrBox.placeholder = 'Computing...'
  xdrBox.value = ''
  xdrBox.disabled = true
  node.rewrite(qrcode, node.create('canvas', '.CL_loadingAnim'))

  let network, accountId

  if (authenticator.accountId) {
    accountId = accountIdBox.value
    network = publicNetworkRadio.checked ? 'public' : 'test'
  }

  cosmicLink = new CosmicLink(location.search,
    { network: network, user: accountId })
  transaction = authenticator.handle(cosmicLink)

  const saveTransaction = transaction
  transaction
    .then(function (value) {
      if (transaction === saveTransaction) refreshTransaction(value)
    })
    .catch(function (error) {
      if (transaction === saveTransaction) transactionError(error)
    })
}

function refreshTransaction (value) {
  if (localStorage.redirect === 'true') {
    location.replace(value)
    return
  }

  if (authenticator.accountId) {
    cosmicLink.getTdesc().then(tdesc => refreshAccountIdForm(tdesc))
  }

  if (authenticator.url) {
    gotoButton.value = 'Go to ' + authenticator.name
    gotoButton.disabled = undefined
  }

  if (authenticator.textarea) {
    xdrBox.value = value
    xdrBox.disabled = undefined
  }

  refreshQR(value)
}

function refreshAccountIdForm (tdesc) {
  if (tdesc.source) {
    accountIdBox.value = tdesc.source
    accountIdBox.disabled = true
  }
  if (tdesc.network) {
    publicNetworkRadio.disabled = true
    testNetworkRadio.disabled = true
    if (tdesc.network === 'public') publicNetworkRadio.checked = true
    else testNetworkRadio.checked = true
  }
}

function transactionError (error) {
  if (authenticator.url) gotoButton.value = error.message
  if (authenticator.textarea) xdrBox.placeholder = error.message
  node.clear(qrCode)
}

redirectionForm.onsubmit = function () {
  transaction.then(url => location.replace(url))
  return false
}

accountIdBox.onchange = function () {
  localStorage.accountId = accountIdBox.value
  computeTransaction()
}

publicNetworkRadio.onchange = testNetworkRadio.onchange = function () {
  localStorage.network = publicNetworkRadio.checked ? 'public' : 'test'
  computeTransaction()
}

checkbox.onchange = function () {
  if (checkbox.checked) localStorage.redirect = 'true'
  else localStorage.redirect = 'false'
}

const main = node.grab('main')
const hiddenDiv = node.grab('#hidden')
exports.switchPage = function (from, to) {
  node.append(hiddenDiv, from)
  node.append(main, to)
}

exports.switchQR = function () {
  if (localStorage.QR === 'true') {
    node.hide(qrCode)
    localStorage.QR = false
    QrButton.className = undefined
  } else {
    node.show(qrCode)
    localStorage.QR = true
    QrButton.className = 'enabled'
  }
}

function refreshQR (value) {
  node.clear(qrCode)
  const canvas = node.create('canvas')
  QRCode.toCanvas(canvas, value, { margin: 0, scale: 5 })
  canvas.title = value
  node.append(qrCode, canvas)
}

/** * Experimental Robot Factory ***/

function myHash () {
  if (localStorage.myHash) return localStorage.myHash

  var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var size = 32

  var hash = ''
  for (var i = 0; i < size; i++) {
    hash += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  localStorage.myHash = hash
  return hash
}

const tamper = node.grab('#tamper')
function setTamper () {
  tamper.src = 'https://robohash.org/' + myHash()
}

/// Copy content helper

exports.copyContent = function (element) {
  if (node.copyContent(element) && document.activeElement.value) {
    const prevNode = node.grab('#copied')
    if (prevNode) node.destroy(prevNode)
    const copiedNode = node.create('span', '#copied', 'Copied')
    element.parentNode.insertBefore(copiedNode, element.nextSibling)
    setTimeout(() => { copiedNode.hidden = true }, 3000)
  }
}
