"use client"

import React, { useEffect, useState } from "react"
import { useConnect } from "@stacks/connect-react"
import { StacksTestnet } from "@stacks/network"
import { AnchorMode, PostConditionMode, stringUtf8CV, stringAsciiCV, callReadOnlyFunction } from "@stacks/transactions"
import { userSession } from "./ConnectWallet"

const ContractCallVote = () => {
  const { doContractCall } = useConnect()
  // const [hashString, setHashString] = useState("yo hash string from Next")
  // const [ipfs_cid, setIpfs_Cid] = useState("yo ipfs cid from Next")

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  let network = new StacksTestnet()

  async function readOnly() {
    let result = await callReadOnlyFunction({
      contractAddress: "ST2FND3FF6W7J2115GXVS4M71H5JR8469E7HMQQ90",
      contractName: "evince",
      functionName: "get-last-token-id",
      functionArgs: [],
      network: network,
      senderAddress: userSession.loadUserData().profile.stxAddress.testnet
    })

    console.log(result)
  }

  function prevince(hashString: string, ipfs_cid: string) {
    doContractCall({
      network: new StacksTestnet(),
      anchorMode: AnchorMode.Any,
      contractAddress: "ST2FND3FF6W7J2115GXVS4M71H5JR8469E7HMQQ90",
      contractName: "evince",
      functionName: "prevince",
      functionArgs: [stringAsciiCV(hashString), stringAsciiCV(ipfs_cid)],
      postConditionMode: PostConditionMode.Deny,
      postConditions: [],
      onFinish: data => {
        console.log("onFinish:", data)
        window.open(`https://explorer.hiro.so/txid/${data.txId}?chain=testnet`, "_blank")?.focus()
      },
      onCancel: () => {
        console.log("onCancel:", "Transaction was canceled")
      }
    })
  }

  if (!mounted || !userSession.isUserSignedIn()) {
    return null
  }

  return (
    <>
      <button className="Vote" onClick={() => prevince("yo hash string from Next", "yo ipfs cid from Next")}>
        Evince!
      </button>
      <button onClick={() => readOnly()}>Read Only!</button>
    </>
  )
}

export default ContractCallVote
