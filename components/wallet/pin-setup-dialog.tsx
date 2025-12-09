"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface PinSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  isUpdate?: boolean
}

export function PinSetupDialog({ open, onOpenChange, onSuccess, isUpdate = false }: PinSetupDialogProps) {
  const [formData, setFormData] = useState({
    currentPin: "",
    pin: "",
    confirmPin: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.pin !== formData.confirmPin) {
      setError("PINs do not match")
      return
    }

    if (formData.pin.length !== 4 || !/^\d+$/.test(formData.pin)) {
      setError("PIN must be 4 digits")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/wallet/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: formData.pin,
          currentPin: isUpdate ? formData.currentPin : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to set PIN")
        return
      }

      setFormData({ currentPin: "", pin: "", confirmPin: "" })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUpdate ? "Update" : "Set Up"} Wallet PIN</DialogTitle>
          <DialogDescription>Create a 4-digit PIN to secure your wallet transactions</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

          {isUpdate && (
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <Input
                id="currentPin"
                type="password"
                maxLength={4}
                placeholder="••••"
                value={formData.currentPin}
                onChange={(e) => setFormData({ ...formData, currentPin: e.target.value })}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pin">New PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirm PIN</Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={4}
              placeholder="••••"
              value={formData.confirmPin}
              onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting PIN...
              </>
            ) : (
              `${isUpdate ? "Update" : "Set"} PIN`
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
