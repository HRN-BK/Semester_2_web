"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

const navItems = [
    { name: "Tổng quan", href: "/" },
    { name: "Phiên học", href: "/sessions" },
    { name: "Môn học", href: "/subjects" },
    { name: "Nhiệm vụ", href: "/tasks" },
    { name: "Lịch học", href: "/calendar" },
    { name: "Ghi chú", href: "/lessons" },
    { name: "Báo cáo", href: "/report" },
  ]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Quản lý học tập</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "hover:bg-primary/10",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}