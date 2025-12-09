import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await verifySession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const swaps = await db
      .collection("swaps")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            userId: 1,
            userEmail: "$user.email",
            fromCurrency: 1,
            toCurrency: 1,
            fromAmount: 1,
            toAmount: 1,
            rate: 1,
            status: 1,
            timestamp: 1,
          },
        },
        { $sort: { timestamp: -1 } },
        { $limit: 100 },
      ])
      .toArray()

    return NextResponse.json({ swaps })
  } catch (error) {
    console.error("[v0] Admin swaps error:", error)
    return NextResponse.json({ error: "Failed to fetch swaps" }, { status: 500 })
  }
}
