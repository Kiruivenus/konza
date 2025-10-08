"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Referral {
  _id: string
  referrerId: string
  referrerEmail: string
  referredId: string
  referredEmail: string
  status: string
  bonusAmount: number
  createdAt: string
  completedAt?: string
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const res = await fetch("/api/admin/referrals")
      const data = await res.json()

      if (res.ok) {
        setReferrals(data.referrals)
      }
    } catch (error) {
      console.error("Failed to fetch referrals:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral System</h1>
        <p className="text-muted-foreground">All referrals on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals ({referrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral._id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="font-medium">{referral.referrerEmail}</p>
                    <span className="text-muted-foreground">→</span>
                    <p className="font-medium">{referral.referredEmail}</p>
                    <Badge variant={referral.status === "completed" ? "default" : "secondary"}>{referral.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Gift className="h-3 w-3 text-primary" />
                      <span className="font-semibold text-primary">{referral.bonusAmount.toFixed(2)} KZC</span>
                    </div>
                    <span className="text-muted-foreground">
                      Referred: {new Date(referral.createdAt).toLocaleDateString()}
                    </span>
                    {referral.completedAt && (
                      <span className="text-muted-foreground">
                        Completed: {new Date(referral.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {referrals.length === 0 && <p className="text-center text-muted-foreground py-8">No referrals yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
