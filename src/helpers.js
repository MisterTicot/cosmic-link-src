"use_strict"
/**
 * Generic helpers
 */
const helpers = exports

const dom = require("@cosmic-plus/jsutils/dom")
const html = require("@cosmic-plus/jsutils/html")

/*******************************************************************************
 * Form Elements Helpers
 */

helpers.enableButton = function (button, value, onclick) {
  if (typeof value === "string") button.value = value
  button.onclick = onclick
  button.disabled = false
}

helpers.disableButton = function (button, value) {
  if (typeof value === "string") button.value = value
  button.disabled = true
}

helpers.readWriteBox = function (box, placeholder, value) {
  if (typeof value === "string") box.value = value
  if (typeof placeholder === "string") box.placeholder = placeholder
  box.disabled = false
  box.readOnly = false
  box.onclick = undefined
  box.style.cursor = "initial"
}

helpers.readOnlyBox = function (box, value) {
  if (typeof value === "string") box.value = value
  box.disabled = false
  box.readOnly = true
  box.onclick = () => helpers.copyContent(box)
  box.style.cursor = "pointer"
}

helpers.disableBox = function (box, placeholder) {
  helpers.readWriteBox(box, placeholder, "")
  box.disabled = true
}

/*******************************************************************************
 * Other Helpers
 */

helpers.display = function (element, type = "", message = "") {
  const classname = type ? "." + type : null
  const messageNode = classname
    ? html.create("span", classname, message)
    : message
  html.rewrite(element, html.create("span", classname, messageNode))
}

helpers.showIf = function (flag, element) {
  flag ? html.show(element) : html.hide(element)
}

helpers.switchPage = function (from, to) {
  html.append(dom.body, from)
  html.append(dom.main, to)
}

helpers.copyContent = function (element) {
  if (html.copyContent(element) && document.activeElement.value) {
    const prevNode = html.grab("#copied")
    if (prevNode) html.destroy(prevNode)
    const copiedNode = html.create("span", "#copied", "Copied")
    element.parentNode.insertBefore(copiedNode, element)
    setTimeout(() => {
      copiedNode.hidden = true
    }, 3000)
  }
}
