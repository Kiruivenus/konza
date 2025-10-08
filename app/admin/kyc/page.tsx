"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Check, X, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface KYCRequest {
  _id: string
  userId: string
  username: string
  email: string
  documentImage: string
  documentBackImage?: string
  selfieImage: string
  status: string
  submittedAt: string
  notes?: string
}

export default function AdminKYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchRequests = async () => {
    try {
      console.log("[v0] Fetching KYC requests...")
      const res = await fetch("/api/admin/kyc/list")
      const data = await res.json()

      console.log("[v0] KYC response:", data)

      if (res.ok) {
        setRequests(data.requests || [])
      } else {
        setError(data.error || "Failed to fetch KYC requests")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch KYC requests:", error)
      setError("Failed to fetch KYC requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleReview = async (status: "Approved" | "Rejected") => {
    if (!selectedRequest) return

    setReviewing(true)
    try {
      console.log("[v0] Reviewing KYC:", { kycId: selectedRequest._id, status, notes })

      const res = await fetch("/api/admin/kyc/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kycId: selectedRequest._id,
          status,
          notes,
        }),
      })

      const data = await res.json()
      console.log("[v0] Review response:", data)

      if (res.ok) {
        toast({
          title: "Success",
          description: `KYC ${status === "Approved" ? "approved" : "rejected"} successfully`,
        })
        setSelectedRequest(null)
        setNotes("")
        fetchRequests()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to review KYC",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Review error:", error)
      toast({
        title: "Error",
        description: "Failed to review KYC",
        variant: "destructive",
      })
    } finally {
      setReviewing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-destructive">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Requests</h1>
        <p className="text-muted-foreground">Review and approve user verification requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No pending KYC requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="font-medium">{request.username}</p>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button onClick={() => setSelectedRequest(request)} variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review KYC Request</DialogTitle>
            <DialogDescription>
              {selectedRequest?.username} - {selectedRequest?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Document Front</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={selectedRequest.documentImage || "/placeholder.svg"}
                      alt="Document Front"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                {selectedRequest.documentBackImage && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Document Back</p>
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={selectedRequest.documentBackImage || "/placeholder.svg"}
                        alt="Document Back"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selfie</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image
                      src={selectedRequest.selfieImage || "/placeholder.svg"}
                      alt="Selfie"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this review..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleReview("Approved")} disabled={reviewing} className="flex-1 gap-2">
                  {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve
                </Button>
                <Button
                  onClick={() => handleReview("Rejected")}
                  disabled={reviewing}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
