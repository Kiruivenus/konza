import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection, getEmailVerificationCollection } from "@/lib/db/collections"
import { hashPassword } from "@/lib/auth/password"
import { generateWalletAddress, generateReferralCode } from "@/lib/utils/wallet"
import { generate6DigitCode } from "@/lib/email/tokens"
import { sendVerificationEmail } from "@/lib/email/smtp"
import type { User } from "@/lib/db/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, phone, password, referralCode } = body

    // Validate required fields
    if (!email || !username || !phone || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 400 })
    }

    // Verify referral code if provided
    let referredBy: string | undefined
    if (referralCode) {
      const referrer = await usersCollection.findOne({ referralCode })
      if (referrer) {
        referredBy = referrer.username
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate wallet address and referral code
    const walletAddress = generateWalletAddress()
    const userReferralCode = generateReferralCode(username)

    // Create new user
    const newUser: User = {
      email: email.toLowerCase(),
      username,
      phone,
      password: hashedPassword,
      walletAddress,
      balance: 0,
      usdtBalance: 0,
      kycStatus: "Not Submitted",
      referralCode: userReferralCode,
      referredBy,
      emailVerified: false,
      twoFactorEnabled: false,
      profile: {},
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    const verificationCode = generate6DigitCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const emailVerificationCollection = await getEmailVerificationCollection()
    await emailVerificationCollection.insertOne({
      userId: result.insertedId,
      email,
      code: verificationCode,
      expiresAt,
      createdAt: new Date(),
    })

    await sendVerificationEmail(email, verificationCode)

    // If user was referred, create referral record
    if (referredBy) {
      const { getReferralsCollection } = await import("@/lib/db/collections")
      const referralsCollection = await getReferralsCollection()
      const referrer = await usersCollection.findOne({ username: referredBy })

      if (referrer) {
        await referralsCollection.insertOne({
          referrerId: referrer._id!,
          referrerUsername: referrer.username,
          referredId: result.insertedId,
          referredUsername: username,
          bonusAmount: 0,
          status: "pending",
          createdAt: new Date(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      walletAddress,
      referralCode: userReferralCode,
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
