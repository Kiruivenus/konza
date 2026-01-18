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
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface TwoFAToggleProps {
  initialEnabled: boolean
  onToggle?: () => void
}

export function TwoFAToggle({ initialEnabled, onToggle }: TwoFAToggleProps) {
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isLoading, setIsLoading] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const [resultStatus, setResultStatus] = useState<"success" | "error">("success")
  const [resultMessage, setResultMessage] = useState("")
  const [twoFACode, setTwoFACode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleToggle = async () => {
    if (enabled) {
      // Show warning dialog first
      setShowWarningDialog(true)
      return
    }

    // If enabling 2FA, directly toggle
    await performToggle(true)
  }

  const handleConfirmDisable = async () => {
    setShowWarningDialog(false)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-2fa-disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code" }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification code",
          variant: "destructive",
        })
        return
      }

      setCodeSent(true)
      setShowCodeDialog(true)
      toast({
        title: "Code Sent",
        description: "A verification code has been sent to your email",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
        setResultStatus("error")
        setResultMessage(data.error || "Failed to update 2FA setting")
        setShowResultModal(true)
        return
      }

      setEnabled(newState)
      setResultStatus("success")
      setResultMessage(newState ? "2FA has been enabled successfully" : "2FA has been disabled successfully")
      setShowResultModal(true)
      onToggle?.()
    } catch (error) {
      setResultStatus("error")
      setResultMessage("Failed to update 2FA setting")
      setShowResultModal(true)
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
        body: JSON.stringify({ action: "verify-code", code: twoFACode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResultStatus("error")
        setResultMessage("Incorrect verification code. Please check your email and try again.")
        setShowResultModal(true)
        return
      }

      // Now proceed with disabling 2FA
      await performToggle(false)
      setShowCodeDialog(false)
      setTwoFACode("")
      setCodeSent(false)
    } catch (error) {
      setResultStatus("error")
      setResultMessage("Failed to verify code")
      setShowResultModal(true)
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

      {/* Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Disable 2FA?
            </DialogTitle>
            <DialogDescription>Are you sure you want to disable two-factor authentication?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>⚠️ Warning:</strong> Disabling 2FA makes your account less secure. Your account will only be
                protected by your password.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Info:</strong> To disable 2FA, you'll need to verify your identity using an email code.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDisable} disabled={isLoading} variant="destructive">
              Continue to Disable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Code Verification Dialog */}
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
                className="text-center text-2xl tracking-widest font-mono mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">Check your email for the code</p>
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

      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultStatus === "success" ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  Success
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500" />
                  Failed
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className={resultStatus === "success" ? "text-green-700" : "text-red-700"}>{resultMessage}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowResultModal(false)}
              className={resultStatus === "success" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {resultStatus === "success" ? "OK" : "Try Again"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
