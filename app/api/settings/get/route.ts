import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const settings = await db.collection("settings").findOne({})

    if (!settings) {
      return NextResponse.json({
        settings: {
          transferFee: 0,
          swapEnabled: true,
          minSwapAmount: 0,
          swapFee: 0,
          miningEnabled: true,
          miningRewardRate: 0,
          miningSessionDuration: 24,
          referralEnabled: true,
          referralBonus: 0,
        },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("[v0] Get settings error:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}
