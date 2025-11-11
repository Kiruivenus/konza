import { type NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth/session"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateTransactionHash } from "@/lib/utils/wallet"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Swap execute: Starting...")
    const session = await verifySession()
    if (!session) {
      console.log("[v0] Swap execute: Unauthorized - no session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { fromCurrency, toCurrency, amount, pin } = await request.json()
    console.log("[v0] Swap execute: Request data:", { fromCurrency, toCurrency, amount, pinLength: pin?.length })

    // Validate input
    if (!fromCurrency || !toCurrency || !amount || !pin) {
      console.log("[v0] Swap execute: Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (amount <= 0) {
      console.log("[v0] Swap execute: Invalid amount")
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = await getDb()

    // Get user
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })
    if (!user) {
      console.log("[v0] Swap execute: User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Swap execute: User found, checking restrictions...")

    if (user.status === "banned") {
      return NextResponse.json({ error: "Your account has been banned" }, { status: 403 })
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "Your account has been suspended" }, { status: 403 })
    }

    if (Array.isArray(user.restrictions) && user.restrictions.includes("swap")) {
      return NextResponse.json({ error: "Swap feature is restricted for your account" }, { status: 403 })
    }

    // Check KYC status
    if (user.kycStatus?.toLowerCase() !== "approved") {
      console.log("[v0] Swap execute: KYC not approved, status:", user.kycStatus)
      return NextResponse.json({ error: "KYC verification required for swaps" }, { status: 403 })
    }

    console.log("[v0] Swap execute: Verifying PIN...")
    if (!user.walletPin) {
      console.log("[v0] Swap execute: No PIN set for user")
      return NextResponse.json({ error: "Please set up a PIN first" }, { status: 400 })
    }

    const isPinValid = await bcrypt.compare(pin, user.walletPin)
    console.log("[v0] Swap execute: PIN valid:", isPinValid)

    if (!isPinValid) {
      console.log("[v0] Swap execute: Invalid PIN provided")
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }

    // Get settings and coin price
    const settings = await db.collection("settings").findOne({})
    const coinPrice = await db.collection("coinprice").findOne({}, { sort: { timestamp: -1 } })

    console.log("[v0] Swap execute: Settings and price fetched")

    if (!settings || !coinPrice) {
      console.log("[v0] Swap execute: Missing settings or coin price")
      return NextResponse.json({ error: "System configuration error" }, { status: 500 })
    }

    // Check if swap is enabled
    if (!settings.swapEnabled) {
      console.log("[v0] Swap execute: Swaps disabled")
      return NextResponse.json({ error: "Swaps are currently disabled" }, { status: 400 })
    }

    // Check minimum swap amount
    if (amount < settings.minSwapAmount) {
      console.log("[v0] Swap execute: Amount below minimum")
      return NextResponse.json(
        {
          error: `Minimum swap amount is ${settings.minSwapAmount} ${fromCurrency}`,
        },
        { status: 400 },
      )
    }

    // Calculate swap
    const swapFee = settings.swapFee || 0.01
    let receivedAmount: number
    let rate: number

    console.log("[v0] Swap execute: Calculating swap amounts...")

    if (fromCurrency === "KZC" && toCurrency === "USDT") {
      rate = coinPrice.price
      receivedAmount = amount * rate * (1 - swapFee)

      // Check if user has enough KZC balance
      if (user.balance < amount) {
        console.log("[v0] Swap execute: Insufficient KZC balance", { userBalance: user.balance, required: amount })
        return NextResponse.json({ error: "Insufficient KZC balance" }, { status: 400 })
      }

      // Update balances
      const updateResult = await db.collection("users").updateOne(
        { _id: new ObjectId(session.userId) },
        {
          $inc: {
            balance: -amount,
            usdtBalance: receivedAmount,
          },
        },
      )
      console.log("[v0] Swap execute: KZC to USDT swap completed", { updateResult })
    } else if (fromCurrency === "USDT" && toCurrency === "KZC") {
      rate = 1 / coinPrice.price
      receivedAmount = amount * rate * (1 - swapFee)

      // Check if user has enough USDT balance
      if ((user.usdtBalance || 0) < amount) {
        console.log("[v0] Swap execute: Insufficient USDT balance", { userBalance: user.usdtBalance, required: amount })
        return NextResponse.json({ error: "Insufficient USDT balance" }, { status: 400 })
      }

      // Update balances
      const updateResult = await db.collection("users").updateOne(
        { _id: new ObjectId(session.userId) },
        {
          $inc: {
            balance: receivedAmount,
            usdtBalance: -amount,
          },
        },
      )
      console.log("[v0] Swap execute: USDT to KZC swap completed", { updateResult })
    } else {
      console.log("[v0] Swap execute: Invalid currency pair")
      return NextResponse.json({ error: "Invalid currency pair" }, { status: 400 })
    }

    // Create swap record
    const swap = {
      userId: new ObjectId(session.userId),
      fromCurrency,
      toCurrency,
      fromAmount: amount,
      toAmount: receivedAmount,
      rate,
      fee: amount * swapFee,
      status: "completed",
      timestamp: new Date(),
      createdAt: new Date(),
    }

    await db.collection("swaps").insertOne(swap)
    console.log("[v0] Swap execute: Swap record created")

    // Create transaction record
    const transaction = {
      hash: generateTransactionHash(),
      type: "swap",
      from: user.walletAddress,
      to: user.walletAddress,
      amount: receivedAmount,
      fee: amount * swapFee,
      status: "completed",
      metadata: {
        fromCurrency,
        toCurrency,
        fromAmount: amount,
        rate,
      },
      timestamp: new Date(),
      createdAt: new Date(),
    }

    await db.collection("transactions").insertOne(transaction)

    console.log("[v0] Swap execute: Success! Transaction hash:", transaction.hash)

    return NextResponse.json({
      success: true,
      message: `Successfully swapped ${amount} ${fromCurrency} to ${receivedAmount.toFixed(6)} ${toCurrency}`,
      swap: {
        ...swap,
        _id: swap.userId,
      },
      transaction: transaction.hash,
    })
  } catch (error) {
    console.error("[v0] Execute swap error:", error)
    return NextResponse.json({ error: "Failed to execute swap. Please try again." }, { status: 500 })
  }
}
