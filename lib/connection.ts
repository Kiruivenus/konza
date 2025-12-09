import { getDb } from "@/lib/mongodb"

export async function getDatabase() {
  return await getDb()
}
