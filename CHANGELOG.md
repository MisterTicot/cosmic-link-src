# Changelog

All notable changes to this project will be documented in this file.

This project adheres to **[Semantic
Versioning](https://semver.org/spec/v2.0.0.html)**. Version syntax is
`{major}.{minor}.{patch}`, where a field bump means:

- **Patch**: The release contains bug fixes.
- **Minor**: The release contains backward-compatible changes.
- **Major**: The release contains compatibility-breaking changes.

**Remember:** Both micro and minor releases are guaranteed to respect
backward-compatibility and can be updated to without risk of breakage. For major
releases, please check this changelog before upgrading.

## 2.0.0-beta.7 - 2020-07-12

### Added

- UI: Add Keybase-specific signing flow. (Keybase is now the default signing
  method)

## 2.0.0-beta.6 - 2020-07-08

### Fixed

- UI: Fix SideFrame closing for hardware wallet & test account.

## 2.0.0-beta.5 - 2020-07-08

### Added

- UI: Add "Test Account" signing method.
- UI: Save network/accountId accross sessions. (CosmicLink v1 feature catchup)
- UI: Show details for failed transactions. (CosmicLink v1 feature catchup)
- UI: List signers when relevant. (CosmicLink v1 feature catchup)

### Fixed

- Style: Fix network selector on small screens.
- UI: Fix "about" tab blinking at loading.

## 2.0.0-beta.4 - 2020-06-21

### Added

- UI: Better handling of the no-transaction case.

### Changed

- UI: Upgrade graphic style.

### Fixed

- UI: Fix a typo.

## 2.0.0-beta.3 - 2020-05-17

### Added

- UI: Add handler "StellarLaboratory (View)".

### Fixed

- Meta: Fix depends.
- UI: Fix XDR copying.
- UI: Fix QrCode switcher.

## 2.0.0-beta.2 - 2020-04-26

### Fixed

- UI: Fix anti-tamper robot.
- UI: Fix 'about' page display.

## 2.0.0-beta.1 - 2020-04-19

This is a rewrite ontop of Kisbox, providing identical features than the latest
v1.

## 1.15.1 - 2020-02-24

### Fixed

- Logic: Fix a case were Trezor signatures were wrong. (Thanks
  [@Tyvdh](https://github.com/tyvdh))

## 1.15.2 - 2020-02-29

### Fixed

- Logic: Fix a bug that caused XDR generation to fail. When using Cosmic.link
  for the first time, users sometime faced a "No horizon node for that network"
  error.
- UI: Fix a bug that prevented XDR URL update. When users signed an XDR-based
  request using a hardware wallet, the URL was supposed to get refreshed to
  include the signature but wasn't. (Thanks [@Tyvdh](https://github.com/tyvdh))

## 1.15.0 - 2020-01-04

### Changed

- Logic: Upgrade @cosmic-plus/ledger-wallet to 2.x.

## 1.14.0 - 2019-12-07

### Changed

- UI: Improve transaction submission report. Callbacks & StellarGuard errors are
  now properly handled. (Thanks [@dexter0x8](https://keybase.io/dexter0x8))

### Fixed

- Logic: Fix a bug that could prevent tx submission. It was happening when
  submitting from the widget using hardware wallets. (Thanks
  [@dexter0x8](https://keybase.io/dexter0x8)

## 1.13.3 - 2019-12-02

### Fixed

- Logic: Fix transaction error handling. In some cases the error was not
  properly displayed. (Thanks [u/Eth_Man](https://reddit.com/u/Eth_Man))

## 1.13.2 - 2019-11-30

### Fixed

- UI: Improve pubkey account box description. (Thanks [@b1tcc])

## 1.13.1 - 2019-11-27

### Fixed

- Logic: Fix Lobstr/StellarTerm redirections.

## 1.13.0 - 2019-11-27

### Added

- UI: Add transaction validation report. This includes explanations of what went
  wrong in case of error.
- UI: Add wallets: `Lobstr Web`, `StellarTerm`. At this time, those wallets only
  support `payment` and `changeTrust` operations, on the public network.

## 1.12.0 - 2019-11-26

### Changed

- Logic: Update [@cosmic-plus/ledger-wallet] to 1.5.0. (bugfixes)

### Fixed

- Logic: Widget doesn't need to preload fonts.

## 1.11.2 - 2019-11-23

### Fixed

- Logic: Fix ServiceWorker installation.

## 1.11.1 - 2019-11-23

### Fixed

- Logic: Fix fonts url.

## 1.11.0 - 2019-11-23

### Added

- Logic: Add asynchronous loading of style resources. This speeds up page
  display.
- UI: Add dynamic QR code scaling.

### Changed

- Logic: Make QR code generation asynchronous. This speeds up page loading.
- UI: Vertically center Cosmic.link main UI.
- UI: Vertically center `widget.html`.

### Fixed

- Logic: Prevent loading of unused resources. Some GUI-related resources were
  loaded even when immediately redirecting to wallet.
- Logic: Install `widget` into browser cache.
- UI: Use compressed fonts. This speeds-up text display.

## 1.10.1 - 2019-11-18

### Fixed

- Meta: Include fonts with the installed files. This speeds up the loading time.

## 1.10.0 - 2019-11-16

### Changed

- UI: Rewrite the "About" tab.

### Fixed

- Logic: Fix the direct link toward the help tab.

## 1.9.0 - 2019-11-15

### Changed

- Style: Upgrade graphic design.

### Fixed

- API: Update [cosmic-lib] to 2.2.1.
- Meta: Add missing file to installation bundle. The recently
  `vendors~app~ledger.js` was not part of cache-installed files.
- Meta: Remove unused CSP from `widget.html`.

## 1.8.1 - 2019-11-09

### Fixed

- API: Update [cosmic-lib] to 2.2.1.

## 1.8.0 - 2019-11-02

### Added

_Note:_ The following options can be combined tother like normal query
parameters. For example:
<https://cosmic.link/widget?setOptions#qrcode=true&handler=Sep7Wallet>.

- API: Add widget option `#qrcode=true|false`. This option accepts a _Boolean_.
  It controls the QRCode div display. When missing, the user last choice apply.

  Example: <https://cosmic.link/widget?setOptions#qrcode=true>

- API: Add widget option `#handler={handler}`. This option accepts a transaction
  handler name. It controls the default signing method. When missing, the user
  last choice is applied.

  <https://cosmic.link/widget> displays the list of valid handlers in the dev
  console.

  At this time, valid handlers are: `StellarAuthenticator`, `LedgerWallet`,
  `TrezorWallet`, `Sep7Wallet`, `StellarLaboratory` and `CopyPasteXdr`.

  Example: <https://cosmic.link/widget?setOptions#handler=LedgerWallet>

- API: Add widget option `#css={path}`. This option accepts a CSS file that is
  hosted on the widget parent. In other words, the file must lives at
  `${parent.domain}/${path}`. This CSS file is then used **instead** of the
  default [widget.css].

- API: Add widget option `#css+={path}`. This option accepts a CSS file that is
  hosted on the widget parent. In other words, the file must lives at
  `${parent.domain}/${path}`. This CSS file is then used **on top** of the
  default [widget.css].

### Fixed

- API: Fix support of <https://cosmic.link/widget>.
  <https://cosmic.link/widget.html> was working correctly, but the shorten URL
  wasn't.

- UI: Fix widget styles. (center the interface; use transparent background)

## 1.7.1 - 2019-10-28

### Fixed

- UI: Fix automatic redirection. (broked by a regression introduced with
  1.4.0)

## 1.7.0 - 2019-10-26

### Added

- API: Add protocol 12 compatibility. (see [protocol 12
  update](https://www.stellar.org/developers/blog/horizon-v0-22-0-released-protocol-12-support/#about-protocol-12))

## 1.6.0 - 2019-10-19

### Changed

- Logic: Upgrade [@cosmic-plus/trezor-wallet] to 0.3.x. (Better support)

## 1.5.0 - 2019-10-05

### Changed

- Logic: Upgrade [@cosmic-plus/trezor-wallet] to 0.2.x.

## 1.4.2 - 2019-10-05

### Fixed

- UI: Allow TrezorConnect to style its modal box. TrezorConnect displays this
  box when the browser blocks the connection/signing pop-up.

## 1.4.1 - 2019-09-30

### Fixed

- Meta: Fix the update process. A mistake introduced with 1.4.0 prevented to
  install the update.

## 1.4.0 - 2019-09-28

### Added

- UI: Add the Cosmic.link widget. This is a neutral transaction signing
  interface that is meant to be embedded into other applications. This can be
  done using `<iframe src="https://cosmic.link/widget.html?{cosmic_query}">`.
  Applications can host the widget on their domain by forking
  [https-cosmic-link].
  [https-cosmic-link](https://git.cosmic.plus/https-cosmic-link)
- UI: Add Trezor Wallet support (beta).

## 1.3.0 - 2019-09-14

### Added

- UI: Add a link to register as a SEP-0007 handler.

## 1.2.1 - 2019-09-07

### Fixed

- Logic: Fix a regression in worker installation. (Introduced with 1.2.0)

## 1.2.0 - 2019-09-07

### Changed

- API: Upgrade [cosmic-lib] to 2.x. (protocol changes)

### Fixed

- Meta: Fix a rare application upgrade bug. Bypass browser cache when fetching
  latest release to prevent possible unconsistent upgrade.

## 1.1.2 - 2019-09-02

### Fixed

- UI: Fix 'Go to ...' buttons. This fixes two regressions introduced with 1.1.1.

## 1.1.1 - 2019-09-02

### Fixed

- Api: Update [cosmic-lib] to 1.8.1. (fix regression)
- UI: Fix opening SEP-0007 from iframe.
- UI: Remove a meaningless error message. It was appearing when selecting Ledger
  Wallet signing method while there was no transaction.
- UI: Fix custom network selection. The checkbox had no effect anymore because
  of a regression introduced in a previous update.

## 1.1.0 - 2019-08-31

### Changed

- Security: strengthen Content-Security-Policy. `form-action 'none'` has been
  added.
- Api: update [cosmic-lib] to 1.8.0.

## 1.0.0 - 2019-08-10

**Note:** This major release doesn't contain any breaking change. The version
bump only means that this software is public and stable.

### Added

- Add SEP-0007 `pay` support.

### Fixed

- Fix Ledger Wallet support for older browsers.

## 0.17.2 - 2019-07-27

### Changed

- Improve display on smallest and biggest screens.
- Automate release procedure.

## 0.17.1 - 2019-06-18

### Changed

- Update [cosmic-lib] to 1.5.1. (Security fix)
- Automatically reload the application once an update gets installed.

## 0.17.0 - 2019-06-08

### Changed

- Update [cosmic-lib] to 1.5.0. (Protocol 11 support)

## 0.16.14 - 2019-05-17

### Changed

- Update [cosmic-lib] to 1.4.1.
- Improve compliance with the [PWA] standard.
- Improve loading time.

## 0.16.13 - 2019-04-19

### Changed

- Update [cosmic-lib] to 1.3.0.

## 0.16.12 - 2019-04-12

### Changed

- Update [cosmic-lib] to 1.2.10.

## 0.16.11 - 2019-03-04

### Changed

- Update [stellar-sdk] to 0.14.0.
- Improve application caching.

## 0.16.10 - 2019-02-14

### Add

- Support embedded environments such as Iframes.

### Fix

- Fix a case where the wrong network was used when signing with Stellar
  laboratory.

## 0.16.9 - 2019-02-06

### Changed

- Update [stellar-sdk] to 0.13.0.

## 0.16.8 - 2019-02-01

### Changed

- Improve transaction display.
- Update webpage metadata.

## 0.16.7 - 2019-01-29

### Fix

- Fix a frame glitch due to Ledger wallet libraries.
- Load CSS in time.

## 0.16.6 - 2018-01-18

### Changed

- Update publickey aliases.

## Older Releases

There is no changelog for older releases. Please look take a look at the [commit
history](https://github.com/cosmic-plus/webapp-cosmic-link/commits/master).

[cosmic-lib]: https://github.com/cosmic-plus/node-cosmic-lib/blob/master/CHANGELOG.md
[stellar-sdk]: https://github.com/stellar/js-stellar-sdk/blob/master/CHANGELOG.md
[pwa]: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Introduction
[widget.css]: https://github.com/cosmic-plus/https-cosmic-link/blob/master/widget.css
[@b1tcc]: https://keybase.io/b1tcc
[@cosmic-plus/ledger-wallet]: https://cosmic.plus/#view:js-ledger-wallet/CHANGELOG
[@cosmic-plus/trezor-wallet]: https://cosmic.plus/#view:js-trezor-wallet/CHANGELOG
