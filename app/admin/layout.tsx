import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 shrink-0">
        <AdminSidebar />
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
