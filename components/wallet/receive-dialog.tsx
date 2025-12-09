"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2 } from "lucide-react"
import Image from "next/image"

interface ReceiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress: string
}

export function ReceiveDialog({ open, onOpenChange, walletAddress }: ReceiveDialogProps) {
  const [qrCode, setQrCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open && walletAddress) {
      fetch(`/api/qrcode?address=${encodeURIComponent(walletAddress)}`)
        .then((res) => res.json())
        .then((data) => setQrCode(data.qrCode))
        .catch((err) => console.error("[v0] Failed to load QR code:", err))
    }
  }, [open, walletAddress])

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive KZC</DialogTitle>
          <DialogDescription>Share your wallet address to receive Konza Coin</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {qrCode && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <Image src={qrCode || "/placeholder.svg"} alt="Wallet QR Code" width={200} height={200} />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Your Wallet Address:</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
              <code className="text-sm font-mono flex-1 break-all">{walletAddress}</code>
              <Button size="sm" variant="ghost" onClick={copyAddress}>
                {copied ? <CheckCircle2 className="h-4 w-4 text-chart-3" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            <p className="font-medium">Important:</p>
            <p>Send only KZC to this address. Sending other tokens may result in permanent loss.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
