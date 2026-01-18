"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function P2PNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/p2p", label: "Browse Offers", id: "browse" },
    { href: "/p2p/payment-methods", label: "Payment Methods", id: "payment" },
    { href: "/p2p/apply-agent", label: "Become Agent", id: "agent" },
  ]

  return (
    <div className="border-b border-border">
      <div className="container max-w-lg mx-auto px-4">
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                pathname === item.href
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
