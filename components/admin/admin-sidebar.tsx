"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Shield,
  DollarSign,
  ArrowLeftRight,
  Pickaxe,
  Gift,
  Settings,
  LogOut,
  GiftIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/kyc", icon: Shield, label: "KYC Requests" },
  { href: "/admin/price", icon: DollarSign, label: "Coin Price" },
  { href: "/admin/swaps", icon: ArrowLeftRight, label: "Swaps" },
  { href: "/admin/mining", icon: Pickaxe, label: "Mining" },
  { href: "/admin/referrals", icon: Gift, label: "Referrals" },
  { href: "/admin/distribute", icon: GiftIcon, label: "Distribute Coins" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-primary">KZC Admin</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-3">
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
