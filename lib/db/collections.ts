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
