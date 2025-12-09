import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUsersCollection } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { firstName, lastName, phone } = await request.json()

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.findOne({ _id: new ObjectId(session.userId) })

    if (firstName) {
      if (user?.profile?.firstName && user?.profile?.firstName !== firstName) {
        return NextResponse.json({ error: "First name cannot be changed once set" }, { status: 400 })
      }
    }

    if (lastName) {
      if (user?.profile?.lastName && user?.profile?.lastName !== lastName) {
        return NextResponse.json({ error: "Last name cannot be changed once set" }, { status: 400 })
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (phone) {
      updateData.phone = phone
    }

    if (firstName) {
      updateData["profile.firstName"] = firstName
    }

    if (lastName) {
      updateData["profile.lastName"] = lastName
    }

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: updateData,
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
