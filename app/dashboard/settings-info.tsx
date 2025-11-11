"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function SettingsInfo() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/get")
        const data = await res.json()
        if (res.ok) {
          setSettings(data.settings)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!settings) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform Fees & Limits</CardTitle>
          <CardDescription>Current transaction settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Transfer Fee</span>
            <span className="font-semibold">{settings.transferFee}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Swap Fee</span>
            <span className="font-semibold">{settings.swapFee}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Minimum Swap Amount</span>
            <span className="font-semibold">{settings.minSwapAmount} KZC</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mining Rewards</CardTitle>
          <CardDescription>Current mining configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Reward Rate</span>
            <span className="font-semibold">{settings.miningRewardRate} KZC/session</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Session Duration</span>
            <span className="font-semibold">{settings.miningSessionDuration} hours</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referral Program</CardTitle>
          <CardDescription>Current referral settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Referral Bonus</span>
            <span className="font-semibold">{settings.referralBonus} KZC</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
