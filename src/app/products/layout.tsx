import React from "react"
import { BoldFont } from "../../utils/customFonts"

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <section className={`${BoldFont.variable}`}>
        {children}
    </section>
  )
}
