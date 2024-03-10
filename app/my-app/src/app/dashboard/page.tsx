"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TheRedButton, TheGreenButton } from "../../components/button"

export default function DashboardPage() {
  const [durrError, setDurrError] = useState(false)

  function throwError() {
    setDurrError(true)
  }

  if (durrError) {
    throw new Error("error works")
  }

  // setTimeout(() => {
  //   throwError()
  // }, 2000)

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        Dashboad Page
        <TheRedButton>yo im red</TheRedButton>
        <TheGreenButton>yea and im green</TheGreenButton>
        <Link href={"/"}>Go to Home</Link>
        <button onClick={() => throwError()}>init error</button>
      </main>
    </>
  )
}
