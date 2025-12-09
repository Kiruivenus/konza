import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getKYCCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const kycCollection = await getKYCCollection()
    const kyc = await kycCollection.findOne({ userId: new ObjectId(session.userId) })

    if (!kyc) {
      return NextResponse.json({ status: "Not Submitted" })
    }

    return NextResponse.json({
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
      notes: kyc.notes,
    })
  } catch (error) {
    console.error("[v0] Get KYC status error:", error)
    return NextResponse.json({ error: "Failed to get KYC status" }, { status: 500 })
  }
}
