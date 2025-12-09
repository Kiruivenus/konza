"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Users } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  email: string
}

type EmailRecipientType = "single" | "all"

export default function SendEmailPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [recipientType, setRecipientType] = useState<EmailRecipientType>("single")
  const [username, setUsername] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [totalUsers, setTotalUsers] = useState(0)
  const [sending, setSending] = useState(false)
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

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter the email message",
        variant: "destructive",
      })
      return
    }

    if (recipientType === "single" && !username) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmSendEmail = async () => {
    setSending(true)
    try {
      const payload = {
        type: recipientType,
        subject: subject,
        message: message,
        recipients: recipientType === "single" ? { username } : undefined,
      }

      console.log("[v0] Sending email payload:", payload)

      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Email response status:", res.status)
      const data = await res.json()
      console.log("[v0] Email response data:", data)

      if (!res.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to send email",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: data.message,
      })
      setUsername("")
      setSubject("")
      setMessage("")
      setRecipientType("single")
      setShowConfirmDialog(false)
    } catch (error) {
      console.error("[v0] Send email error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Send Email to Users</h1>
        <p className="text-muted-foreground">Send announcements and messages to users via email</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Email Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recipient Type */}
              <div className="space-y-3">
                <Label>Send To</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={recipientType === "single" ? "default" : "outline"}
                    onClick={() => setRecipientType("single")}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Single User
                  </Button>
                  <Button
                    variant={recipientType === "all" ? "default" : "outline"}
                    onClick={() => setRecipientType("all")}
                    className="gap-2"
                  >
                    <Users className="h-4 w-4" />
                    All Users
                  </Button>
                </div>
              </div>

              {/* Username Input (for single user) */}
              {recipientType === "single" && (
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

              {/* Subject */}
              <div className="space-y-3">
                <Label>Subject</Label>
                <Input placeholder="Enter email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>

              {/* Message */}
              <div className="space-y-3">
                <Label>Message</Label>
                <Textarea
                  placeholder="Enter your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">{message.length} / 5000 characters</p>
              </div>

              {/* Email Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <strong>Email Summary:</strong>
                </p>
                <p className="text-sm">
                  Send To: <Badge variant="outline">{recipientType === "all" ? "All Users" : "Single User"}</Badge>
                </p>
                {recipientType === "single" && username && (
                  <p className="text-sm">
                    Recipient: <Badge variant="outline">{username}</Badge>
                  </p>
                )}
                {recipientType === "all" && (
                  <p className="text-sm">
                    Recipients: <Badge variant="outline">{totalUsers} users</Badge>
                  </p>
                )}
                {subject && (
                  <p className="text-sm">
                    Subject: <Badge variant="outline">{subject}</Badge>
                  </p>
                )}
              </div>

              <Button onClick={handleSendEmail} disabled={loading || sending} className="w-full gap-2">
                {loading || sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send Email
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-3">Recipient Types:</p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    • Single User
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    • All Users
                  </Badge>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Message Tips:</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  • Keep messages clear and concise • Include important dates and deadlines • Avoid suspicious links •
                  Sign off professionally
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Email Send</DialogTitle>
            <DialogDescription>Please review the email details before sending</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Send To</p>
              <p className="font-medium">
                {recipientType === "all" ? `All Users (${totalUsers})` : `Single User: ${username}`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subject</p>
              <p className="font-medium">{subject}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Message Preview</p>
              <p className="font-medium text-sm bg-muted p-3 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                {message}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={confirmSendEmail} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
