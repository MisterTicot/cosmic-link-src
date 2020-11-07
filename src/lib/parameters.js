"use strict"
/**
 * Parameters
 * */
const { LiveObject } = require("@kisbox/model")
const { xassoc } = require("@kisbox/helpers")

/* Definition */

class Parameters extends LiveObject {}
const proto = Parameters.prototype

/* Format: Query */
Parameters.fromQuery = function (query) {
  if (query[0] !== "?") throw new TypeError(`Not a query: ${query}`)

  const params = new Parameters()
  query
    .substr(1)
    .split("&")
    .forEach((entry) => {
      const key = entry.split("=")[0]
      const value = entry.substr(key.length + 1)
      params[key] = decodeURIComponent(value)
    })

  return params
}

proto.toQuery = function (prefix = "?") {
  let query = ""
  xassoc(this, (value, key) => {
    query += `&${key}=${encodeURIComponent(value)}`
  })

  return `${prefix}${query.substr(1)}`
}

/* Format: Json */
Parameters.fromJson = function (json) {
  return Object.assign(new Parameters(), JSON.parse(json))
}

proto.toJson = function () {
  return JSON.stringify(this, null, 2)
}

/* Export */
module.exports = Parameters
