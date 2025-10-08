import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection, getKYCCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { documentImage, documentBackImage, selfieImage } = body

    if (!documentImage || !documentBackImage || !selfieImage) {
      return NextResponse.json({ error: "Document front, back, and selfie images are required" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const kycCollection = await getKYCCollection()

    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user already has a pending or approved KYC
    const existingKYC = await kycCollection.findOne({ userId: user._id })

    if (existingKYC && existingKYC.status === "Approved") {
      return NextResponse.json({ error: "KYC already approved" }, { status: 400 })
    }

    if (existingKYC && existingKYC.status === "Pending") {
      return NextResponse.json({ error: "KYC submission already pending review" }, { status: 400 })
    }

    // Create or update KYC submission
    if (existingKYC) {
      await kycCollection.updateOne(
        { _id: existingKYC._id },
        {
          $set: {
            documentImage,
            documentBackImage,
            selfieImage,
            status: "Pending",
            submittedAt: new Date(),
          },
        },
      )
    } else {
      await kycCollection.insertOne({
        userId: user._id,
        username: user.username,
        documentImage,
        documentBackImage,
        selfieImage,
        status: "Pending",
        submittedAt: new Date(),
      })
    }

    // Update user KYC status
    await usersCollection.updateOne({ _id: user._id }, { $set: { kycStatus: "Pending" } })

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully. Please wait for admin review.",
    })
  } catch (error) {
    console.error("[v0] KYC submission error:", error)
    return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 })
  }
}
