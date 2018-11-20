/**
 * Protocols handlers.
 *
 * @exports protocols
 * @private
 */
const protocols = exports

const defaults = {
  redirection: true,
  textarea: false,
  qrCode: true
}

protocols.cosmiclink = {
  handler: function (authenticator, cosmicLink) {
    return authenticator.url + cosmicLink.query
  }
}

protocols.ledgerwallet = {
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

protocols.trezorwallet = {
  buttonText: "Sign with Trezor Wallet",
  qrCode: false,
  getAccountId: async function () {
    const trezor = await getTrezorModule()
    await trezor.connect()
    return trezor.publicKey
  },
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    const trezor = await getTrezorModule()
    return async () => trezor.sign(cosmicLink.transaction)
  },
  refresh: async function (refresher) {
    const trezor = await getTrezorModule()
    trezor.onDisconnect = () => refresher()
  },
  onExit: async function () {
    const trezor = await getTrezorModule()
    trezor.disconnect()
  }
}

protocols.sep0007 = {
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    return cosmicLink.sep7
  }
}

protocols.stellarlab = {
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    const encodedXdr = encodeURIComponent(cosmicLink.xdr)
    let query = `?xdr=${encodedXdr}`
    if (cosmicLink.network === "public" || cosmicLink.network === "test") {
      query += `&network=${cosmicLink.network}`
    } else {
      const passphrase = encodeURIComponent(cosmicLink.network)
      const horizon = encodeURIComponent(cosmicLink.horizon)
      query += `&network=custom&horizonURL=${horizon}&networkPassphrase=${passphrase}`
    }
    return authenticator.url + query
  }
}

protocols.copy = {
  redirection: false,
  textarea: true,
  handler: async function (authenticator, cosmicLink) {
    await cosmicLink.lock()
    return cosmicLink.xdr
  }
}

/**
 * Module loading
 */

function getLedgerModule () {
  return import(
    /* webpackChunkName: "ledger" */ "@cosmic-plus/ledger-wallet"
  ).then(ledger => ledger.default)
}

function getTrezorModule () {
  return import(
    /* webpackChunkName: "trezor" */ "@cosmic-plus/trezor-wallet"
  ).then(trezor => {
    trezor.register("https://cosmic.link", "mister.ticot@cosmic.plus")
    return trezor.default
  })
}

/**
 * Apply defaults to each protocols.
 */

for (let entry in protocols) {
  protocols[entry] = Object.assign({}, defaults, protocols[entry])
}

protocols.defaults = defaults
