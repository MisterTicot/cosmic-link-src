const cosmicLib = require('cosmic-lib')
const CosmicLink = require('cosmic-lib').CosmicLink
const dom = require('@cosmic-plus/jsutils/dom')
const html = require('@cosmic-plus/jsutils/html')
const QrCode = require('qrcode')

const authenticators = require('./authenticators')

/// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('worker.js')
}

/// HTML elements
let authenticator, cosmicLink, transaction

exports.init = function () {
  if (location.origin === 'null') dom.websiteUrl.textContent = location.pathname
  else dom.websiteUrl.textContent = location.origin + location.pathname
  dom.query.textContent = location.search

  authenticators.nodes.forEach(entry => html.append(dom.authenticators, entry))
  if (localStorage.redirect === 'true') dom.redirectionCheckbox.checked = true
  if (localStorage.accountId) {
    cosmicLib.defaults.user = dom.accountIdBox.value = localStorage.accountId
  }
  if (localStorage.network) {
    if (localStorage.network === 'public') dom.publicNetworkRadio.checked = true
    else if (localStorage.network === 'test') dom.testNetworkRadio.checked = true
    cosmicLib.defaults.network = localStorage.network
  }

  if (localStorage.QR === 'true') {
    dom.qrButton.className = 'enabled'
    html.show(dom.qrCode)
  }

  if (location.search.length < 2) {
    html.rewrite(dom.CL_htmlNode, 'No transaction')
    dom.redirectionForm.onsubmit = () => false
  }

  if (localStorage.authenticator && authenticators[localStorage.authenticator]) {
    dom.authenticators.value = localStorage.authenticator
  } else {
    dom.authenticators.value = 'Stellar Authenticator'
  }
  dom.authenticators.onchange()

  setTamper()
}

dom.authenticators.onchange = function (event) {
  if (authenticator && authenticator.onExit) authenticator.onExit()
  authenticator = authenticators[dom.authenticators.value]
  localStorage.authenticator = authenticator.name

  clearMsgboxes()

  if (authenticator.accountId) {
    setupAccountIdBox()
    html.show(dom.accountIdBox, dom.accountDiv)
  } else {
    html.hide(dom.accountIdBox, dom.accountDiv)
  }

  if (authenticator.redirection) html.show(dom.redirectionForm)
  else html.hide(dom.redirectionForm)

  if (authenticator.textarea) html.show(dom.textareaForm)
  else html.hide(dom.textareaForm)

  if (authenticator.refresh) authenticator.refresh(dom.authenticators.onchange)

  if (event) {
    localStorage.redirect = false
    dom.redirectionCheckbox.checked = false
  }

  if (location.search.length < 2) {
    if (authenticator.url) {
      dom.gotoButton.value = authenticator.buttonText
      dom.gotoButton.onclick = () => location = authenticator.url
      dom.gotoButton.disabled = undefined
    } else {
      dom.gotoButton.value = 'No transaction'
      dom.gotoButton.disabled = true
    }
  } else {
    if (authenticator.qrCode) html.show(dom.qrForm)
    else html.hide(dom.qrForm)
    computeTransaction()
  }
}

function setupAccountIdBox () {
  dom.accountIdBox.disabled = undefined
  dom.accountIdBox.readOnly = false
  dom.accountIdBox.onclick = undefined
  dom.accountIdBox.style.cursor = undefined

  if (authenticator.getAccountId) {
    dom.accountIdBox.value = ''
    dom.accountIdBox.placeholder = 'Connecting...'
    dom.accountIdBox.disabled = true
    const saveName = authenticator.name

    authenticator.getAccountId().then(accountId => {
      if (authenticator.name !== saveName) return
      setAccountIdBoxReadonly(accountId)
      computeTransaction()
    }).catch(error => {
      html.hide(dom.accountDiv)
      display(dom.accountMsgbox, 'error', error.message + '.')
    })
  } else {
    if (localStorage.accountId) dom.accountIdBox.value = localStorage.accountId
    dom.accountIdBox.placeholder = 'Your Account Address or ID'
  }
}

