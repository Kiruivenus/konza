import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[v0] Testing MongoDB connection...")
    console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)
    console.log("[v0] MONGODB_URI format:", process.env.MONGODB_URI?.substring(0, 20) + "...")

    const db = await getDb()

    // Test a simple operation
    const collections = await db.listCollections().toArray()
    console.log("[v0] Successfully connected to MongoDB")
    console.log(
      "[v0] Available collections:",
      collections.map((c) => c.name),
    )

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      collections: collections.map((c) => c.name),
    })
  } catch (error: any) {
    console.error("[v0] MongoDB connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: {
          name: error.name,
          code: error.code,
          cause: error.cause?.message,
        },
      },
      { status: 500 },
    )
  }
}
