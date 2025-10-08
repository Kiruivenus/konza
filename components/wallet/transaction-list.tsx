"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, Repeat, Pickaxe, Users, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Transaction {
  _id: string
  hash: string
  type: string
  sender: string
  receiver: string
  amount: number
  fee: number
  status: string
  timestamp: string
}

interface TransactionListProps {
  walletAddress: string
}

export function TransactionList({ walletAddress }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/wallet/transactions")
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("[v0] Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string, sender: string) => {
    if (type === "mining") return <Pickaxe className="h-4 w-4" />
    if (type === "referral") return <Users className="h-4 w-4" />
    if (type === "swap") return <Repeat className="h-4 w-4" />
    return sender === walletAddress ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />
  }

  const getTransactionLabel = (type: string, sender: string) => {
    if (type === "mining") return "Mining Reward"
    if (type === "referral") return "Referral Bonus"
    if (type === "swap") return "Token Swap"
    return sender === walletAddress ? "Sent" : "Received"
  }

  const getTransactionColor = (type: string, sender: string) => {
    if (type === "mining" || type === "referral") return "text-chart-3"
    return sender === walletAddress ? "text-destructive" : "text-chart-3"
  }

  const getAmountPrefix = (type: string, sender: string) => {
    if (type === "mining" || type === "referral") return "+"
    return sender === walletAddress ? "-" : "+"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Loading transactions...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <button
                  key={tx._id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${getTransactionColor(tx.type, tx.sender)}`}
                    >
                      {getTransactionIcon(tx.type, tx.sender)}
                    </div>
                    <div>
                      <p className="font-medium">{getTransactionLabel(tx.type, tx.sender)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(tx.timestamp), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTransactionColor(tx.type, tx.sender)}`}>
                      {getAmountPrefix(tx.type, tx.sender)}
                      {tx.amount.toFixed(2)} KZC
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.status}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium capitalize">{selectedTransaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{selectedTransaction.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">{selectedTransaction.amount.toFixed(2)} KZC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="font-medium">{selectedTransaction.fee.toFixed(2)} KZC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{format(new Date(selectedTransaction.timestamp), "PPpp")}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">Transaction Hash</p>
                <code className="text-xs font-mono block bg-muted p-2 rounded break-all">
                  {selectedTransaction.hash}
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">From</p>
                <code className="text-xs font-mono block bg-muted p-2 rounded break-all">
                  {selectedTransaction.sender}
                </code>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">To</p>
                <code className="text-xs font-mono block bg-muted p-2 rounded break-all">
                  {selectedTransaction.receiver}
                </code>
              </div>

              <Button variant="outline" className="w-full bg-transparent" asChild>
                <a href={`/explorer?hash=${selectedTransaction.hash}`} target="_blank" rel="noopener noreferrer">
                  View in Explorer
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
