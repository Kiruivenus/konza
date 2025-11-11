"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Mail, Wallet, Shield, Ban, Eye, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  email: string
  username: string
  walletAddress: string
  balance: number
  usdtBalance: number
  kycStatus: string
  role: string
  createdAt: string
  status?: string
  restrictions?: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<"view" | "edit" | "restrict">("view")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const [restrictionToggles, setRestrictionToggles] = useState({
    canSwap: true,
    canMine: true,
    canTransfer: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()

      if (res.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || "Failed to fetch users")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
      setError("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string, ban: boolean) => {
    setUpdating(true)
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: ban ? "banned" : "active" }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: `User ${ban ? "banned" : "unbanned"} successfully`,
        })
        fetchUsers()
        setSelectedUser(null)
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update user status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateRestrictions = async () => {
    if (!selectedUser) return

    setUpdating(true)
    try {
      const restrictions: string[] = []
      if (!restrictionToggles.canSwap) restrictions.push("swap")
      if (!restrictionToggles.canMine) restrictions.push("mine")
      if (!restrictionToggles.canTransfer) restrictions.push("transfer")

      console.log("[v0] Updating restrictions:", { userId: selectedUser._id, restrictions })

      const res = await fetch("/api/admin/users/restrict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          restrictions,
        }),
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "User restrictions updated successfully",
        })
        fetchUsers()
        setSelectedUser(null)
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update restrictions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to update restrictions:", error)
      toast({
        title: "Error",
        description: "Failed to update restrictions",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({users.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{user.email}</p>
                      {user.role === "admin" && <Badge variant="destructive">Admin</Badge>}
                      {user.status === "banned" && <Badge variant="destructive">Banned</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="font-mono text-sm text-muted-foreground">{user.walletAddress}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>KZC: {user.balance?.toFixed(2) || "0.00"}</span>
                      <span>USDT: {user.usdtBalance?.toFixed(2) || "0.00"}</span>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>KYC: {user.kycStatus || "Not Submitted"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSelectedUser(user)
                        setViewMode("view")
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(user)
                        setRestrictionToggles({
                          canSwap: !user.restrictions?.includes("swap"),
                          canMine: !user.restrictions?.includes("mine"),
                          canTransfer: !user.restrictions?.includes("transfer"),
                        })
                        setViewMode("restrict")
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Restrict
                    </Button>
                    <Button
                      onClick={() => handleBanUser(user._id, user.status !== "banned")}
                      variant={user.status === "banned" ? "default" : "destructive"}
                      size="sm"
                      className="gap-2"
                      disabled={updating}
                    >
                      <Ban className="h-4 w-4" />
                      {user.status === "banned" ? "Unban" : "Ban"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewMode === "view" ? "User Details" : viewMode === "edit" ? "Edit User" : "Manage Restrictions"}
            </DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          {selectedUser && viewMode === "view" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Username</Label>
                  <p className="text-sm">{selectedUser.username}</p>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                <div className="space-y-1">
                  <Label>Wallet Address</Label>
                  <p className="text-sm font-mono">{selectedUser.walletAddress}</p>
                </div>
                <div className="space-y-1">
                  <Label>KYC Status</Label>
                  <p className="text-sm">{selectedUser.kycStatus}</p>
                </div>
                <div className="space-y-1">
                  <Label>KZC Balance</Label>
                  <p className="text-sm">{selectedUser.balance?.toFixed(4) || "0.0000"} KZC</p>
                </div>
                <div className="space-y-1">
                  <Label>USDT Balance</Label>
                  <p className="text-sm">{selectedUser.usdtBalance?.toFixed(4) || "0.0000"} USDT</p>
                </div>
                <div className="space-y-1">
                  <Label>Joined</Label>
                  <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Badge variant={selectedUser.status === "banned" ? "destructive" : "default"}>
                    {selectedUser.status || "Active"}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {selectedUser && viewMode === "restrict" && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Can Swap</Label>
                    <p className="text-sm text-muted-foreground">Allow user to swap tokens</p>
                  </div>
                  <Switch
                    checked={restrictionToggles.canSwap}
                    onCheckedChange={(checked) => setRestrictionToggles({ ...restrictionToggles, canSwap: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Can Mine</Label>
                    <p className="text-sm text-muted-foreground">Allow user to mine tokens</p>
                  </div>
                  <Switch
                    checked={restrictionToggles.canMine}
                    onCheckedChange={(checked) => setRestrictionToggles({ ...restrictionToggles, canMine: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Can Transfer</Label>
                    <p className="text-sm text-muted-foreground">Allow user to send/receive tokens</p>
                  </div>
                  <Switch
                    checked={restrictionToggles.canTransfer}
                    onCheckedChange={(checked) =>
                      setRestrictionToggles({ ...restrictionToggles, canTransfer: checked })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateRestrictions} disabled={updating}>
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Restrictions
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
