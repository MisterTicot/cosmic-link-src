/**
 * async ledgerWallet.connect([accountNumber], [accountIndex], [internalFlag])
 * ledgerWallet.disconnect()
 *
 * // After connection succeed
 * async ledgerWallet.sign(transaction)
 * ledgerWallet.publicKey
 * ledgerWallet.version
 * ledgerWallet.account
 * ledgerWallet.path
 * ledgerWallet.application
 * ledgerWallet.transport
 *
 * // After connection fail
 * ledgerWallet.error
 */
const ledger = {}

/**
 * Environment detection and library loading.
 */

const isBrowser = new Function('try { return this === window } catch (e) { return false }')
const isNode = new Function('try { return this === global } catch (e) { return false }')

const StellarApp = require('@ledgerhq/hw-app-str').default
let Transport, Sdk
if (isBrowser()) {
  if (typeof StellarSdk === 'undefined') {
    throw new Error('stellar-ledger-wallet depends on StellarSdk.')
  }
  Transport = require('@ledgerhq/hw-transport-u2f').default
  Sdk = StellarSdk
} else if (isNode()) {
  /// Prevent node.js libraries to be bundled by any bundler.
  const stealth_require = eval('require')
  Transport = stealth_require('@ledgerhq/hw-transport-node-hid').default
  Sdk = stealth_require('stellar-sdk')
} else {
  throw new Error('Your environment is not supported by stellar-ledger-wallet library.')
}

/**
 * Methods
 */

let connection, disconnection

/**
 * Connect
 */

ledger.connect = async function (account, index, internalFlag) {
  if (account === undefined) {
    account = ledger.account || 0
    index = ledger.index || 0
    internalFlag = ledger.internalFlag || false
  }

  const path = makePath(account, index, internalFlag)

  /// Be sure disconnection process is finished.
  if (disconnection) {
    await disconnection
    disconnection = null
  }

  /// If the bip path is different we need to go through connect() again.
  if (ledger.path !== path) {
    connection = undefined
    ledger.publicKey = undefined
    ledger.path = path
    ledger.account = account || 0
    ledger.index = index || 0
    ledger.internalFlag = internalFlag || false
  }

  /// Connect & update data only when needed.
  if (!connection) connection = connect()
  return connection
}

function makePath (account, index, internalFlag) {
  let path = `44'/148'/${account}'`
  if (index || internalFlag) path += internalFlag ? "/1'" : "/0'"
  if (index) path += `/${index}'`

  return path
}

async function connect (path) {
  console.log('Attempting ledger connection...')
  ledger.error = undefined
  connection = 'x'
  /// Try to connect until disconnect() is called or until connection happens.
  while (connection && !ledger.publicKey) {
    try {
      if (!ledger.transport) {
        ledger.transport = await Transport.create()
        /// Never triggered.
        // ledger.transport.on('disconnect', onDisconnect)
      }
      if (!ledger.application) {
        ledger.application = new StellarApp(ledger.transport)
        const config = await ledger.application.getAppConfiguration()
        ledger.version = config.version
      }
      Object.assign(ledger, await ledger.application.getPublicKey(ledger.path))
    } catch (error) {
      ledger.error = error
      if (error.id === 'U2FNotSupported') throw error
      /// Have a timeout to avoid spamming application errors.
      await timeout(1000)
    }
  }
}

function timeout (x) {
  return new Promise(function (resolve) { setTimeout(resolve, x) })
}

/**
 * OnDisconnect
 *
 * This doesn't works as Ledger library never call it
 */
function onDisconnect () {
  reset()
  if (typeof ledger.onDisconnect === 'function') ledger.onDisconnect()
}

/**
 * Disconnect
 */

ledger.disconnect = function () {
  if (ledger.transport) console.log(ledger.transport)
  if (ledger.transport) disconnection = ledger.transport.close()
  reset()
  return disconnection
}

function reset () {
  connection = null
  const fields = ['transport', 'application', 'path', 'account', 'index',
    'internalFlag', 'version', 'publicKey']
  fields.forEach(name => ledger[name] = undefined)
}

/**
 * Sign
 */

ledger.sign = async function (transaction) {
  if (!ledger.publicKey) throw new Error('No ledger wallet connected.')

  const app = ledger.application
  const signatureBase = transaction.signatureBase()
  const result = await app.signTransaction(ledger.path, signatureBase)

  const keypair = Sdk.Keypair.fromPublicKey(ledger.publicKey)
  const hint = keypair.signatureHint()
  const decorated = new Sdk.xdr.DecoratedSignature({
    hint: hint, signature: result.signature
  })
  transaction.signatures.push(decorated)

  return transaction
}

/**
 * Exports
 */
module.exports = ledger
