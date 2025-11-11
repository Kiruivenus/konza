"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()

      if (res.ok) {
        setSettings(data.settings)
        console.log("[v0] Fetched settings:", data.settings) // Debug log
      }
    } catch (error) {
      console.error("[v0] Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { _id, ...settingsToSave } = settings
      console.log("[v0] Saving settings:", settingsToSave)
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsToSave),
      })

      const data = await res.json()
      console.log("[v0] Save response:", data)

      if (res.ok) {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        })
        await fetchSettings()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update settings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }))
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
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure platform settings and features</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Settings</CardTitle>
            <CardDescription>Configure transaction fees and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transferFee">Transfer Fee (%)</Label>
              <Input
                id="transferFee"
                type="number"
                step="0.01"
                value={settings?.transferFee || 0}
                onChange={(e) => updateSetting("transferFee", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Swap Settings</CardTitle>
            <CardDescription>Configure swap functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Swaps</Label>
                <p className="text-sm text-muted-foreground">Allow users to swap tokens</p>
              </div>
              <Switch
                checked={settings?.swapEnabled || false}
                onCheckedChange={(checked) => updateSetting("swapEnabled", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minSwapAmount">Minimum Swap Amount</Label>
              <Input
                id="minSwapAmount"
                type="number"
                step="0.01"
                value={settings?.minSwapAmount || 0}
                onChange={(e) => updateSetting("minSwapAmount", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="swapFee">Swap Fee (%)</Label>
              <Input
                id="swapFee"
                type="number"
                step="0.01"
                value={settings?.swapFee || 0}
                onChange={(e) => updateSetting("swapFee", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mining Settings</CardTitle>
            <CardDescription>Configure mining rewards and duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Mining</Label>
                <p className="text-sm text-muted-foreground">Allow users to mine tokens</p>
              </div>
              <Switch
                checked={settings?.miningEnabled || false}
                onCheckedChange={(checked) => updateSetting("miningEnabled", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="miningRewardRate">Reward Rate (KZC per session)</Label>
              <Input
                id="miningRewardRate"
                type="number"
                step="0.01"
                value={settings?.miningRewardRate || 0}
                onChange={(e) => updateSetting("miningRewardRate", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="miningSessionDuration">Session Duration (hours)</Label>
              <Input
                id="miningSessionDuration"
                type="number"
                value={settings?.miningSessionDuration || 0}
                onChange={(e) => updateSetting("miningSessionDuration", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Settings</CardTitle>
            <CardDescription>Configure referral rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Referrals</Label>
                <p className="text-sm text-muted-foreground">Allow users to earn referral bonuses</p>
              </div>
              <Switch
                checked={settings?.referralEnabled || false}
                onCheckedChange={(checked) => updateSetting("referralEnabled", checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralBonus">Referral Bonus (KZC)</Label>
              <Input
                id="referralBonus"
                type="number"
                step="0.01"
                value={settings?.referralBonus || 0}
                onChange={(e) => updateSetting("referralBonus", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
