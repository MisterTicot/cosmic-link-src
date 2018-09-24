/**
 * Protocols handlers.
 */

const protocols = exports

protocols.cosmiclink = {
  handler: function (authenticator, cosmicLink) {
    return cosmicLink.getQuery().then(query => authenticator.url + query)
  }
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
    return async () => ledger.sign(transaction)
  },
  refresh: async function (refresher) {
    const ledger = await getLedgerModule()
    ledger.onDisconnect = () => refresher()
  },
  onExit: async function () {
    const ledger = await getLedgerModule()
    ledger.disconnect()
  }
}

function getLedgerModule () {
  return import(/* webpackChunkName: "ledger" */ 'stellar-ledger-wallet')
    .then(ledger => ledger.default)
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

protocols.stellarlab = {
  accountId: true,
  handler: async function (authenticator, cosmicLink) {
    const xdr = await cosmicLink.getXdr()
    const encodedXdr = encodeURIComponent(xdr)
    const query = `?xdr=${encodedXdr}&network=${cosmicLink.network}`
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

/******************************************************************************/
/// Apply defaults to each protocols.

const defaults = {
  accountId: false,
  redirection: true,
  textarea: false,
  qrCode: true
}

for (let entry in protocols) {
  protocols[entry] = Object.assign({}, defaults, protocols[entry])
}

protocols.defaults = defaults
