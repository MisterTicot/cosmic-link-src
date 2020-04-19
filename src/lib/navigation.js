"use strict"
/**
 * Navigation
 * */
const { View, html } = require("@kisbox/browser")
const { LiveArray } = require("@kisbox/model")

/* Definition */

class Navigation extends View {
  constructor (tabs = []) {
    super(`
<nav>%toNavigationLink:...tabs</nav>
    `)

    this.tabs = LiveArray.from(tabs)
  }
}

/* Helpers */
const helpers = Navigation.helpers

helpers.toNavigationLink = function (tab) {
  const link = html("a", null, tab.title)
  link.onclick = () => this.selectedTabId = tab.id
  this.$on("selectedTabId", selectedTabId => {
    link.className = selectedTabId === tab.id ? "selected" : ""
  })
  return link
}

/* Computations */
const proto = Navigation.prototype

proto.$define("selectedTabView", ["selectedTabId"], function () {
  const tab = this.tabs.find(t => t.id === this.selectedTabId)
  if (tab) return tab.view
})

/* Export */
module.exports = Navigation
