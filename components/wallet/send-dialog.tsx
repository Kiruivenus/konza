"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle2, Copy } from "lucide-react"

interface SendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  transferFee: number
}

export function SendDialog({ open, onOpenChange, onSuccess, transferFee }: SendDialogProps) {
  const [step, setStep] = useState<"input" | "confirm" | "success">("input")
  const [formData, setFormData] = useState({
    receiverAddress: "",
    amount: "",
    pin: "",
    currency: "KZC",
  })
  const [receiverInfo, setReceiverInfo] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")

  const handleCheckAddress = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/wallet/check-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: formData.receiverAddress }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Address not found")
        return
      }

      setReceiverInfo(data)
      setStep("confirm")
    } catch (err) {
      setError("Failed to check address")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverAddress: formData.receiverAddress,
          amount: Number.parseFloat(formData.amount),
          pin: formData.pin,
          currency: formData.currency,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Transaction failed")
        return
      }

      setTransactionHash(data.hash)
      setStep("success")
      onSuccess()
    } catch (err) {
      setError("Failed to send transaction")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("input")
    setFormData({ receiverAddress: "", amount: "", pin: "", currency: "KZC" })
    setReceiverInfo(null)
    setError("")
    setTransactionHash("")
    onOpenChange(false)
  }

  const copyHash = () => {
    navigator.clipboard.writeText(transactionHash)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Crypto</DialogTitle>
          <DialogDescription>Transfer KZC or USDT to another wallet</DialogDescription>
        </DialogHeader>

        {step === "input" && (
          <div className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KZC">KZC (Konza Coin)</SelectItem>
                  <SelectItem value="USDT">USDT (Tether)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Receiver Wallet Address</Label>
              <Input
                id="receiverAddress"
                placeholder="KZC123456789"
                value={formData.receiverAddress}
                onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({formData.currency})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Transaction fee: {transferFee} {formData.currency}
              </p>
            </div>

            <Button
              onClick={handleCheckAddress}
              disabled={loading || !formData.receiverAddress || !formData.amount}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Address"
              )}
            </Button>
          </div>
        )}

        {step === "confirm" && receiverInfo && (
          <div className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">{formData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receiver:</span>
                <span className="font-medium">{receiverInfo.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KYC Status:</span>
                <span className={receiverInfo.kycStatus === "Approved" ? "text-chart-3" : "text-muted-foreground"}>
                  {receiverInfo.kycStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {formData.amount} {formData.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee:</span>
                <span className="font-medium">
                  {transferFee} {formData.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  {(Number.parseFloat(formData.amount) + transferFee).toFixed(2)} {formData.currency}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">Wallet PIN</Label>
              <Input
                id="pin"
                type="password"
                maxLength={4}
                placeholder="Enter 4-digit PIN"
                value={formData.pin}
                onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSend} disabled={loading || formData.pin.length !== 4} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm & Send"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-chart-3/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-chart-3" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Transaction Successful!</h3>
              <p className="text-sm text-muted-foreground">Your {formData.currency} has been sent successfully</p>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm text-muted-foreground">Transaction Hash:</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono flex-1 break-all">{transactionHash}</code>
                <Button size="sm" variant="ghost" onClick={copyHash}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
