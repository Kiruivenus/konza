"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Loader2, TrendingUp, TrendingDown, Gift } from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  _id: string
  type: "send" | "receive" | "swap" | "mining" | "distribute"
  amount: number
  currency: string
  recipient?: string
  sender?: string
  status: "completed" | "pending" | "failed"
  timestamp: string
  fee?: number
  description?: string
  comment?: string
}

export function TransactionHistory({ walletAddress }: { walletAddress: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [walletAddress])

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/transactions?address=${walletAddress}`)
      const data = await res.json()
      if (res.ok) {
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-5 w-5 text-destructive" />
      case "receive":
        return <ArrowDownLeft className="h-5 w-5 text-chart-1" />
      case "swap":
        return <TrendingUp className="h-5 w-5 text-accent" />
      case "mining":
        return <TrendingDown className="h-5 w-5 text-chart-2" />
      case "distribute":
        return <Gift className="h-5 w-5 text-chart-1" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-chart-1/10 text-chart-1 border-chart-1/20"
      case "pending":
        return "bg-accent/10 text-accent border-accent/20"
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "send":
        return "Sent"
      case "receive":
        return "Received"
      case "swap":
        return "Swapped"
      case "mining":
        return "Mining Reward"
      case "distribute":
        return "Bonus Received"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Transaction History
        </CardTitle>
        <CardDescription>Your recent transactions and activity</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors bg-card/50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{getTransactionLabel(tx.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.type === "distribute" && tx.comment
                        ? tx.comment
                        : format(new Date(tx.timestamp), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {tx.type === "send" ? "-" : "+"}
                      {tx.amount.toFixed(4)} {tx.currency}
                    </p>
                    {tx.fee && <p className="text-xs text-muted-foreground">Fee: {tx.fee.toFixed(4)}</p>}
                  </div>
                  <Badge className={`${getStatusColor(tx.status)} border`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
