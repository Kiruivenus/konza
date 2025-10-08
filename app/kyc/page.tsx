"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { KYCForm } from "@/components/kyc/kyc-form"
import { format } from "date-fns"

export default function KYCPage() {
  const router = useRouter()
  const [kycStatus, setKycStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchKYCStatus()
  }, [])

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc/status")
      const data = await response.json()
      setKycStatus(data)
    } catch (error) {
      console.error("[v0] Failed to fetch KYC status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="h-8 w-8 text-chart-3" />
      case "Rejected":
        return <XCircle className="h-8 w-8 text-destructive" />
      case "Pending":
        return <Clock className="h-8 w-8 text-chart-1" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">KYC Verification</h1>
            <p className="text-muted-foreground">Verify your identity to unlock swapping and referral rewards</p>
          </div>

          {kycStatus?.status === "Pending" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">{getStatusIcon("Pending")}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">KYC Under Review</h3>
                    <p className="text-muted-foreground">
                      Your KYC documents are being reviewed. This usually takes 24-48 hours.
                    </p>
                    {kycStatus.submittedAt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Submitted on {format(new Date(kycStatus.submittedAt), "PPP")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus?.status === "Approved" && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">{getStatusIcon("Approved")}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">KYC Approved!</h3>
                    <p className="text-muted-foreground">
                      Your identity has been verified. You can now access all platform features.
                    </p>
                    {kycStatus.reviewedAt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Approved on {format(new Date(kycStatus.reviewedAt), "PPP")}
                      </p>
                    )}
                  </div>
                  <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {kycStatus?.status === "Rejected" && (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">{getStatusIcon("Rejected")}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">KYC Rejected</h3>
                    <p className="text-muted-foreground">
                      Your KYC submission was rejected. Please review the feedback and submit again.
                    </p>
                    {kycStatus.notes && (
                      <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm mt-4">
                        <p className="font-medium">Reason:</p>
                        <p>{kycStatus.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(!kycStatus?.status || kycStatus?.status === "Not Submitted" || kycStatus?.status === "Rejected") && (
            <KYCForm />
          )}
        </div>
      </main>
    </div>
  )
}
