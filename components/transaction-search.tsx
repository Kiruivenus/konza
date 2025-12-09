"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Copy, CheckCircle2, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"

export function TransactionSearch() {
  const [hash, setHash] = useState("")
  const [transaction, setTransaction] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTransaction(null)
    setSearched(false)

    if (!hash.trim()) {
      setError("Please enter a transaction hash")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/explorer/search?hash=${encodeURIComponent(hash)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Transaction not found")
        setSearched(true)
        return
      }

      setTransaction(data.transaction)
      setSearched(true)
    } catch (err) {
      setError("Failed to search transaction")
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success":
        return <CheckCircle2 className="h-5 w-5 text-chart-3" />
      case "Failed":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "Pending":
        return <Clock className="h-5 w-5 text-chart-1" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "text-chart-3"
      case "Failed":
        return "text-destructive"
      case "Pending":
        return "text-chart-1"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>Search for any transaction by entering its hash</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Enter transaction hash (e.g., 0xKZC8F9B273A1DE42E9)"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && searched && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Transaction Details
              {getStatusIcon(transaction.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{transaction.hash}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(transaction.hash)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`font-medium ${getStatusColor(transaction.status)}`}>{transaction.status}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{transaction.type}</span>
              </div>

              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Sender</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{transaction.sender}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(transaction.sender)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-start border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Receiver</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono">{transaction.receiver}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(transaction.receiver)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium">{transaction.amount.toFixed(2)} KZC</span>
              </div>

              <div className="flex justify-between items-center border-b border-border pb-3">
                <span className="text-sm text-muted-foreground">Fee</span>
                <span className="font-medium">{transaction.fee.toFixed(2)} KZC</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Timestamp</span>
                <span className="font-medium">{format(new Date(transaction.timestamp), "PPpp")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
