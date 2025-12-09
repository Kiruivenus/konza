import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getKYCCollection, getUsersCollection } from "@/lib/db/collections"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const kycCollection = await getKYCCollection()
    const usersCollection = await getUsersCollection()

    const kycSubmissions = await kycCollection.find({ status: "Pending" }).sort({ submittedAt: -1 }).toArray()

    // Enrich with user data
    const requests = await Promise.all(
      kycSubmissions.map(async (kyc) => {
        const user = await usersCollection.findOne({ _id: kyc.userId })
        return {
          _id: kyc._id,
          userId: kyc.userId,
          username: user?.username || kyc.username,
          email: user?.email || "",
          documentImage: kyc.documentImage,
          documentBackImage: kyc.documentBackImage,
          selfieImage: kyc.selfieImage,
          status: kyc.status,
          submittedAt: kyc.submittedAt,
          notes: kyc.notes,
        }
      }),
    )

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("[v0] Get KYC list error:", error)
    return NextResponse.json({ error: "Failed to get KYC submissions" }, { status: 500 })
  }
}
