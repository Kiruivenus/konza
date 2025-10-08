"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Send, Download, WalletIcon } from "lucide-react"
import { SendDialog } from "@/components/wallet/send-dialog"
import { ReceiveDialog } from "@/components/wallet/receive-dialog"
import { TransactionList } from "@/components/wallet/transaction-list"

interface WalletData {
  balance: number
  usdtBalance: number
  walletAddress: string
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSend, setShowSend] = useState(false)
  const [showReceive, setShowReceive] = useState(false)

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet/balance")
      const data = await res.json()

      if (res.ok) {
        setWallet(data)
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your crypto assets</p>
      </div>

      <div className="space-y-6">
        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-primary" />
                KZC Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{wallet?.balance.toFixed(4)} KZC</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5" />
                USDT Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{wallet?.usdtBalance?.toFixed(2) || "0.00"} USDT</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button onClick={() => setShowSend(true)} size="lg" className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button onClick={() => setShowReceive(true)} variant="outline" size="lg" className="gap-2">
            <Download className="h-4 w-4" />
            Receive
          </Button>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList />
          </CardContent>
        </Card>
      </div>

      <SendDialog open={showSend} onOpenChange={setShowSend} onSuccess={fetchWallet} />
      <ReceiveDialog open={showReceive} onOpenChange={setShowReceive} walletAddress={wallet?.walletAddress || ""} />
    </div>
  )
}
