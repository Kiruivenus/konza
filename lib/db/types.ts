import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  username: string
  phone: string
  password: string
  walletAddress: string
  walletPin?: string
  balance: number
  usdtBalance: number
  kycStatus: "Pending" | "Approved" | "Rejected" | "Not Submitted"
  referralCode: string
  referredBy?: string
  profile: {
    firstName?: string
    lastName?: string
    country?: string
    city?: string
    address?: string
    postalCode?: string
    dob?: string
    documentNumber?: string
  }
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  hash: string
  type: "send" | "receive" | "mining" | "referral" | "swap"
  sender: string
  receiver: string
  amount: number
  fee: number
  status: "Success" | "Pending" | "Failed"
  timestamp: Date
}

export interface Swap {
  _id?: ObjectId
  userId: ObjectId
  username: string
  walletAddress: string
  amountKZC: number
  amountUSDT: number
  rate: number
  status: "Completed" | "Pending" | "Failed"
  timestamp: Date
}

export interface CoinPrice {
  _id?: ObjectId
  price: number // Current calculated price
  basePrice: number // Base/starting price for current phase
  targetPrice: number // Target price to reach (for rising/falling)
  trend: "rising" | "falling" | "stable"
  changePercentage: number

  risingDuration: number // Duration in hours for rising phase
  fallingDuration: number // Duration in hours for falling phase
  stableDuration: number // Duration in hours for stable phase
  stableFluctuationRange: number // Percentage range for stable fluctuation (e.g., 0.5 for ±0.5%)

  phaseStartTime: Date // When current phase started
  phaseEndTime: Date // When current phase should end

  timestamp: Date
  updatedBy?: string
}

export interface Settings {
  _id?: ObjectId
  transferFee: number
  swapEnabled: boolean
  swapFee: number // Added swap fee field
  minSwapAmount: number
  kycRequiredForSwap: boolean
  referralEnabled: boolean
  referralBonus: number
  miningEnabled: boolean
  miningRewardRate: number
  miningSessionDuration: number // Renamed from miningDuration for consistency
  platformName: string
  updatedAt: Date
}

export interface KYC {
  _id?: ObjectId
  userId: ObjectId
  username: string
  documentImage: string
  selfieImage: string
  status: "Pending" | "Approved" | "Rejected"
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  notes?: string
}

export interface Mining {
  _id?: ObjectId
  userId: ObjectId
  username: string
  walletAddress: string
  amount: number
  sessionStart: Date
  sessionEnd: Date
  status: "Active" | "Completed"
}

export interface Referral {
  _id?: ObjectId
  referrerId: ObjectId
  referrerUsername: string
  referredId: ObjectId
  referredUsername: string
  bonusAmount: number
  status: "Pending" | "Completed"
  createdAt: Date
  completedAt?: Date
}
