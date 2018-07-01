const CosmicLink = require('cosmic-lib').CosmicLink
const node = require('./node')
const QRCode = require('qrcode')

/// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('worker.js').catch(console.error)
}

var cosmicLink
exports.start = function () {
  refreshRedirection()
  setTamper()

  if (location.search.length > 1) {
    cosmicLink = new CosmicLink(document.URL)

    cosmicLink.getQuery().then(function (query) {
      node.append(node.grab('#query'), '/' + query)
    })

    refreshQR()
  } else {
    var transactionNode = node.grab('#CL_htmlNode')
    node.clear(transactionNode)
    node.append(transactionNode, 'No transaction')
  }
}

const main = node.grab('main')
const hiddenDiv = node.grab('#hidden')
exports.switchPage = function (from, to) {
  node.append(hiddenDiv, from)
  node.append(main, to)
}

exports.switchQR = function () {
  if (localStorage.QR === 'true') localStorage.QR = false
  else localStorage.QR = true
  refreshQR()
}

const QRdiv = node.grab('#QR')
function refreshQR () {
  if (localStorage.QR === 'true') {
    cosmicLink.getQuery().then(function (query) {
      const url = getAuthenticatorUrl() + query
      const canvas = node.create('canvas')
      QRCode.toCanvas(canvas, url, { margin: 0, scale: 5 })
      node.append(QRdiv, canvas)
    })
  } else {
    node.clear(QRdiv)
  }
}

exports.switchRedirection = function () {
  if (localStorage.redirect === 'true') localStorage.redirect = false
  else localStorage.redirect = true
  refreshRedirection()
}

const checkbox = node.grab('#checkbox')
const redirect = node.grab('#redirect')
function refreshRedirection () {
  if (localStorage.redirect === 'true') {
    checkbox.textContent = '✔'
    redirect.className = 'enabled'
  } else {
    checkbox.textContent = '✘'
    redirect.className = ''
  }
}

const selector = node.grab('#authenticators')
function selectAuthenticator () {
  const value = selector.value
  localStorage.authenticator = value
  refreshQR()
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
