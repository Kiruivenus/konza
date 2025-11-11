import { type NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/auth/admin"
import { getDatabase } from "@/lib/db/connection"

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getAdminUser(req)
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, amount, comment, username } = await req.json()

    console.log("[v0] Coin distribution starting:", { type, amount, comment, username })

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection("users")
    const transactionsCollection = db.collection("transactions")

    if (type === "single") {
      if (!username) {
        return NextResponse.json({ error: "Username is required for single distribution" }, { status: 400 })
      }

      const user = await usersCollection.findOne({ username })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      await usersCollection.updateOne({ _id: user._id }, { $inc: { balance: amount } })

      await transactionsCollection.insertOne({
        hash: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "distribute",
        sender: "Admin",
        receiver: user.username,
        amount,
        fee: 0,
        status: "Success",
        comment,
        distributedBy: adminUser.username,
        timestamp: new Date(),
      })

      console.log("[v0] Distribution completed for user:", { username, amount, comment })

      return NextResponse.json({
        message: "Distribution completed",
        recipients: 1,
      })
    } else if (type === "all") {
      const allUsers = await usersCollection.find({ status: { $ne: "banned" } }).toArray()

      console.log("[v0] Distributing to all users, count:", allUsers.length)

      for (const user of allUsers) {
        await usersCollection.updateOne({ _id: user._id }, { $inc: { balance: amount } })

        await transactionsCollection.insertOne({
          hash: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "distribute",
          sender: "Admin",
          receiver: user.username,
          amount,
          fee: 0,
          status: "Success",
          comment,
          distributedBy: adminUser.username,
          timestamp: new Date(),
        })
      }

      console.log("[v0] Distribution completed for all users:", { total: allUsers.length, amount, comment })

      return NextResponse.json({
        message: "Distribution completed for all users",
        recipients: allUsers.length,
      })
    } else {
      return NextResponse.json({ error: "Invalid distribution type" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Distribution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
