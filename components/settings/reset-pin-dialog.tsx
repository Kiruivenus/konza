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

export function ResetPinDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    password: "",
    newPin: "",
    confirmPin: "",
  })
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (formData.newPin !== formData.confirmPin) {
      toast({
        title: "✗ PINs Don't Match",
        description: "New PINs do not match. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    if (formData.newPin.length !== 4) {
      toast({
        title: "✗ Invalid PIN Length",
        description: "PIN must be exactly 4 digits.",
        variant: "destructive",
        duration: 5000,
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/wallet/reset-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: formData.password,
          newPin: formData.newPin,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "✓ PIN Reset Successfully!",
          description: "Your PIN has been reset. Please use your new PIN for all transactions.",
          duration: 5000,
          className: "bg-green-50 border-green-200",
        })
        setFormData({ password: "", newPin: "", confirmPin: "" })
        setOpen(false)
      } else {
        toast({
          title: "✗ Failed to Reset PIN",
          description: data.error || "Please check your password and try again.",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "✗ Network Error",
        description: "Failed to connect to server. Please check your connection and try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Reset</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset PIN</DialogTitle>
          <DialogDescription>Enter your password to reset your PIN</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Account Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPin">New PIN</Label>
            <Input
              id="newPin"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={formData.newPin}
              onChange={(e) => setFormData({ ...formData, newPin: e.target.value.replace(/\D/g, "") })}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm New PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={formData.confirmPin}
              onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, "") })}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Resetting...
              </>
            ) : (
              "Reset PIN"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
