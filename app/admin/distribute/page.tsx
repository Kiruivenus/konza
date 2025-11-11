"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  email: string
  balance: number
}

type DistributionType = "single" | "all"
type CommentType = "bonus" | "appreciation_bonus" | "airdrop" | "other"

export default function DistributePage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [distributionType, setDistributionType] = useState<DistributionType>("single")
  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("")
  const [commentType, setCommentType] = useState<CommentType>("bonus")
  const [customComment, setCustomComment] = useState("")
  const [totalUsers, setTotalUsers] = useState(0)
  const [distributing, setDistributing] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users || [])
        setTotalUsers(data.users?.length || 0)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    }
  }

  const getCommentDisplay = () => {
    if (commentType === "other" && customComment) {
      return customComment
    }
    return commentType.replace("_", " ").charAt(0).toUpperCase() + commentType.replace("_", " ").slice(1)
  }

  const handleDistribute = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (distributionType === "single" && !username) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    if (commentType === "other" && !customComment) {
      toast({
        title: "Error",
        description: "Please enter a custom comment",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmDistribution = async () => {
    setDistributing(true)
    try {
      const payload = {
        type: distributionType,
        amount: Number.parseFloat(amount),
        comment: getCommentDisplay(),
        username: distributionType === "single" ? username : undefined,
      }

      const res = await fetch("/api/admin/distribute-coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Success",
          description: `Distributed ${amount} KZC to ${distributionType === "all" ? "all users" : username}`,
        })
        setUsername("")
        setAmount("")
        setCustomComment("")
        setCommentType("bonus")
        setShowConfirmDialog(false)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to distribute coins",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Distribution error:", error)
      toast({
        title: "Error",
        description: "Failed to distribute coins",
        variant: "destructive",
      })
    } finally {
      setDistributing(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Distribute Coins</h1>
        <p className="text-muted-foreground">Distribute KZC coins to users with a reason/comment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Distribution Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Distribution Type */}
              <div className="space-y-3">
                <Label>Distribution Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={distributionType === "single" ? "default" : "outline"}
                    onClick={() => setDistributionType("single")}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Single User
                  </Button>
                  <Button
                    variant={distributionType === "all" ? "default" : "outline"}
                    onClick={() => setDistributionType("all")}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    All Users
                  </Button>
                </div>
              </div>

              {/* Username Input (for single user) */}
              {distributionType === "single" && (
                <div className="space-y-3">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    list="usernames"
                  />
                  <datalist id="usernames">
                    {users.map((user) => (
                      <option key={user._id} value={user.username} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Amount */}
              <div className="space-y-3">
                <Label>Amount (KZC)</Label>
                <Input
                  placeholder="Enter amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Comment Type */}
              <div className="space-y-3">
                <Label>Reason/Comment</Label>
                <Select value={commentType} onValueChange={(value) => setCommentType(value as CommentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="appreciation_bonus">Appreciation Bonus</SelectItem>
                    <SelectItem value="airdrop">Airdrop</SelectItem>
                    <SelectItem value="other">Custom Comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Comment (if other is selected) */}
              {commentType === "other" && (
                <div className="space-y-3">
                  <Label>Custom Comment</Label>
                  <Textarea
                    placeholder="Enter your custom comment"
                    value={customComment}
                    onChange={(e) => setCustomComment(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Distribution Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Distribution Summary:</strong>
                </p>
                <p className="text-sm">
                  Type: <Badge variant="outline">{distributionType === "all" ? "All Users" : "Single User"}</Badge>
                </p>
                {distributionType === "single" && username && (
                  <p className="text-sm">
                    User: <Badge variant="outline">{username}</Badge>
                  </p>
                )}
                {amount && (
                  <p className="text-sm">
                    Amount:{" "}
                    <Badge variant="outline" className="bg-primary/20">
                      {amount} KZC
                    </Badge>
                  </p>
                )}
                <p className="text-sm">
                  Reason: <Badge variant="outline">{getCommentDisplay()}</Badge>
                </p>
              </div>

              <Button onClick={handleDistribute} disabled={loading || distributing} className="w-full gap-2">
                {loading || distributing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {distributionType === "all" ? "Distribute to All Users" : "Distribute to User"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">Distribution Reasons:</p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    • Bonus
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    • Appreciation Bonus
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    • Airdrop
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    • Custom Comment
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Distribution</DialogTitle>
            <DialogDescription>Please review the details before confirming</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{distributionType === "all" ? "All Users" : "Single User"}</p>
            </div>
            {distributionType === "single" && (
              <div>
                <p className="text-sm text-muted-foreground">Recipient</p>
                <p className="font-medium">{username}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium text-lg">{amount} KZC</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reason</p>
              <p className="font-medium">{getCommentDisplay()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={distributing}>
              Cancel
            </Button>
            <Button onClick={confirmDistribution} disabled={distributing}>
              {distributing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm & Distribute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
