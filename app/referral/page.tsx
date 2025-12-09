import { ReferralDashboard } from "@/components/referral/referral-dashboard"

export default function ReferralPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b">
        <div className="container max-w-6xl py-12 px-4">
          <h1 className="text-4xl font-bold mb-3">Referral Program</h1>
          <p className="text-lg text-muted-foreground">
            Invite friends and earn rewards together. Share your code and start earning today!
          </p>
        </div>
      </div>

      <div className="container max-w-6xl py-8 px-4">
        <ReferralDashboard />
      </div>
    </div>
  )
}
