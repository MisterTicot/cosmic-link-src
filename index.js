const cosmicLib = require('cosmic-lib')
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

const accountDiv = node.grab('#accountDiv')
const accountIdBox = node.grab('#accountId')
const publicNetworkRadio = node.grab('#publicNetwork')
const testNetworkRadio = node.grab('#testNetwork')
const accountMsgbox = node.grab('#accountMsgbox')

const redirectionForm = node.grab('#redirection')
const gotoButton = node.grab('input', redirectionForm)
const checkbox = node.grab('#checkbox')
const redirectionMsgbox = node.grab('#redirectionMsgbox')

const textareaForm = node.grab('#textarea')
const xdrBox = node.grab('textarea', textareaForm)

const qrForm = node.grab('#qrform')
const QrButton = node.grab('input', qrForm)
const qrCode = node.grab('#qrcode')

let authenticator, cosmicLink, transaction

exports.init = function () {
  node.append(node.grab('#query'), location.search)

  authenticators.nodes.forEach(entry => node.append(authenticatorSelector, entry))
  if (localStorage.redirect === 'true') checkbox.checked = true
  if (localStorage.accountId) {
    cosmicLib.defaults.user = accountIdBox.value = localStorage.accountId
  }
  if (localStorage.network) {
    if (localStorage.network === 'public') publicNetworkRadio.checked = true
    else if (localStorage.network === 'test') testNetworkRadio.checked = true
    cosmicLib.defaults.network = localStorage.network
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
  if (authenticator && authenticator.onExit) authenticator.onExit()
  authenticator = authenticators[authenticatorSelector.value]
  localStorage.authenticator = authenticator.name

  clearMsgboxes()

  if (authenticator.accountId) {
    setupAccountIdBox()
    node.show(accountIdBox, accountDiv)
  } else {
    node.hide(accountIdBox, accountDiv)
  }

  if (authenticator.redirection) node.show(redirectionForm)
  else node.hide(redirectionForm)

  if (authenticator.textarea) node.show(textareaForm)
  else node.hide(textareaForm)

  if (authenticator.refresh) authenticator.refresh(authenticatorSelector.onchange)

  if (event) {
    localStorage.redirect = false
    checkbox.checked = false
  }

  if (location.search.length < 2) {
    if (authenticator.url) {
      gotoButton.value = authenticator.buttonText
      gotoButton.onclick = () => location = authenticator.url
      gotoButton.disabled = undefined
    } else {
      gotoButton.value = 'No transaction'
      gotoButton.disabled = true
    }
  } else {
    if (authenticator.qrCode) node.show(qrForm)
    else node.hide(qrForm)
    computeTransaction()
  }
}

function setupAccountIdBox () {
  accountIdBox.disabled = undefined
  accountIdBox.readOnly = false
  accountIdBox.onclick = undefined
  accountIdBox.style.cursor = undefined

  if (authenticator.getAccountId) {
    accountIdBox.value = ''
    accountIdBox.placeholder = 'Connecting...'
    accountIdBox.disabled = true
    const saveName = authenticator.name

    authenticator.getAccountId().then(accountId => {
      if (authenticator.name !== saveName) return
      setAccountIdBoxReadonly(accountId)
      computeTransaction()
    }).catch(error => {
      node.hide(accountDiv)
      display(accountMsgbox, 'error', error.message + '.')
    })
  } else {
    if (localStorage.accountId) accountIdBox.value = localStorage.accountId
    accountIdBox.placeholder = 'Your Account Address or ID'
  }
}

async function computeTransaction () {
  if (location.search.length < 2) return

  clearMsgboxes()

  if (authenticator.redirection) {
    gotoButton.value = '…'
    gotoButton.disabled = true
  }

  if (authenticator.textarea) {
    xdrBox.placeholder = 'Computing...'
    xdrBox.value = ''
    xdrBox.disabled = true
  }

  if (authenticator.qrCode) {
    node.rewrite(qrCode, node.create('canvas', '.CL_loadingAnim'))
  }

  let network, accountId
  if (authenticator.accountId) {
    accountId = accountIdBox.value
    network = currentNetwork()
  }

  cosmicLink = new CosmicLink(location.search,
    { network: network, user: accountId })

  if (authenticator.accountId && !accountId) {
    if (!authenticator.getAccountId) {
      if (authenticator.redirection) gotoButton.value = 'No source defined'
      if (authenticator.textarea) xdrBox.placeholder = 'No source defined'
      if (authenticator.qrCode) node.clear(qrCode)
    }
    return
  }

  const saveTransaction = transaction = authenticator.handle(cosmicLink)
  transaction
    .then(function (value) {
      if (transaction === saveTransaction) refreshTransaction(value)
    })
    .catch(function (error) {
      if (transaction === saveTransaction) transactionError(error)
    })
}

function clearMsgboxes () {
  display(accountMsgbox); display(redirectionMsgbox)
}

function currentNetwork () {
  return publicNetworkRadio.checked ? 'public' : 'test'
}

function refreshTransaction (value) {
  if (authenticator.redirection) {
    gotoButton.value = authenticator.buttonText
    gotoButton.disabled = undefined
    gotoButton.onclick = () => buttonOnClick(value)
  }

  if (localStorage.redirect === 'true') buttonOnClick(value)

  if (authenticator.accountId) {
    cosmicLink.getTdesc().then(tdesc => refreshAccountIdForm(tdesc))
  }

  if (authenticator.textarea) {
    xdrBox.value = value
    xdrBox.disabled = undefined
  }

  if (authenticator.qrCode) refreshQR(value)
}

function refreshAccountIdForm (tdesc) {
  if (tdesc.source) {
    display(accountMsgbox)
    setAccountIdBoxReadonly(tdesc.source)
  }
  if (tdesc.network) {
    publicNetworkRadio.disabled = true
    testNetworkRadio.disabled = true
    if (tdesc.network === 'public') publicNetworkRadio.checked = true
    else testNetworkRadio.checked = true
  }
}

function setAccountIdBoxReadonly (value) {
  accountIdBox.disabled = false
  accountIdBox.readOnly = true
  accountIdBox.value = value
  accountIdBox.style.cursor = 'pointer'
  accountIdBox.onclick = () => exports.copyContent(accountIdBox)
}

async function buttonOnClick (value) {
  if (typeof value === 'string') location.replace(value)
  else if (typeof value === 'function') {
    display(redirectionMsgbox, 'info', 'Waiting for confirmation...')
    gotoButton.disabled = true
    value().then(sendTransaction).catch(error => {
      display(redirectionMsgbox, 'error', error.message + '.')
      gotoButton.disabled = false
    })
  }
}

async function sendTransaction (transaction) {
  cosmicLink = new CosmicLink(transaction, { network: currentNetwork() })
  cosmicLink.getQuery().then(query => history.replaceState({}, '', query))
  cosmicLink.getTdesc().then(tdesc => refreshAccountIdForm(tdesc))

  display(redirectionMsgbox, 'info', 'Sending to the network...')

  try {
    const response = await cosmicLink.send()
    console.log(response)
    display(redirectionMsgbox, 'info', 'Transaction validated')
    if (document.referrer) {
      gotoButton.value = 'Close'
      gotoButton.onclick = () => history.back()
      gotoButton.disabled = false
    } else {
      gotoButton.value = 'Done'
    }
  } catch (error) {
    console.error(error.response)
    display(redirectionMsgbox, 'error', error.message + '.')
  }
}

function display (element, type = '', message = '') {
  const classname = type ? '.' + type : null
  node.rewrite(element, node.create('span', classname, message))
}

function transactionError (error) {
  if (authenticator.url) gotoButton.value = error.message
  if (authenticator.textarea) xdrBox.placeholder = error.message
  node.clear(qrCode)
}

accountIdBox.onchange = function () {
  localStorage.accountId = cosmicLib.defaults.user = accountIdBox.value
  computeTransaction()
}

publicNetworkRadio.onchange = testNetworkRadio.onchange = function () {
  localStorage.network = cosmicLib.defaults.network = currentNetwork()
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
  if (!authenticator.qrCode || !value) return

  const canvas = node.create('canvas')
  QRCode.toCanvas(canvas, value, { margin: 0, scale: 5 })
  canvas.title = value
  node.rewrite(qrCode, canvas)
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
    element.parentNode.insertBefore(copiedNode, element)
    setTimeout(() => { copiedNode.hidden = true }, 3000)
  }
}
