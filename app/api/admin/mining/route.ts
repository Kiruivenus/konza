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
    const sessions = await db
      .collection("mining")
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
            reward: 1,
            status: 1,
            startTime: 1,
            endTime: 1,
            claimedAt: 1,
          },
        },
        { $sort: { startTime: -1 } },
        { $limit: 100 },
      ])
      .toArray()

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("[v0] Admin mining error:", error)
    return NextResponse.json({ error: "Failed to fetch mining sessions" }, { status: 500 })
  }
}
