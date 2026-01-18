"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Agent {
  _id: string
  userId: string
  username: string
  email: string
  status: "pending" | "approved" | "rejected"
  tradingExperience: number
  businessDetails: string
  paymentMethods: string[]
  rating: number
  createdAt: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchAgents()
  }, [filter])

  const fetchAgents = async () => {
    try {
      const res = await fetch(`/api/admin/p2p/agents/list?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setAgents(data)
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
      toast({ description: "Failed to load agents", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/p2p/agents/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast({ description: "Agent approved successfully" })
        fetchAgents()
      }
    } catch (error) {
      console.error("Error approving agent:", error)
      toast({ description: "Failed to approve agent", variant: "destructive" })
    }
  }

  const handleDecline = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/p2p/agents/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast({ description: "Agent application declined" })
        fetchAgents()
      }
    } catch (error) {
      console.error("Error declining agent:", error)
      toast({ description: "Failed to decline agent", variant: "destructive" })
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/p2p/agents/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast({ description: "Agent status updated" })
        fetchAgents()
      }
    } catch (error) {
      console.error("Error toggling agent status:", error)
      toast({ description: "Failed to update agent status", variant: "destructive" })
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Agent Management</h1>

      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading agents...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No agents found</div>
      ) : (
        <div className="space-y-4">
          {agents.map((agent) => (
            <Card key={agent._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{agent.username || "N/A"}</h3>
                    <p className="text-sm text-muted-foreground">{agent.email || "N/A"}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={agent.status === "approved" ? "default" : "outline"}>{agent.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-semibold">{agent.tradingExperience || 0} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-semibold">{(agent.rating || 0).toFixed(1)}★</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Business Details</p>
                  <p className="text-sm mt-1">{agent.businessDetails || "No details provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Payment Methods</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.paymentMethods && agent.paymentMethods.length > 0 ? (
                      agent.paymentMethods.map((method) => (
                        <Badge key={method} variant="secondary" className="text-xs">
                          {method}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No payment methods provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {agent.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => handleApprove(agent.userId)} className="gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDecline(agent.userId)}
                      className="gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
