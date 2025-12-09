import { MiningDashboard } from "@/components/mining/mining-dashboard"

export default function MiningPage() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mining</h1>
        <p className="text-muted-foreground">Mine Konza Coin and earn rewards over time</p>
      </div>
      <MiningDashboard />
    </div>
  )
}
