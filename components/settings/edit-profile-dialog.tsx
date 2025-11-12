"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData: {
    firstName?: string
    lastName?: string
    phone?: string
  }
}

export function EditProfileDialog({ open, onOpenChange, onSuccess, initialData }: EditProfileDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showWarning, setShowWarning] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const namesAlreadySet = !!(initialData.firstName || initialData.lastName)

  const [formData, setFormData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    phone: initialData.phone || "",
  })

  const handleSubmit = async (confirmWarning = false) => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update profile")
        setLoading(false)
        return
      }

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
        onOpenChange(false)
        setFormData({ firstName: "", lastName: "", phone: "" })
        setShowWarning(false)
      }, 2000)
    } catch (err) {
      setError("Failed to update profile")
      console.error("[v0] Update profile error:", err)
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // If names are not set yet, show warning
    if (!namesAlreadySet) {
      setShowWarning(true)
      return
    }

    // If names are already set, just update phone
    handleSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold">Profile Updated</h2>
              <p className="text-sm text-muted-foreground">Your profile information has been saved successfully</p>
            </div>
          </div>
        ) : showWarning ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-chart-1" />
                Important Notice
              </DialogTitle>
            </DialogHeader>
            <div className="bg-chart-1/10 border border-chart-1/20 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Names Cannot Be Changed</h3>
              <p className="text-sm text-muted-foreground">
                Once you set your first and last name, they cannot be changed for security reasons. Please make sure the
                information is correct before confirming.
              </p>
              <div className="bg-background rounded p-3 space-y-2 border border-border">
                <p className="text-sm">
                  <span className="font-semibold">First Name:</span> {formData.firstName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Last Name:</span> {formData.lastName}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Phone:</span> {formData.phone}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setShowWarning(false)} className="flex-1">
                Edit
              </Button>
              <Button type="button" onClick={() => handleSubmit(true)} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "I Confirm"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>Update your personal information</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {namesAlreadySet && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 px-4 py-3 rounded-lg text-sm">
                  Note: Your name cannot be changed once set
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name {namesAlreadySet && "(read-only)"}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={namesAlreadySet}
                  required={!namesAlreadySet}
                  className={namesAlreadySet ? "opacity-60" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name {namesAlreadySet && "(read-only)"}</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={namesAlreadySet}
                  required={!namesAlreadySet}
                  className={namesAlreadySet ? "opacity-60" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : namesAlreadySet ? (
                    "Update Phone"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
