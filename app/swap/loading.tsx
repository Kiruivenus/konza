import { Skeleton } from "@/components/ui/skeleton"

export default function SwapLoading() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-24 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
