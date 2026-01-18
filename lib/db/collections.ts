import { getDatabase } from "@/lib/mongodb"

export async function getUsersCollection() {
  const db = await getDatabase()
  return db.collection("users")
}

export async function getTransactionsCollection() {
  const db = await getDatabase()
  return db.collection("transactions")
}

export async function getSwapsCollection() {
  const db = await getDatabase()
  return db.collection("swaps")
}

export async function getCoinPriceCollection() {
  const db = await getDatabase()
  return db.collection("coinprice")
}

export async function getSettingsCollection() {
  const db = await getDatabase()
  return db.collection("settings")
}

export async function getKYCCollection() {
  const db = await getDatabase()
  return db.collection("kyc")
}

export async function getMiningCollection() {
  const db = await getDatabase()
  return db.collection("mining")
}

export async function getReferralsCollection() {
  const db = await getDatabase()
  return db.collection("referrals")
}

export async function getEmailVerificationCollection() {
  const db = await getDatabase()
  return db.collection("emailVerifications")
}

export async function getPasswordResetCollection() {
  const db = await getDatabase()
  return db.collection("passwordResets")
}

export async function getP2PAgentsCollection() {
  const db = await getDatabase()
  return db.collection("p2p_agents")
}

export async function getP2PTradesCollection() {
  const db = await getDatabase()
  return db.collection("p2p_trades")
}

export async function getP2POffersCollection() {
  const db = await getDatabase()
  return db.collection("p2p_offers")
}

export async function getPaymentMethodsCollection() {
  const db = await getDatabase()
  return db.collection("payment_methods")
}

export async function getP2PDisputesCollection() {
  const db = await getDatabase()
  return db.collection("p2p_disputes")
}

export async function getP2PRatingsCollection() {
  const db = await getDatabase()
  return db.collection("p2p_ratings")
}

export async function getEscrowCollection() {
  const db = await getDatabase()
  return db.collection("escrow")
}
