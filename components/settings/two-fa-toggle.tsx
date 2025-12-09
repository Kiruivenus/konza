"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface TwoFAToggleProps {
  initialEnabled: boolean
  onToggle?: () => void
}

export function TwoFAToggle({ initialEnabled, onToggle }: TwoFAToggleProps) {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isLoading, setIsLoading] = useState(false)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [twoFACode, setTwoFACode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const handleToggle = async () => {
    if (enabled) {
      setShowCodeDialog(true)
      return
    }

    // If enabling 2FA, directly toggle
    await performToggle(true)
  }

  const performToggle = async (newState: boolean) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/toggle-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newState }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update 2FA setting",
          variant: "destructive",
        })
        return
      }

      setEnabled(newState)
      toast({
        title: "Success",
        description: data.message,
      })
      onToggle?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update 2FA setting",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!twoFACode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-2fa-disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFACode }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Invalid verification code",
          variant: "destructive",
        })
        return
      }

      // Now proceed with disabling 2FA
      await performToggle(false)
      setShowCodeDialog(false)
      setTwoFACode("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">{enabled ? "Enabled" : "Disabled"}</p>
            <p className="text-sm text-gray-600">
              {enabled
                ? "You will receive a code via email on each login"
                : "Enable 2FA to protect your account with an email verification code"}
            </p>
          </div>
          <Button
            onClick={handleToggle}
            disabled={isLoading}
            variant={enabled ? "destructive" : "default"}
            className={enabled ? "" : "bg-teal-500 hover:bg-teal-600"}
          >
            {enabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify to Disable 2FA</DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code sent to your email to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="000000"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCodeDialog(false)} disabled={isVerifying}>
              Cancel
            </Button>
            <Button onClick={handleVerifyCode} disabled={isVerifying || twoFACode.length !== 6}>
              {isVerifying ? "Verifying..." : "Verify & Disable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
