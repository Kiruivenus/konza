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
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { SuccessModal } from "./success-modal"

export function ChangePinDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successModal, setSuccessModal] = useState({
    open: false,
    isSuccess: false,
    title: "",
    description: "",
  })
  const [formData, setFormData] = useState({
    currentPin: "",
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
      const res = await fetch("/api/wallet/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPin: formData.currentPin,
          newPin: formData.newPin,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setSuccessModal({
          open: true,
          isSuccess: true,
          title: "PIN Changed Successfully",
          description: "Your PIN has been updated. Please use your new PIN for all transactions.",
        })
        setFormData({ currentPin: "", newPin: "", confirmPin: "" })
        setTimeout(() => setOpen(false), 2000)
      } else {
        setSuccessModal({
          open: true,
          isSuccess: false,
          title: "Failed to Change PIN",
          description: data.error || "Please check your current PIN and try again.",
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
            <DialogTitle>Change PIN</DialogTitle>
            <DialogDescription>Enter your current PIN and choose a new 4-digit PIN</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                maxLength={4}
                placeholder="••••"
                value={formData.currentPin}
                onChange={(e) => setFormData({ ...formData, currentPin: e.target.value.replace(/\D/g, "") })}
                className="text-center text-2xl tracking-widest"
              />
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
                  Changing...
                </>
              ) : (
                "Change PIN"
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
