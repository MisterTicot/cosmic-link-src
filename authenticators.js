const node = require('./node')

/****************************** Authenticators ********************************/

let authenticators = {
  'Stellar Authenticator': {
    protocol: 'cosmiclink',
    url: 'https://stellar-authenticator.org/'
  },
  'Ledger Wallet': {
    protocol: 'ledgerwallet'
  },
  'Sep0007 Wallet': {
    protocol: 'sep0007',
    url: 'web+stellar:tx/'
  },
  'Stellar Laboratory': {
    protocol: 'stellarlab',
    url: 'https://stellar.org/laboratory/#txsigner',
  },
  'Copy/Paste XDR': {
    protocol: 'copy'
  }
}


/******************************** Protocols ***********************************/
const protocols = {}

protocols.cosmiclink = {
  handler: function (authenticator, cosmicLink) {
    return cosmicLink.getQuery().then(query => authenticator.url + query)
  }
}

protocols.stellarlab = {
  accountId: true,
  handler: async function (authenticator, cosmicLink) {
    const xdr = await cosmicLink.getXdr()
    const encodedXdr = encodeURIComponent(xdr)
    const query = `?xdr=${encodedXdr}&network=${cosmicLink.network}`
    return authenticator.url + query
  }
}

function getLedgerModule () {
  return import(/* webpackChunkName: "ledger" */ './ledger.js')
    .then(ledger => ledger.default)
}

protocols.ledgerwallet = {
  accountId: true,
  buttonText: 'Sign with Ledger Wallet',
  qrCode: false,
  getAccountId: async function () {
    const ledger = await getLedgerModule()
    await ledger.connect()
    return ledger.publicKey
  },
  handler: async function (authenticator, cosmicLink) {
    const transaction = await cosmicLink.getTransaction()
    const ledger = await getLedgerModule()
    return async function () {
      await ledger.connect()
      return ledger.sign(transaction)
    }
  },
  onExit: async function () {
    const ledger = await getLedgerModule()
    ledger.disconnect()
  }
}

protocols.sep0007 = {
  accountId: true,
  handler: async function (authenticator, cosmicLink) {
    const xdr = await cosmicLink.getXdr()
    let query = '?xdr=' + encodeURIComponent(xdr)
    if (cosmicLink.network === 'test') {
      query += '&network_passphrase=Test%20SDF%20Network%20%3B%20September%202015'
    }
    return authenticator.url + query
  }
}

protocols.copy = {
  accountId: true,
  redirection: false,
  textarea: true,
  handler: function (authenticator, cosmicLink) {
    return cosmicLink.getXdr()
  }
}

protocols.defaults = {
  redirection: true,
  qrCode: true
}


/**************************** Build module ************************************/

exports.array = []
exports.nodes = []

class Authenticator {
  constructor (name, protocol, url, options) {
    this.name = name
    this.protocol = protocol
    this.url = url
    Object.assign(this, protocols.defaults, protocols[protocol], options)
    if (!this.buttonText && this.url) this.buttonText = 'Go to ' + this.name
    console.log(this)
  }

  handle (cosmicLink) {
    return this.handler(this, cosmicLink)
  }

  get node () {
    return node.create('option', { value: this.name }, this.name)
  }
}

function addAuthenticator (name, protocol, url, options) {
  const authenticator = new Authenticator(name, protocol, url, options)
  exports.array.push(authenticator)
  exports.nodes.push(authenticator.node)
  exports[name] = authenticator
}

for (let name in authenticators) {
  const protocol = authenticators[name].protocol
  const url = authenticators[name].url
  const options = authenticators[name].options
  addAuthenticator(name, protocol, url, options)
}
