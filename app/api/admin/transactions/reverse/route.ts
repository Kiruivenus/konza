import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    const db = await getDb()

    // Get the transaction
    const transaction = await db.collection("transactions").findOne({ _id: new ObjectId(transactionId) })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.status === "Reversed") {
      return NextResponse.json({ error: "Transaction already reversed" }, { status: 400 })
    }

    // Get sender and receiver
    const sender = await db.collection("users").findOne({ walletAddress: transaction.sender })
    const receiver = await db.collection("users").findOne({ walletAddress: transaction.receiver })

    if (!sender || !receiver) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const currency = transaction.currency || "KZC"
    const balanceField = currency === "USDT" ? "usdtBalance" : "balance"

    // Reverse the transaction
    await db
      .collection("users")
      .updateOne({ _id: sender._id }, { $inc: { [balanceField]: transaction.amount + transaction.fee } })

    await db.collection("users").updateOne({ _id: receiver._id }, { $inc: { [balanceField]: -transaction.amount } })

    // Update transaction status
    await db.collection("transactions").updateOne(
      { _id: new ObjectId(transactionId) },
      {
        $set: {
          status: "Reversed",
          reversedAt: new Date(),
          reversedBy: session.username,
        },
      },
    )

    return NextResponse.json({ success: true, message: "Transaction reversed successfully" })
  } catch (error) {
    console.error("[v0] Reverse transaction error:", error)
    return NextResponse.json({ error: "Failed to reverse transaction" }, { status: 500 })
  }
}
