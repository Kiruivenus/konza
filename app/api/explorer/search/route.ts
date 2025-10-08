import { type NextRequest, NextResponse } from "next/server"
import { getTransactionsCollection } from "@/lib/db/collections"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hash = searchParams.get("hash")

    if (!hash) {
      return NextResponse.json({ error: "Transaction hash is required" }, { status: 400 })
    }

    const transactionsCollection = await getTransactionsCollection()
    const transaction = await transactionsCollection.findOne({ hash })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error("[v0] Search transaction error:", error)
    return NextResponse.json({ error: "Failed to search transaction" }, { status: 500 })
  }
}
