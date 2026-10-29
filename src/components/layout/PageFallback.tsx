import { Card, Skeleton } from '../ui'

export default function PageFallback() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Memuat halaman"
    >
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </Card>
      </div>
    </div>
  )
}
