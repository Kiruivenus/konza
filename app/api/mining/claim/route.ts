import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "@/lib/utils/wallet"

export async function POST(request: NextRequest) {
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
      claimed: false,
    })

    if (!miningSession) {
      return NextResponse.json({ error: "No active mining session found" }, { status: 400 })
    }

    // Check if mining is complete
    const now = new Date()
    const endTime = new Date(miningSession.endTime)

    if (now < endTime) {
      return NextResponse.json({ error: "Mining session not yet complete" }, { status: 400 })
    }

    // Get user
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate final reward
    const reward = miningSession.rewardRate

    // Create transaction record
    const transaction = {
      hash: generateTransactionHash(),
      type: "mining",
      from: "SYSTEM",
      to: user.walletAddress,
      amount: reward,
      fee: 0,
      status: "completed",
      timestamp: new Date(),
      createdAt: new Date(),
    }

    // Update user balance and mining session in a transaction-like manner
    await db.collection("users").updateOne({ _id: new ObjectId(session.userId) }, { $inc: { balance: reward } })

    await db.collection("mining").updateOne(
      { _id: miningSession._id },
      {
        $set: {
          status: "completed",
          claimed: true,
          claimedAt: new Date(),
        },
      },
    )

    await db.collection("transactions").insertOne(transaction)

    return NextResponse.json({
      success: true,
      reward,
      transaction: transaction.hash,
    })
  } catch (error) {
    console.error("Claim mining error:", error)
    return NextResponse.json({ error: "Failed to claim mining reward" }, { status: 500 })
  }
}
