/**
 * Protocols handlers.
 *
 * @exports protocols
 * @private
 */
const protocols = exports

function getLedgerModule () {
  return import(/* webpackChunkName: "ledger" */ "@cosmic-plus/ledger-wallet")
    .then(ledger => ledger.default)
}

protocols.cosmiclink = {
  handler: function (authenticator, cosmicLink) {
    return authenticator.url + cosmicLink.query
  }
}

protocols.ledgerwallet = {
  accountId: true,
  buttonText: "Sign with Ledger Wallet",
  qrCode: false,
  getAccountId: async function () {
    const ledger = await getLedgerModule()
    await ledger.connect()
    return ledger.publicKey
  },
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    const ledger = await getLedgerModule()
    cosmicLink.selectNetwork()
    return async () => ledger.sign(cosmicLink.transaction)
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

protocols.sep0007 = {
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock().catch(console.error)
    return cosmicLink.sep7
  }
}

protocols.stellarlab = {
  accountId: true,
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    const encodedXdr = encodeURIComponent(cosmicLink.xdr)
    const query = `?xdr=${encodedXdr}&network=${cosmicLink.network}`
    return authenticator.url + query
  }
}

protocols.copy = {
  accountId: true,
  redirection: false,
  textarea: true,
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    return cosmicLink.xdr
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
