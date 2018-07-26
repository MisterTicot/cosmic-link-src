/**
 * async ledgerWallet.connect([accountNumber])
 * ledgerWallet.disconnect()
 *
 * // After connection succeed
 * ledgerWallet.publicKey
 * async ledgerWallet.sign(transaction)
 * ledgerWallet.application
 * ledgerWallet.transport
 * ledgerWallet.account
 * ledgerWallet.path
 *
 * // After connection fail
 * ledgerWallet.error
 */

const ledger = exports

const Transport = require('@ledgerhq/hw-transport-u2f').default
const StellarApp = require('@ledgerhq/hw-app-str').default

let connection

ledger.connect = async function (account) {
  if (account === undefined) account = ledger.account || 0
  if (ledger.publicKey && ledger.account !== account) ledger.disconnect()
  if (!connection) connection = connect(account)
  return connection
}

async function connect (account) {
  console.log('Attempting ledger connection...')
  ledger.error = undefined
  connection = 'x'
  while (connection && !ledger.publicKey) {
    try {
      ledger.transport = await Transport.create()
      ledger.application = new StellarApp(ledger.transport)
      ledger.config = await ledger.application.getAppConfiguration()
      ledger.path = "44'/148'/" + account + "'"
      Object.assign(ledger, await ledger.application.getPublicKey(ledger.path))
      ledger.account = account
    } catch (error) {
      reset()
      ledger.error = error
      if (error.id === 'U2FNotSupported') throw error
      await timeout(1000)
    }
  }
}

ledger.disconnect = function () {
  connection = null
  reset()
}

function reset () {
  const fields = ['transport', 'application', 'config', 'account', 'path', 'publicKey']
  for (let name in fields) ledger[name] = undefined
}

ledger.sign = async function (transaction) {
  if (!ledger.publicKey) throw new Error('No ledger wallet connected.')

  const app = ledger.application
  const signatureBase = transaction.signatureBase()
  const result = await app.signTransaction(ledger.path, signatureBase)

  const keypair = StellarSdk.Keypair.fromPublicKey(ledger.publicKey)
  const hint = keypair.signatureHint()
  const decorated = new StellarSdk.xdr.DecoratedSignature({
    hint: hint, signature: result.signature
  })
  transaction.signatures.push(decorated)

  return transaction
}

function timeout (x) {
  return new Promise(function (resolve) { setTimeout(resolve, x) })
}
