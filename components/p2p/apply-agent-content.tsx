"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ApplyAgentContent() {
  const [loading, setLoading] = useState(false)
  const [checkingRequirements, setCheckingRequirements] = useState(true)
  const [requirementErrors, setRequirementErrors] = useState<string[]>([])
  const [applicationStatus, setApplicationStatus] = useState<"idle" | "pending" | "approved" | "rejected" | null>(null)
  const [userStatus, setUserStatus] = useState<{
    kycApproved: boolean
    twoFactorEnabled: boolean
    isAlreadyAgent: boolean
  } | null>(null)

  const [formData, setFormData] = useState({
    tradingExperience: "",
    businessDetails: "",
    paymentMethods: [] as string[],
  })
  const { toast } = useToast()

  const paymentOptions = ["M-PESA", "Bank Transfer", "PayPal", "Airtel Money"]

  useEffect(() => {
    const checkRequirements = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          const user = data.user || data
          const errors: string[] = []

          if (user.p2pAgentStatus === "pending") {
            setApplicationStatus("pending")
            setCheckingRequirements(false)
            return
          }

          if (user.kycStatus !== "Approved") {
            errors.push("KYC verification must be completed")
          }
          if (!user.twoFactorEnabled) {
            errors.push("2FA must be enabled for security")
          }
          if (user.p2pAgentStatus === "approved") {
            errors.push("You are already an agent")
          }

          setRequirementErrors(errors)
          setUserStatus({
            kycApproved: user.kycStatus === "Approved",
            twoFactorEnabled: user.twoFactorEnabled,
            isAlreadyAgent: user.p2pAgentStatus === "approved",
          })
        }
      } catch (error) {
        console.error("[v0] Error checking requirements:", error)
      } finally {
        setCheckingRequirements(false)
      }
    }

    checkRequirements()
  }, [])

  const handleTogglePayment = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tradingExperience) {
      toast({ description: "Please enter your trading experience", variant: "destructive" })
      return
    }

    if (!formData.businessDetails) {
      toast({ description: "Please provide business details", variant: "destructive" })
      return
    }

    if (formData.paymentMethods.length === 0) {
      toast({ description: "Please select at least one payment method", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/p2p/agent-application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setApplicationStatus("pending")
        setFormData({ tradingExperience: "", businessDetails: "", paymentMethods: [] })
        toast({ description: "Application submitted successfully! Admins will review your application." })
      } else {
        toast({ description: data.message || "Failed to submit application", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({ description: "Failed to submit application", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (checkingRequirements) {
    return <div className="text-center py-8">Loading requirements...</div>
  }

  return (
    <div className="w-full max-h-[calc(100vh-200px)] overflow-y-auto pr-4 space-y-4">
      {requirementErrors.length > 0 && (
        <Card className="p-4 bg-destructive/10 border-destructive/30 sticky top-0">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-2 text-destructive">Unable to Apply - Missing Requirements:</p>
              <ul className="space-y-1 text-xs">
                {requirementErrors.map((error, idx) => (
                  <li key={idx} className="text-destructive">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {requirementErrors.length === 0 && (
        <Card className="p-4 bg-green-50 border-green-200 sticky top-0">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1 text-green-700">All Requirements Met</p>
              <p className="text-xs text-green-600">
                You meet all requirements to apply as an agent. Fill out the form below to submit your application.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-2 text-blue-700">Requirements for Agent Status:</p>
            <ul className="space-y-1.5 text-xs text-blue-600">
              <li className="flex items-center gap-2">
                {userStatus?.kycApproved ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                KYC verification completed
              </li>
              <li className="flex items-center gap-2">
                {userStatus?.twoFactorEnabled ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                2FA enabled for security
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                Security deposit approval
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                Compliance with platform terms
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {userStatus?.isAlreadyAgent && (
        <Card className="p-6 text-center bg-green-50 border-green-200">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-700 mb-2">You're an Approved Agent!</h3>
          <p className="text-sm text-green-600 mb-4">
            Access your dashboard to create offers, manage orders, and start trading.
          </p>
          <Button
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => (window.location.href = "/dashboard?tab=p2p")}
          >
            Go to Agent Dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      )}

      {applicationStatus === "pending" && (
        <Card className="p-6 text-center bg-amber-50 border-amber-200">
          <Clock className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-700 mb-2">Application Pending Review</h3>
          <p className="text-sm text-amber-600 mb-2">
            Your agent application has been submitted and is awaiting admin review. We will notify you once a decision
            has been made.
          </p>
          <p className="text-xs text-amber-600">This usually takes 1-3 business days. Thank you for your patience!</p>
        </Card>
      )}

      {!userStatus?.isAlreadyAgent && applicationStatus !== "pending" && requirementErrors.length === 0 && (
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div>
            <label className="text-sm font-semibold block mb-2">Trading Experience (years)</label>
            <Input
              type="number"
              placeholder="e.g., 2"
              value={formData.tradingExperience}
              onChange={(e) => setFormData({ ...formData, tradingExperience: e.target.value })}
              className="w-full"
              required
              min="0"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-2">Business Details</label>
            <textarea
              placeholder="Tell us about your business and why you want to be an agent..."
              value={formData.businessDetails}
              onChange={(e) => setFormData({ ...formData, businessDetails: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-3">Supported Payment Methods</label>
            <div className="space-y-2">
              {paymentOptions.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method)}
                    onChange={() => handleTogglePayment(method)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading || requirementErrors.length > 0}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      )}
    </div>
  )
}
