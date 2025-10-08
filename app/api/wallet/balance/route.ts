import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const usersCollection = await getUsersCollection()

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const priceRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/price/current`)
    const priceData = await priceRes.json()
    const currentPrice = priceData.price || 1.25

    return NextResponse.json({
      balance: user.balance,
      usdtBalance: user.usdtBalance,
      walletAddress: user.walletAddress,
      kzcPrice: currentPrice,
      usdtEquivalent: user.balance * currentPrice,
    })
  } catch (error) {
    console.error("[v0] Get balance error:", error)
    return NextResponse.json({ error: "Failed to get balance" }, { status: 500 })
  }
}
