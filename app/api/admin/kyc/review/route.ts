import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import {
  getUsersCollection,
  getKYCCollection,
  getReferralsCollection,
  getSettingsCollection,
} from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { kycId, status, notes } = body

    if (!kycId || !status) {
      return NextResponse.json({ error: "KYC ID and status are required" }, { status: 400 })
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const kycCollection = await getKYCCollection()
    const usersCollection = await getUsersCollection()

    const kyc = await kycCollection.findOne({ _id: new ObjectId(kycId) })

    if (!kyc) {
      return NextResponse.json({ error: "KYC submission not found" }, { status: 404 })
    }

    // Update KYC status
    await kycCollection.updateOne(
      { _id: new ObjectId(kycId) },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: session.username,
          notes: notes || "",
        },
      },
    )

    // Update user KYC status
    await usersCollection.updateOne({ _id: kyc.userId }, { $set: { kycStatus: status } })

    // If approved, process referral bonus
    if (status === "Approved") {
      const referralsCollection = await getReferralsCollection()
      const settingsCollection = await getSettingsCollection()

      const referral = await referralsCollection.findOne({
        referredId: kyc.userId,
        status: "Pending",
      })

      if (referral) {
        const settings = await settingsCollection.findOne({})
        const referralBonus = settings?.referralBonus || 50

        // Update referrer balance
        await usersCollection.updateOne({ _id: referral.referrerId }, { $inc: { balance: referralBonus } })

        // Update referral status
        await referralsCollection.updateOne(
          { _id: referral._id },
          {
            $set: {
              status: "Completed",
              bonusAmount: referralBonus,
              completedAt: new Date(),
            },
          },
        )

        // Create referral transaction
        const { getTransactionsCollection } = await import("@/lib/db/collections")
        const { generateTransactionHash } = await import("@/lib/utils/wallet")
        const transactionsCollection = await getTransactionsCollection()

        const referrer = await usersCollection.findOne({ _id: referral.referrerId })

        if (referrer) {
          await transactionsCollection.insertOne({
            hash: generateTransactionHash(),
            type: "referral",
            sender: "SYSTEM",
            receiver: referrer.walletAddress,
            amount: referralBonus,
            fee: 0,
            status: "Success",
            timestamp: new Date(),
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `KYC ${status.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error("[v0] KYC review error:", error)
    return NextResponse.json({ error: "Failed to review KYC" }, { status: 500 })
  }
}
