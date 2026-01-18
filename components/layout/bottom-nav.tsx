"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, ArrowLeftRight, Wallet, Settings, HandshakeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard?tab=home", icon: Home, label: "Home", tab: "home" },
  { href: "/dashboard?tab=swap", icon: ArrowLeftRight, label: "Swap", tab: "swap" },
  { href: "/dashboard?tab=p2p", icon: HandshakeIcon, label: "P2P", tab: "p2p" },
  { href: "/dashboard?tab=wallet", icon: Wallet, label: "Wallet", tab: "wallet" },
  { href: "/dashboard?tab=settings", icon: Settings, label: "Settings", tab: "settings" },
]

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "home"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab

            return (
              <Link
                key={item.tab}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
