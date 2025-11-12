"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SuccessModal } from "./success-modal"

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successModal, setSuccessModal] = useState({
    open: false,
    isSuccess: false,
    title: "",
    description: "",
  })
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "✗ Passwords Don't Match",
        description: "New passwords do not match. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "✗ Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccessModal({
          open: true,
          isSuccess: true,
          title: "Password Changed Successfully",
          description: "Your password has been updated. Please use your new password for future logins.",
        })
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => setOpen(false), 2000)
      } else {
        setSuccessModal({
          open: true,
          isSuccess: false,
          title: "Failed to Change Password",
          description: data.error || "Please check your current password and try again.",
        })
      }
    } catch (error) {
      setSuccessModal({
        open: true,
        isSuccess: false,
        title: "Network Error",
        description: "Failed to connect to server. Please check your connection and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Change</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <SuccessModal
        open={successModal.open}
        onOpenChange={(open) => setSuccessModal({ ...successModal, open })}
        isSuccess={successModal.isSuccess}
        title={successModal.title}
        description={successModal.description}
        autoClose={successModal.isSuccess}
      />
    </>
  )
}
