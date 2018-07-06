const node = require('./node')

exports.array = []
exports.nodes = []

let handlers = {
  cosmiclink: function (authenticator, cosmicLink) {
    return cosmicLink.getQuery().then(query => authenticator.url + query)
  },

  sep0007: function (authenticator, cosmicLink) {
    return cosmicLink.getXdr().then(function (xdr) {
      let query = '?xdr=' + encodeURIComponent(xdr)
      if (cosmicLink.network === 'test') {
        query += '&network_passphrase='
        query += encodeURIComponent('Test SDF Network ; September 2015')
      }
      return authenticator.url + query
    })
  },

  stellarlab: function (authenticator, cosmicLink) {
    return cosmicLink.getXdr().then(function (xdr) {
      const encodedXdr = encodeURIComponent(xdr)
      const query = `?xdr=${encodedXdr}&network=${cosmicLink.network}`
      return authenticator.url + query
    })
  },

  xdr: function (authenticator, cosmicLink) {
    return cosmicLink.getXdr()
  }
}

let authenticators = {
  'Stellar Authenticator': {
    handler: handlers.cosmiclink,
    url: 'https://stellar-authenticator.org/'
  },
  'Stellar Laboratory': {
    handler: handlers.stellarlab,
    url: 'https://stellar.org/laboratory/#txsigner',
    accountId: true
  },
  'Sep0007 Wallet': {
    handler: handlers.sep0007,
    url: 'web+stellar:tx/',
    accountId: true
  },
  'Copy/Paste XDR': {
    handler: handlers.xdr,
    accountId: true,
    textarea: true
  }
}

class Authenticator {
  constructor (name, config) {
    this.name = name
    for (name in config) this[name] = config[name]
  }

  handle (cosmicLink) {
    return this.handler(this, cosmicLink)
  }

  get node () {
    return node.create('option', { value: this.name }, this.name)
  }
}

function addAuthenticator (name, config) {
  const authenticator = new Authenticator(name, config)
  exports.array.push(authenticator)
  exports.nodes.push(authenticator.node)
  exports[name] = authenticator
}

for (let name in authenticators) addAuthenticator(name, authenticators[name])
