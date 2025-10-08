import { Skeleton } from "@/components/ui/skeleton"

export default function MiningLoading() {
  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
