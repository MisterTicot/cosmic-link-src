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
