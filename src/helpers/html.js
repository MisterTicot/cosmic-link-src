"use strict"
/**
 * HTML Helpers
 */
const my = exports

const { html } = require("@kisbox/browser")
const { timeout } = require("@kisbox/helpers")

/* Library */

my.copyContent = function (element) {
  if (!(html.copyContent(element) && document.activeElement.value)) {
    return
  }

  const prevNode = html.grab("#copied")
  if (prevNode) html.destroy(prevNode)

  const copiedTag = html("span", { id: "copied" }, "⇠ Copied")
  html.insertBefore(element, copiedTag)

  return timeout(3000).then(() => html.hide(copiedTag))
}
