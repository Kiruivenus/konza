"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Pickaxe, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MiningSession {
  _id: string
  userId: string
  userEmail: string
  reward: number
  status: string
  startTime: string
  endTime?: string
  claimedAt?: string
}

export default function MiningPage() {
  const [sessions, setSessions] = useState<MiningSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      console.log("[v0] Fetching mining sessions...")
      const res = await fetch("/api/admin/mining")
      const data = await res.json()

      console.log("[v0] Mining sessions response:", data)

      if (res.ok) {
        setSessions(data.sessions || [])
      } else {
        setError(data.error || "Failed to fetch mining sessions")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch mining sessions:", error)
      setError("Failed to fetch mining sessions")
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold mb-2">Mining Sessions</h1>
        <p className="text-muted-foreground">All mining activity on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Mining Sessions ({sessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session._id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Pickaxe className="h-4 w-4 text-primary" />
                    <p className="font-medium">{session.userEmail}</p>
                    <Badge
                      variant={
                        session.status === "completed"
                          ? "default"
                          : session.status === "active"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-primary">{session.reward?.toFixed(4) || "0.0000"} KZC</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Started: {new Date(session.startTime).toLocaleString()}</span>
                    </div>
                    {session.claimedAt && (
                      <span className="text-muted-foreground">
                        Claimed: {new Date(session.claimedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-center text-muted-foreground py-8">No mining sessions yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
