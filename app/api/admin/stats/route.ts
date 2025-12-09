import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get statistics
    const totalUsers = await db.collection("users").countDocuments({ role: "user" })
    const totalTransactions = await db.collection("transactions").countDocuments()
    const totalSwaps = await db.collection("swaps").countDocuments()
    const pendingKYC = await db.collection("users").countDocuments({ kycStatus: "pending" })

    // Get total KZC in circulation
    const users = await db.collection("users").find({ role: "user" }).toArray()
    const totalKZC = users.reduce((sum, user) => sum + (user.balance || 0), 0)
    const totalUSDT = users.reduce((sum, user) => sum + (user.usdtBalance || 0), 0)

    // Get recent transactions
    const recentTransactions = await db.collection("transactions").find().sort({ timestamp: -1 }).limit(5).toArray()

    // Get coin price
    const coinPrice = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })

    return NextResponse.json({
      totalUsers,
      totalTransactions,
      totalSwaps,
      pendingKYC,
      totalKZC,
      totalUSDT,
      currentPrice: coinPrice?.price || 0,
      recentTransactions,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 })
  }
}
