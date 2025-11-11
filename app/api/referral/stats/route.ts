import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const settings = await db.collection("settings").findOne({})
    const referralEnabled = settings?.referralEnabled ?? true

    // Get referral statistics
    const totalReferrals = await db.collection("referrals").countDocuments({
      referrerId: new ObjectId(session.userId),
    })

    const completedReferrals = await db.collection("referrals").countDocuments({
      referrerId: new ObjectId(session.userId),
      status: "completed",
    })

    const pendingReferrals = await db.collection("referrals").countDocuments({
      referrerId: new ObjectId(session.userId),
      status: "pending",
    })

    console.log(
      "[v0] Referral stats - Total:",
      totalReferrals,
      "Completed:",
      completedReferrals,
      "Pending:",
      pendingReferrals,
      "userId:",
      session.userId,
    )

    // Verify actual referral statuses in database
    const allReferrals = await db
      .collection("referrals")
      .find({ referrerId: new ObjectId(session.userId) })
      .toArray()

    console.log(
      "[v0] All referrals for user:",
      allReferrals.map((r) => ({ status: r.status, referredId: r.referredId })),
    )

    // Calculate total earnings
    const referrals = await db
      .collection("referrals")
      .find({ referrerId: new ObjectId(session.userId), status: "completed" })
      .toArray()

    const totalEarnings = referrals.reduce((sum, ref) => sum + (ref.bonusAmount || 0), 0)

    // Get recent referrals
    const recentReferrals = await db
      .collection("referrals")
      .aggregate([
        { $match: { referrerId: new ObjectId(session.userId) } },
        {
          $lookup: {
            from: "users",
            localField: "referredId",
            foreignField: "_id",
            as: "referredUser",
          },
        },
        { $unwind: "$referredUser" },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 1,
            referredUsername: "$referredUser.username",
            bonusAmount: 1,
            status: 1,
            createdAt: 1,
            completedAt: 1,
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      referralCode: user.referralCode,
      referralEnabled,
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalEarnings,
      recentReferrals,
    })
  } catch (error) {
    console.error("Referral stats error:", error)
    return NextResponse.json({ error: "Failed to get referral stats" }, { status: 500 })
  }
}
