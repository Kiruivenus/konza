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
    const referrals = await db
      .collection("referrals")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "referrerId",
            foreignField: "_id",
            as: "referrer",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "referredId",
            foreignField: "_id",
            as: "referred",
          },
        },
        { $unwind: "$referrer" },
        { $unwind: "$referred" },
        {
          $project: {
            referrerId: 1,
            referrerEmail: "$referrer.email",
            referredId: 1,
            referredEmail: "$referred.email",
            status: 1,
            bonusAmount: 1,
            createdAt: 1,
            completedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 100 },
      ])
      .toArray()

    return NextResponse.json({ referrals })
  } catch (error) {
    console.error("[v0] Admin referrals error:", error)
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
  }
}
