import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth/session"

export async function POST() {
  try {
    await deleteSession()
    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
