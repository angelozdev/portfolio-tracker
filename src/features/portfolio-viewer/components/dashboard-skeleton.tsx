import Card from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Skeleton className="h-4 w-[200px]" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Card.Title className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </Card.Title>
              <Skeleton className="h-4 w-4 rounded-full" />
            </Card.Header>
            <Card.Content>
              <div className="text-2xl font-bold">
                <Skeleton className="h-8 w-[120px] mb-1" />
              </div>
              <Skeleton className="h-3 w-[150px]" />
            </Card.Content>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Allocation Chart Skeleton */}
        <Card>
          <Card.Header>
            <Card.Title>Allocation</Card.Title>
            <Skeleton className="h-4 w-[200px]" />
          </Card.Header>
          <Card.Content>
            <div className="h-[300px] flex items-center justify-center">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </div>
          </Card.Content>
        </Card>

        {/* Rebalance Strategy Skeleton */}
        <div className="hidden md:block">
          <Card className="h-full">
            <Card.Header>
              <Card.Title>Rebalance Strategy</Card.Title>
              <Skeleton className="h-4 w-[200px]" />
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
                <br />
                <Skeleton className="h-4 w-full" />
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Rebalance Table Skeleton */}
      <Card>
        <Card.Header>
          <Card.Title>Rebalance Actions</Card.Title>
          <Skeleton className="h-4 w-[300px]" />
        </Card.Header>
        <Card.Content>
          <div className="space-y-2">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-4 w-[100px]" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
