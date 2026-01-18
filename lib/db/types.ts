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
  status?: "active" | "banned" | "suspended"
  restrictions?: string[] // Array of restricted features: "swap", "mine", "transfer"
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
  emailVerified: boolean // Track if email is verified
  twoFactorEnabled: boolean // Track if 2FA is enabled
  twoFactorCode?: string // Current 2FA code
  twoFactorExpiresAt?: Date // 2FA code expiration
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  _id?: ObjectId
  hash: string
  type: "send" | "receive" | "mining" | "referral" | "swap" | "admin_distribution"
  sender: string
  receiver: string
  amount: number
  fee: number
  status: "Success" | "Pending" | "Failed"
  comment?: string
  distributedBy?: string
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
  status: "pending" | "completed"
  createdAt: Date
  completedAt?: Date
}

export interface EmailVerification {
  _id?: ObjectId
  userId: ObjectId
  email: string
  code: string
  expiresAt: Date
  createdAt: Date
}

export interface PasswordReset {
  _id?: ObjectId
  userId: ObjectId
  email: string
  code: string
  expiresAt: Date
  createdAt: Date
}

export interface P2PAgent {
  _id?: ObjectId
  userId: ObjectId
  username: string
  email: string
  kycVerified: boolean
  agentVerified: boolean
  verifiedAt?: Date
  verifiedBy?: string
  twoFactorEnabled: boolean
  securityDeposit: number
  totalTrades: number
  completionRate: number
  rating: number
  totalRatings: number
  status: "active" | "suspended" | "banned"
  paymentMethods: string[]
  createdAt: Date
  updatedAt: Date
}

export interface P2POffer {
  _id?: ObjectId
  agentId: ObjectId
  username: string
  coin: "KZC" | "USDT"
  type: "buy" | "sell"
  price: number
  minLimit: number
  maxLimit: number
  available: number
  paymentMethods: string[]
  terms?: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface P2PTrade {
  _id?: ObjectId
  offerId: ObjectId
  buyerId: ObjectId
  buyerUsername: string
  buyerEmail: string
  sellerId: ObjectId
  sellerUsername: string
  sellerEmail: string
  coin: "KZC" | "USDT"
  amount: number
  pricePerUnit: number
  totalPrice: number
  paymentMethod: string
  status: "pending" | "payment_waiting" | "payment_confirmed" | "completed" | "cancelled" | "disputed"
  escrowAmount: number
  platformFee: number
  buyerMarkedPaid: boolean
  sellerConfirmedPayment: boolean
  timeoutAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PaymentMethod {
  _id?: ObjectId
  userId: ObjectId
  username: string
  type: "mPesa" | "bank" | "paypal" | "airtelMoney" | "crypto"
  accountName: string
  accountNumber: string
  bankName?: string
  phoneNumber?: string
  walletAddress?: string
  isDefault: boolean
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface P2PDispute {
  _id?: ObjectId
  tradeId: ObjectId
  reporterId: ObjectId
  reporterUsername: string
  respondentId: ObjectId
  respondentUsername: string
  reason: string
  description: string
  evidence: string[] // URLs to uploaded proof images
  status: "open" | "investigating" | "resolved"
  resolution?: "refund_buyer" | "release_seller" | "partial_refund"
  resolvedBy?: string
  resolutionNotes?: string
  createdAt: Date
  resolvedAt?: Date
}

export interface P2PRating {
  _id?: ObjectId
  tradeId: ObjectId
  raterId: ObjectId
  raterUsername: string
  rateeId: ObjectId
  rateeUsername: string
  rating: number // 1-5 stars
  comment: string
  createdAt: Date
}

export interface Escrow {
  _id?: ObjectId
  tradeId: ObjectId
  coin: "KZC" | "USDT"
  amount: number
  holdingAddress: string
  status: "locked" | "released" | "refunded"
  releasedTo?: string
  releaseReason?: string
  createdAt: Date
  releasedAt?: Date
}
