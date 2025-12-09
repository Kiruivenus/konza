import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection } from "@/lib/db/collections"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ walletAddress: address })

    if (!user) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    return NextResponse.json({
      username: user.username,
      kycStatus: user.kycStatus,
      walletAddress: user.walletAddress,
    })
  } catch (error) {
    console.error("[v0] Check address error:", error)
    return NextResponse.json({ error: "Failed to check address" }, { status: 500 })
  }
}
