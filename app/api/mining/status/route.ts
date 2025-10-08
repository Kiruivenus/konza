import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get active mining session
    const miningSession = await db.collection("mining").findOne({
      userId: new ObjectId(session.userId),
      status: "active",
    })

    if (!miningSession) {
      return NextResponse.json({ session: null })
    }

    // Calculate progress and rewards
    const now = new Date()
    const startTime = new Date(miningSession.startTime)
    const endTime = new Date(miningSession.endTime)
    const totalDuration = endTime.getTime() - startTime.getTime()
    const elapsed = now.getTime() - startTime.getTime()
    const progress = Math.min((elapsed / totalDuration) * 100, 100)
    const isComplete = now >= endTime

    // Calculate current reward (proportional to time elapsed)
    const currentReward = miningSession.rewardRate * (elapsed / totalDuration)
    const totalReward = miningSession.rewardRate

    return NextResponse.json({
      session: {
        _id: miningSession._id,
        startTime: miningSession.startTime,
        endTime: miningSession.endTime,
        progress,
        isComplete,
        currentReward: Math.min(currentReward, totalReward),
        totalReward,
        claimed: miningSession.claimed,
      },
    })
  } catch (error) {
    console.error("Mining status error:", error)
    return NextResponse.json({ error: "Failed to get mining status" }, { status: 500 })
  }
}
