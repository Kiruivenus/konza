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

    return NextResponse.json({
      user: {
        id: user._id!.toString(),
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        balance: user.balance,
        usdtBalance: user.usdtBalance,
        kycStatus: user.kycStatus,
        referralCode: user.referralCode,
        role: user.role,
        profile: user.profile,
        restrictions: user.restrictions || [],
        status: user.status || "active",
      },
    })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "Failed to get user data" }, { status: 500 })
  }
}
