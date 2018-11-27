"use_strict"
/**
 * Field UI
 */
const html = require("@cosmic-plus/jsutils/html")
const { check, specs } = require("cosmic-lib")
const { capitalize } = require("@cosmic-plus/jsutils/misc")

module.exports = class FieldUI {
  constructor (field, options = {}) {
    this.field = field

    this.inputs = new FieldInputs(field)
    this.inputs.onchange = () => this.onchange && this.onchange()

    this.domNode = html.create("div", null,
      html.create("label", null, `${fieldDesc[field]}: `),
      ...this.inputs
    )

    this.isOptional = options.optional
    if (this.isOptional) {
      this.addLink = html.create("a", { onclick: () => this.add() }, `+${field}`)
    }

    this.value = options.value
  }

  get value () {
    return this.inputs.get()
  }

  set value (value) {
    if (value || !this.isOptional) {
      this.inputs.set(value)
      this.show()
    } else {
      this.hide()
    }
  }

  add () {
    this.show()
    this.inputs.select()
  }

  show () {
    html.show(this.domNode)
    if (this.addLink) html.hide(this.addLink)
  }

  hide () {
    html.hide(this.domNode)
    if (this.addLink) html.show(this.addLink)
  }
}

/**
 * Field Inputs Controller
 */

class FieldInputs extends Array {
  static setTemplate (type, methods) {
    methods.__proto__ = FieldInputs.template.default
    FieldInputs.template[type] = methods
  }

  static getTemplate (type) {
    return FieldInputs.template[type] || FieldInputs.template.default
  }

  constructor (field) {
    super()
    this.field = field
    Object.assign(this, FieldInputs.getTemplate(field))
    this.make()
    this.forEach(field => field.onchange = () => {
      if (this.check()) this.onchange && this.onchange()
    })
  }
}

/**
 * Field Inputs Templates
 */
FieldInputs.template = {}

FieldInputs.template.default = {
  make: function () {
    this.push(html.create("input", { type: "text" }))
  },
  set: function (value = "") {
    this[0].value = value
  },
  get: function () {
    return this[0].value
  },
  select: function () {
    this[0].select()
  },
  check: function () {
    try {
      check[this.field](this.get())
      this[0].className = undefined
    } catch (error) {
      console.error(error)
      this[0].className = "error"
    }
  }
}

FieldInputs.setTemplate("asset", {
  make: function () {
    this.push(html.create("input", { type: "text" }))
    this.push(html.create("label", null, "Asset Issuer:"))
    this.push(html.create("input", { type: "text" }))
  },
  set: function (asset = {}) {
    this[0].value = asset.code || "XLM"
    this[1].value = asset.value || ""
  },
  get: function () {
    return { code: this[0].value, issuer: this[1].value }
  }
})

FieldInputs.setTemplate("memo", {
  make: function () {
    this.push(html.create("select"))
    memoTypes.forEach(type => {
      html.append(this[0], html.create("option", { value: type }, type))
    })
    this.push(html.create("input", { type: "text" }))
  },
  set: function (memo) {
    this[0].value = memo.type || "text"
    this[1].value = memo.value || ""
  },
  get: function () {
    if (this[0].value !== "none") return `${this[0].value}:${this[1].value}`
  },
  select: function () {
    this[1].select()
  }
})

/**
 * Specifications
 */

const fieldDesc = Object.assign(specs.fieldDesc, {
  buying: "Buy Asset",
  selling: "Sell Asset"

})
Object.keys(specs.fieldType).forEach(field => {
  if (!fieldDesc[field]) {
    fieldDesc[field] = capitalize(field.replace(/([A-Z])/g, " $1"))
  }
})

const memoTypes = ["text", "base64", "id", "hash", "return", "none"]
