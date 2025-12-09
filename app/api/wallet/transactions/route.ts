import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection, getTransactionsCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const usersCollection = await getUsersCollection()
    const transactionsCollection = await getTransactionsCollection()

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all transactions where user is sender or receiver
    const transactions = await transactionsCollection
      .find({
        $or: [{ sender: user.walletAddress }, { receiver: user.walletAddress }],
      })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "Failed to get transactions" }, { status: 500 })
  }
}