async function computeTransaction () {
  if (location.search.length < 2) return

  clearMsgboxes()

  if (authenticator.redirection) {
    dom.gotoButton.value = '…'
    dom.gotoButton.disabled = true
  }

  if (authenticator.textarea) {
    dom.xdrBox.placeholder = 'Computing...'
    dom.xdrBox.value = ''
    dom.xdrBox.disabled = true
  }

  if (authenticator.qrCode) {
    html.rewrite(dom.qrCode, html.create('canvas', '.CL_loadingAnim'))
  }

  let network, accountId
  if (authenticator.accountId) {
    accountId = dom.accountIdBox.value
    network = currentNetwork()
  }

  cosmicLink = new CosmicLink(location.search,
    { network: network, user: accountId })

  if (authenticator.accountId && !accountId) {
    if (!authenticator.getAccountId) {
      if (authenticator.redirection) dom.gotoButton.value = 'No source defined'
      if (authenticator.textarea) dom.xdrBox.placeholder = 'No source defined'
      if (authenticator.qrCode) html.clear(dom.qrCode)
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
  display(dom.accountMsgbox); display(dom.redirectionMsgbox)
}

function currentNetwork () {
  return dom.publicNetworkRadio.checked ? 'public' : 'test'
}

function refreshTransaction (value) {
  if (authenticator.redirection) {
    dom.gotoButton.value = authenticator.buttonText
    dom.gotoButton.disabled = undefined
    dom.gotoButton.onclick = () => buttonOnClick(value)
  }

  if (localStorage.redirect === 'true') buttonOnClick(value)

  if (authenticator.accountId) {
    cosmicLink.getTdesc().then(tdesc => refreshAccountIdForm(tdesc))
  }

  if (authenticator.textarea) {
    dom.xdrBox.value = value
    dom.xdrBox.disabled = undefined
  }

  if (authenticator.qrCode) refreshQR(value)
}

function refreshAccountIdForm (tdesc) {
  if (tdesc.source) {
    display(dom.accountMsgbox)
    setAccountIdBoxReadonly(tdesc.source)
  }
  if (tdesc.network) {
    dom.publicNetworkRadio.disabled = true
    dom.testNetworkRadio.disabled = true
    if (tdesc.network === 'public') dom.publicNetworkRadio.checked = true
    else dom.testNetworkRadio.checked = true
  }
}

function setAccountIdBoxReadonly (value) {
  dom.accountIdBox.disabled = false
  dom.accountIdBox.readOnly = true
  dom.accountIdBox.value = value
  dom.accountIdBox.style.cursor = 'pointer'
  dom.accountIdBox.onclick = () => exports.copyContent(dom.accountIdBox)
}

async function buttonOnClick (value) {
  if (typeof value === 'string') location.replace(value)
  else if (typeof value === 'function') {
    display(dom.redirectionMsgbox, 'info', 'Waiting for confirmation...')
    dom.gotoButton.disabled = true
    value().then(sendTransaction).catch(error => {
      display(dom.redirectionMsgbox, 'error', error.message + '.')
      dom.gotoButton.disabled = false
    })
  }
}

async function sendTransaction (transaction) {
  cosmicLink = new CosmicLink(transaction, { network: currentNetwork() })
  cosmicLink.getQuery().then(query => history.replaceState({}, '', query))
  cosmicLink.getTdesc().then(tdesc => refreshAccountIdForm(tdesc))

  display(dom.redirectionMsgbox, 'info', 'Sending to the network...')

  try {
    const response = await cosmicLink.send()
    console.log(response)
    display(dom.redirectionMsgbox, 'info', 'Transaction validated')
    if (document.referrer) {
      dom.gotoButton.value = 'Close'
      dom.gotoButton.onclick = () => history.back()
      dom.gotoButton.disabled = false
    } else {
      dom.gotoButton.value = 'Done'
    }
  } catch (error) {
    console.error(error.response)
    display(dom.redirectionMsgbox, 'error', error.message + '.')
  }
}

function display (element, type = '', message = '') {
  const classname = type ? '.' + type : null
  html.rewrite(element, html.create('span', classname, message))
}

function transactionError (error) {
  if (authenticator.url) dom.gotoButton.value = error.message
  if (authenticator.textarea) dom.xdrBox.placeholder = error.message
  html.clear(dom.qrCode)
}
dom.accountIdBox.onchange = function () {
  localStorage.accountId = cosmicLib.defaults.user = dom.accountIdBox.value
  computeTransaction()
}

dom.publicNetworkRadio.onchange = dom.testNetworkRadio.onchange = function () {
  localStorage.network = cosmicLib.defaults.network = currentNetwork()
  computeTransaction()
}

dom.redirectionCheckbox.onchange = function () {
  console.log
  if (dom.redirectionCheckbox.checked) localStorage.redirect = 'true'
  else localStorage.redirect = 'false'
}

exports.switchPage = function (from, to) {
  html.append(dom.body, from)
  html.append(dom.main, to)
}

exports.switchQR = function () {
  if (localStorage.QR === 'true') {
    html.hide(dom.qrCode)
    localStorage.QR = false
    dom.qrButton.className = undefined
  } else {
    html.show(dom.qrCode)
    localStorage.QR = true
    dom.qrButton.className = 'enabled'
  }
}

function refreshQR (value) {
  if (!authenticator.qrCode || !value) return

  const canvas = html.create('canvas')
  QrCode.toCanvas(canvas, value, { margin: 0, scale: 5 })
  canvas.title = value
  html.rewrite(dom.qrCode, canvas)
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

function setTamper () {
  dom.tamper.src = 'https://robohash.org/' + myHash()
}

/// Copy content helper

exports.copyContent = function (element) {
  if (html.copyContent(element) && document.activeElement.value) {
    const prevNode = html.grab('#copied')
    if (prevNode) html.destroy(prevNode)
    const copiedNode = html.create('span', '#copied', 'Copied')
    element.parentNode.insertBefore(copiedNode, element)
    setTimeout(() => { copiedNode.hidden = true }, 3000)
  }
}
