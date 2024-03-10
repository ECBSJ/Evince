import type { Metadata } from "next"
import { Inter } from "next/font/google"
import styles from "./styles.module.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "the dashboard",
  description: "ur on the dashboard"
}

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <section className={styles.dashboard}>{children}</section>
}
