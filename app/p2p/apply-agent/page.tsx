"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function ApplyAgentPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tradingExperience: "",
    businessDetails: "",
    paymentMethods: [] as string[],
  })
  const { toast } = useToast()

  const paymentOptions = ["M-PESA", "Bank Transfer", "PayPal", "Airtel Money"]

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

      if (res.ok) {
        toast({ description: "Application submitted successfully! Admins will review your application." })
        setFormData({ tradingExperience: "", businessDetails: "", paymentMethods: [] })
      } else {
        const error = await res.json()
        toast({ description: error.message || "Failed to submit application", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({ description: "Failed to submit application", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/p2p" className="p-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Become an Agent</h1>
        </div>

        <Card className="p-4 mb-6 bg-accent/50 border-primary/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Requirements:</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• KYC verification completed</li>
                <li>• Minimum 2FA enabled for security</li>
                <li>• Security deposit approval</li>
                <li>• Compliance with platform terms</li>
              </ul>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Trading Experience (years)</label>
            <Input
              type="number"
              placeholder="e.g., 2"
              value={formData.tradingExperience}
              onChange={(e) => setFormData({ ...formData, tradingExperience: e.target.value })}
              className="mt-1"
              required
              min="0"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Business Details</label>
            <textarea
              placeholder="Tell us about your business and why you want to be an agent..."
              value={formData.businessDetails}
              onChange={(e) => setFormData({ ...formData, businessDetails: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-sm mt-1"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Supported Payment Methods</label>
            <div className="space-y-2">
              {paymentOptions.map((method) => (
                <label
                  key={method}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50"
                >
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(method)}
                    onChange={() => handleTogglePayment(method)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </div>
    </div>
  )
}
