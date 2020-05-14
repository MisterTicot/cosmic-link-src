"use strict"
/**
 * Wallets & signing methods that accept arbitrary transactions as input.
 */
const wallets = exports

/* Data */
wallets.LedgerWallet = {
  name: "Ledger Wallet",
  protocol: "ledgerwallet",
  needSource: true,
  needNetwork: true
}

wallets.TrezorWallet = {
  name: "Trezor Wallet",
  protocol: "trezorwallet",
  needSource: true,
  needNetwork: true
}

wallets.StellarAuthenticator = {
  name: "Stellar Authenticator",
  protocol: "cosmiclink",
  url: "https://stellar-authenticator.org/"
}

wallets.Lobstr = {
  name: "Lobstr Web (partial support)",
  protocol: "sep0007",
  url: "https://lobstr.co/?tx=",
  target: "new"
}

wallets.StellarTerm = {
  name: "StellarTerm (partial support)",
  protocol: "sep0007",
  url: "https://stellarterm.com/?tx=",
  target: "new"
}

wallets.Sep7Wallet = {
  name: "Sep-0007 Wallet",
  protocol: "sep0007",
  url: "web+stellar:",
  target: "external",
  needSource: true,
  needNetwork: true
}

wallets.StellarLaboratory = {
  name: "Stellar Laboratory (Sign)",
  protocol: "stellarlab",
  url: "https://stellar.org/laboratory/#txsigner?xdr=",
  target: "new",
  needSource: true,
  needNetwork: true
}

wallets.StellarLaboratoryView = {
  name: "Stellar Laboratory (View)",
  protocol: "stellarlab",
  url:
    "https://stellar.org/laboratory/#xdr-viewer?type=TransactionEnvelope&input=",
  target: "new",
  needSource: true,
  needNetwork: true
}

wallets.CopyPasteXdr = {
  name: "Copy/Paste XDR",
  protocol: "copy",
  needSource: true,
  needNetwork: true
}
