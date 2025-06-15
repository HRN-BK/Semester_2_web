
import { Toaster } from "react-hot-toast"
import "./globals.css"
import { Metadata } from "next"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "Quản lý học tập",
  description: "Ứng dụng quản lý học tập",
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Header />
        <main className="container py-6">
          {children}
        </main>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
