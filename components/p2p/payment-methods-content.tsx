"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentMethod {
  _id: string
  type: string
  accountName: string
  accountNumber: string
  isDefault: boolean
}

export function PaymentMethodsContent() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: "M-PESA",
    accountName: "",
    accountNumber: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/p2p/payment-methods")
      if (res.ok) {
        const data = await res.json()
        setMethods(data)
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
      toast({ description: "Failed to load payment methods", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/p2p/payment-methods/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast({ description: "Payment method added successfully" })
        setFormData({ type: "M-PESA", accountName: "", accountNumber: "" })
        setShowForm(false)
        fetchPaymentMethods()
      } else {
        const error = await res.json()
        toast({ description: error.message || "Failed to add payment method", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast({ description: "Failed to add payment method", variant: "destructive" })
    }
  }

  const handleDeleteMethod = async (methodId: string) => {
    try {
      const res = await fetch("/api/p2p/payment-methods/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methodId }),
      })
      if (res.ok) {
        toast({ description: "Payment method deleted" })
        fetchPaymentMethods()
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast({ description: "Failed to delete payment method", variant: "destructive" })
    }
  }

  return (
    <>
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {methods.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No payment methods added yet</p>
              </div>
            ) : (
              methods.map((method) => (
                <Card
                  key={method._id}
                  className="p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">{method.type}</p>
                      <p className="text-xs text-muted-foreground">{method.accountNumber}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMethod(method._id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))
            )}
          </div>

          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full gap-2 bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Add Payment Method
            </Button>
          ) : (
            <Card className="p-4 space-y-4 border-primary/50 bg-primary/5">
              <form onSubmit={handleAddMethod} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Payment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-background mt-1 text-sm"
                  >
                    <option>M-PESA</option>
                    <option>Bank Transfer</option>
                    <option>PayPal</option>
                    <option>Airtel Money</option>
                    <option>Crypto Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Account Name</label>
                  <Input
                    type="text"
                    placeholder="Account holder name"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Number</label>
                  <Input
                    type="text"
                    placeholder="Account number or phone"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="mt-1"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </>
  )
}
