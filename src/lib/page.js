"use strict"
/**
 * Web application pages that are embeded into URL hash.
 *
 * @exports Page
 */
const { dom, html } = require("@kisbox/browser")
dom.main = html.grab("main")

/* Definition */

class Page {
  static resolve (hash) {
    return Page.table[hash]
  }

  static add (title, domNode) {
    const page = new Page(title, domNode)
    Page.table[page.hash] = page

    html.append(dom.main, page.contentNode)
    if (dom.nav) html.append(dom.nav, page.linkNode)

    if (location.hash === page.hash) page.select()
    else html.hide(page.contentNode)

    return page
  }

  static select (hash) {
    const page = Page.resolve(hash)
    if (page) page.select()
    else throw new Error(`Can't find page: ${hash}`)
  }

  static list () {
    return Object.values(Page.table)
  }

  constructor (title, domNode) {
    this.title = title
    if (!domNode.id) domNode.id = title.toLowerCase()
    this.hash = `#${domNode.id}`

    if (!domNode.parentNode) dom.ingest(domNode)
    domNode.classList.add("page")
    this.contentNode = domNode

    this.linkNode = html("a", [title])
    this.linkNode.onclick = () => this.select()
  }

  get isSelected () {
    return Page.current === this
  }

  select () {
    if (this.isSelected) return
    else if (Page.current) Page.current.unselect()

    history.replaceState("", null, location.search + this.hash)
    html.show(this.contentNode)
    this.linkNode.className = "selected"
    this.linkNode.onclick = undefined
    Page.current = this

    if (this.onSelect) this.onSelect(this)
  }

  unselect () {
    if (Page.current === this) {
      history.replaceState("", null, location.search)
      html.hide(this.contentNode)
      this.linkNode.className = null
      this.linkNode.onclick = () => this.select()
      Page.current = undefined
    }
  }
}

Page.table = {}
Page.current = undefined

/* Exports */
module.exports = Page
