"use strict"
/**
 * Wallet protocols.
 *
 * Properties:
 *
 * - getAddress
 * - resolveRequest
 * - signRequest
 * - requestToUri
 * - requestToXdr
 * - onExit
 *
 * @exports protocols
 * @private
 */
const protocols = exports

const { friendbot } = require("@cosmic-plus/base")
const cosmicLib = require("cosmic-lib")
const testnet = cosmicLib.withConfig({ network: "test" })

/* Data */

protocols.cosmiclink = {
  resolveRequest (cosmicLink) {
    return cosmicLink
  },
  requestToUri (cosmicLink, authenticator) {
    return `${authenticator.url}${cosmicLink.query}`
  }
}

protocols.ledgerwallet = {
  buttonText: "Sign with Ledger Wallet",
  qrCode: false,
  async getAddress () {
    const ledger = await getLedgerModule()
    await ledger.connect()
    return ledger.publicKey
  },
  async signRequest (cosmicLink) {
    const ledger = await getLedgerModule()
    await ledger.sign(cosmicLink.transaction)
  },
  async onExit () {
    const ledger = await getLedgerModule()
    ledger.disconnect()
  }
}

protocols.trezorwallet = {
  buttonText: "Sign with Trezor Wallet",
  qrCode: false,
  async getAddress () {
    const trezor = await getTrezorModule()
    await trezor.connect()
    return trezor.publicKey
  },
  async signRequest (cosmicLink) {
    const trezor = await getTrezorModule()
    await trezor.sign(cosmicLink.transaction)
  },
  async onExit () {
    const trezor = await getTrezorModule()
    trezor.disconnect()
  }
}

protocols.sep0007 = {
  requestToUri (cosmicLink, authenticator) {
    const uri = cosmicLink.sep7
    const endpoint = "web+stellar:"
    if (authenticator.url !== endpoint) {
      const sep7 = encodeURIComponent(uri)
      return `${authenticator.url}${sep7}`
    } else {
      return uri
    }
  }
}

protocols.stellarlab = {
  async requestToUri (cosmicLink, authenticator) {
    const encodedXdr = encodeURIComponent(cosmicLink.xdr)
    let query = `${encodedXdr}`

    if (cosmicLink.network === "public" || cosmicLink.network === "test") {
      query += `&network=${cosmicLink.network}`
    } else {
      const passphrase = encodeURIComponent(cosmicLink.network)
      const horizon = encodeURIComponent(cosmicLink.horizon)
      query += `&network=custom&horizonURL=${horizon}`
      query += `&networkPassphrase=${passphrase}`
    }

    return `${authenticator.url}${query}`
  }
}

protocols.copy = {
  redirection: false,
  textarea: true,
  requestToXdr (cosmicLink) {
    return cosmicLink.xdr
  }
}

protocols.testAccount = {
  buttonText: "Sign with Testnet Account",
  qrCode: false,
  async getAddress () {
    if (!this.keypair) return
    const pubkey = this.keypair.publicKey()
    if (await testnet.resolve.isAccountEmpty(pubkey)) {
      await friendbot(pubkey).catch(() => null)
    }
    return pubkey
  },
  signRequest (cosmicLink) {
    cosmicLink.sign(this.keypair)
  }
}

/* Module loading */

function getLedgerModule () {
  return import(
    /* webpackChunkName: "ledger" */ "@cosmic-plus/ledger-wallet"
  ).then((ledger) => ledger.default)
}

function getTrezorModule () {
  return import(
    /* webpackChunkName: "trezor" */ "@cosmic-plus/trezor-wallet"
  ).then((trezor) => {
    trezor.register("https://cosmic.link", "mister.ticot@cosmic.plus")
    return trezor.default
  })
}
