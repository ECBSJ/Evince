import { Cl, ClarityType } from "@stacks/transactions"
import { describe, expect, it, assert } from "vitest"

const accounts = simnet.getAccounts()
const address1 = accounts.get("wallet_1")!
const address2 = accounts.get("wallet_2")!

describe("testing simnet and testing suite is ready", () => {
  it("ensures simnet is well initalised", () => {
    expect(simnet.blockHeight).toBeDefined()
  })
})

describe("test `prevince` public function", () => {
  it("evince a missive", () => {
    const evinceResponse = simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("70f9fe7e9f81d3a4bd4a5415c0741d2559ee433c5130bad2711ae6957376b020"), Cl.stringAscii("bafyreidzphn3ukgscrdhmu4adyx26chotk7nblfeoj47u4b2n3sdirhpea")], address1)
    expect(evinceResponse.result).toHaveClarityType(ClarityType.ResponseOk)
    expect(evinceResponse.result).toBeOk(Cl.bool(true))

    expect(evinceResponse.events).toHaveLength(2)
    let firstEvent = evinceResponse.events[0]
    expect(firstEvent.event).toBe("nft_mint_event")
    expect(firstEvent.data.value).toBeUint(1)
    let secondEvent = evinceResponse.events[1]
    expect(secondEvent.event).toBe("print_event")
    expect(secondEvent.data.value).toBeTuple({
      id: Cl.uint(1),
      "missive-hash": Cl.stringAscii("70f9fe7e9f81d3a4bd4a5415c0741d2559ee433c5130bad2711ae6957376b020"),
      "ipfs-cid": Cl.stringAscii("bafyreidzphn3ukgscrdhmu4adyx26chotk7nblfeoj47u4b2n3sdirhpea"),
      author: Cl.principal(address1)
    })
  })

  it("checks original author indexing", () => {
    simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("first message hash"), Cl.stringAscii("first ipfs cid")], address1)

    simnet.mineEmptyBlock()

    simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("second message hash"), Cl.stringAscii("second ipfs cid")], address1)

    let { result } = simnet.callReadOnlyFn("evince", "get-author-to-missives", [], address1)
    expect(result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2)]))
  })

  it("asserts immutable author indexing after transfer", () => {
    simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("first message hash"), Cl.stringAscii("first ipfs cid")], address1)
    simnet.mineEmptyBlock()
    simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("second message hash"), Cl.stringAscii("second ipfs cid")], address1)
    simnet.mineEmptyBlock()

    let transferResponse = simnet.callPublicFn("evince", "transfer", [Cl.uint(1), Cl.principal(address1), Cl.principal(address2)], address1)
    expect(transferResponse.result).toHaveClarityType(ClarityType.ResponseOk)
    simnet.mineEmptyBlock()

    let getOwnerResponse = simnet.callReadOnlyFn("evince", "get-owner", [Cl.uint(1)], address2)
    expect(getOwnerResponse.result).toBeOk(Cl.some(Cl.principal(address2)))

    let { result } = simnet.callReadOnlyFn("evince", "get-author-to-missives", [], address1)
    expect(result).toBeSome(Cl.list([Cl.uint(1), Cl.uint(2)]))
  })

  it("asserts ipfs-cid retrieval", () => {
    simnet.callPublicFn("evince", "prevince", [Cl.stringAscii("first message hash"), Cl.stringAscii("first ipfs cid")], address1)
    simnet.mineEmptyBlock()

    let { result } = simnet.callReadOnlyFn("evince", "get-missive", [Cl.uint(1)], address1)
    expect(result).toHaveClarityType(ClarityType.OptionalSome)
    expect(result).toBeSome(
      Cl.tuple({
        "missive-hash": Cl.stringAscii("first message hash"),
        "ipfs-cid": Cl.stringAscii("first ipfs cid"),
        author: Cl.principal(address1)
      })
    )

    assert(Cl.prettyPrint(result.value.data["ipfs-cid"]), Cl.prettyPrint(Cl.stringAscii("first ipfs cid")))
    expect(result.value.data["ipfs-cid"]).toBeAscii("first ipfs cid")
  })
})
