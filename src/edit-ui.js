"use_strict"
/**
 * Transaction Editing User Interface
 */
const editUI = exports

const cosmicLib = require("cosmic-lib")
const dom = require("@cosmic-plus/jsutils/dom")
const html = require("@cosmic-plus/jsutils/html")
const { CosmicLink, resolve, specs } = cosmicLib
const { capitalize } = require("@cosmic-plus/jsutils/misc")

const FieldUI = require("./field-ui")
const the = require("./shared")

const UIs = { tx: {}, op: [] }

editUI.init = function () {
  paramsUI.init()
  dom.ingest(dom.edit)
}

editUI.refresh = function () {
  the.cosmicLink = new CosmicLink(the.query)
  paramsUI.refresh()
  opsUI.refresh()
}

/**
 * Transaction parameters
 */
const paramsUI = {}

paramsUI.init = function () {
  specs.transactionOptionalFields.forEach(field => {
    const fieldUI = UIs.tx[field] = new FieldUI(field, { optional: true })
    fieldUI.onchange = () => paramsUI.editParam(field)
    html.append(dom.txParamsForm, fieldUI.domNode)
    html.append(dom.addTxParams, fieldUI.addLink)
  })
}

paramsUI.refresh = function () {
  specs.transactionOptionalFields.forEach(field => {
    UIs.tx[field].value = the.cosmicLink.tdesc[field]
  })
}

paramsUI.editParam = function (field) {
  the.cosmicLink.setTxFields({ [field]: UIs.tx[field].value || null })
  the.query = the.cosmicLink.query
  dom.query.textContent = the.query
  history.replaceState("", null, location.pathname + the.query + location.hash)
  paramsUI.refresh()
}

/**
 * Operations User Interface
 */
const opsUI = {}

opsUI.refresh = function () {
  html.clear(dom.operationsForms)
  for (let index in the.cosmicLink.tdesc.operations) {
    const odesc = the.cosmicLink.tdesc.operations[index]
    const operationUI = UIs.op[index] = new OperationUI(odesc)
    html.append(dom.operationsForms, operationUI.domNode)
  }
  // New operation UI
  const operationUI = UIs.op[UIs.op.length] = new OperationUI()
  html.append(dom.operationsForms, operationUI.domNode)
}

opsUI.add = function () {}

/**
 * Operation UI
 */

class OperationUI {
  constructor (odesc = {}, index) {
    this.odesc = odesc

    // Operation Selector
    this.opSelector = html.create(
      "select",
      null,
      html.create("option", { selected: true, hidden: true }, "New Operation")
    )
    operations.forEach(type => {
      html.append(
        this.opSelector,
        html.create("option", { value: type }, operationName[type])
      )
    })
    this.opSelector.onchange = this.refreshOpParams.bind(this)

    this.opParams = html.create("div", null)
    this.domNode = html.create(
      "form",
      null,
      html.create("label", { for: this.opSelector }, "Operation: "),
      this.opSelector,
      this.opParams
    )

    if (odesc.type) {
      this.opSelector.value = odesc.type
      this.refreshOpParams()
    }
  }

  refreshOpParams () {
    html.clear(this.opParams)
    const type = this.opSelector.value

    specs.operationMandatoryFields[type].forEach(field => {
      const fieldUI = new FieldUI(field, { value: this.odesc[field] })
      fieldUI.onchange = "TODO"
      html.append(this.opParams, fieldUI.domNode)
    })

    specs.operationOptionalFields[type].forEach(field => {
      const fieldUI = new FieldUI(field, {
        value: this.odesc[field],
        optional: true
      })
      fieldUI.onchange = "TODO"
      html.append(this.opParams, fieldUI.domNode)
    })
  }
}

/**
 * Specifications
 */

const operations = Object.keys(specs.operationMandatoryFields)
const operationName = {}
operations.forEach(type => {
  const name = capitalize(type.replace(/([A-Z])/g, " $1"))
  operationName[type] = name
})
