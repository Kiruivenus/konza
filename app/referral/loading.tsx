import { Skeleton } from "@/components/ui/skeleton"

export default function ReferralLoading() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
