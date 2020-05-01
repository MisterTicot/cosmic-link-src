/* eslint-env jasmine */
"use strict"

const CrudArray = require("../../src/lib/crud-array")
const Signer = require("../../src/model/signer")

const { any } = jasmine

/* Data */

const pubkey = "GABC...WXYZ"
const wallet = "StellarAuthenticator"

const params = { wallet, pubkey }
const signer = new Signer(params)

const pubkey2 = "GABC...WXYZ2"
const params2 = { wallet, pubkey: pubkey2 }
const signer2 = new Signer(params2)

const parameterized = [params, params2]
const stringified = JSON.stringify(parameterized)

/* Specifications */

describe("CrudArray", () => {
  it("returns an instance", () => {
    const crud = new CrudArray(Signer)
    expect(crud).toEqual(any(CrudArray))
    expect(crud.Class).toBe(Signer)
    expect(crud.length).toBe(0)
  })
})

describe("CrudArray instance", () => {
  let crud
  beforeEach(() => {
    crud = new CrudArray(Signer)
  })

  /* Storage */
  describe("$store", () => {
    let storage
    beforeEach(() => {
      storage = { key: stringified }
    })

    it("imports data from storage", () => {
      crud.$store(storage, "key")
      expect(crud.toObject()).toEqual(parameterized)
    })

    it("keeps storage synced", () => {
      crud.$store(storage, "key")
      crud.delete(signer.id)
      expect(storage.key).toEqual(crud.toJson())

      const signer3 = crud.put({ wallet: "foo", pubkey: "bar" })
      signer3.pubkey = "baz"
      expect(storage.key).toEqual(crud.toJson())
    })
  })

  /* Formats */
  describe("toObject", () => {
    it("returns a parameterized version of its data", () => {
      crud.ingest([signer, signer2])
      const array = crud.toObject()
      expect(array).toEqual(parameterized)
    })
  })

  describe("toJson", () => {
    it("returns a stringified version of its data", () => {
      crud.ingest([signer, signer2])
      const string = crud.toJson()
      expect(string).toEqual(stringified)
    })
  })

  describe("ingest", () => {
    it("put() each item of a collection", () => {
      crud.ingest([signer, signer2, params2])
      expect(crud.length).toBe(2)
      expect(crud[0]).toBe(signer)
      expect(crud[1]).toEqual(signer2)
    })
  })

  describe("ingestJson", () => {
    it("put() each item of a stringified collection", () => {
      crud.ingestJson(stringified)
      expect(crud.length).toBe(2)
      expect(crud[0]).toEqual(signer)
      expect(crud[1]).toEqual(signer2)
    })
  })

  /* Primitives */
  describe("put()", () => {

    it("adds an item", () => {
      crud.put(signer)
      expect(crud.length).toBe(1)
      expect(crud[0]).toBe(signer)
    })

    it("adds an item by params", () => {
      crud.put(params)
      expect(crud.length).toBe(1)
      expect(crud[0]).toEqual(signer)
    })

    it("returns the added item", () => {
      const returned = crud.put(signer)
      expect(returned).toBe(signer)

      const signer2 = crud.put(params)
      expect(signer2).toEqual(signer)
    })

    it("replaces a same-id item", () => {
      crud.put(signer)
      const signer2 = crud.put(params)
      expect(signer.id).toBe(signer2.id)
      expect(crud.length).toBe(1)
      expect(crud[0]).toBe(signer2)
    })
  })

  describe("get()", () => {
    it("returns an item by id", () => {
      crud.put(signer)
      const returned = crud.get(signer.id)
      expect(returned).toBe(signer)
    })

    it("returns `undefined`", () => {
      crud.put(signer)
      const returned = crud.get("abcd")
      expect(returned).toBe(undefined)
    })
  })

  describe("delete()", () => {
    it("removes an item by id", () => {
      crud.put(signer)
      crud.delete(signer.id)
      expect(crud.length).toBe(0)
    })

  })
})
