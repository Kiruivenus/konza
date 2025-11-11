import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.status === "banned") {
      return NextResponse.json({ error: "Your account has been banned" }, { status: 403 })
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "Your account has been suspended" }, { status: 403 })
    }

    if (Array.isArray(user.restrictions) && user.restrictions.includes("mine")) {
      return NextResponse.json({ error: "Mining feature is restricted for your account" }, { status: 403 })
    }

    const settings = await db.collection("settings").findOne({})

    if (!settings?.miningEnabled) {
      console.log("[v0] Mining start failed: Mining is disabled in settings")
      return NextResponse.json({ error: "Mining is currently disabled" }, { status: 400 })
    }

    // Check if user already has an active mining session
    const existingSession = await db.collection("mining").findOne({
      userId: new ObjectId(session.userId),
      status: "active",
    })

    if (existingSession) {
      console.log("[v0] Mining start failed: User already has active session")
      return NextResponse.json({ error: "You already have an active mining session" }, { status: 400 })
    }

    const durationHours = settings.miningSessionDuration || 24
    const rewardRate = settings.miningRewardRate || 10

    console.log("[v0] Starting mining session:", {
      userId: session.userId,
      durationHours,
      rewardRate,
    })

    // Create new mining session
    const miningSession = {
      userId: new ObjectId(session.userId),
      username: user.username,
      walletAddress: user.walletAddress,
      startTime: new Date(),
      endTime: new Date(Date.now() + durationHours * 60 * 60 * 1000), // Convert hours to ms
      rewardRate,
      status: "active",
      claimed: false,
      createdAt: new Date(),
    }

    const result = await db.collection("mining").insertOne(miningSession)

    console.log("[v0] Mining session created:", result.insertedId)

    return NextResponse.json({
      success: true,
      session: {
        _id: result.insertedId,
        ...miningSession,
      },
    })
  } catch (error) {
    console.error("[v0] Start mining error:", error)
    return NextResponse.json({ error: "Failed to start mining" }, { status: 500 })
  }
}
