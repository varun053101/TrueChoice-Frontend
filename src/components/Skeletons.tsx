import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Election card skeleton for lists
export function ElectionCardSkeleton() {
    return (
        <Card className="border-border/50">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex items-center gap-4 pt-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
            </CardContent>
        </Card>
    );
}

// Stats card skeleton
export function StatsCardSkeleton() {
    return (
        <Card className="border-border/50">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-12" />
                    </div>
                    <Skeleton className="w-14 h-14 rounded-2xl" />
                </div>
            </CardContent>
        </Card>
    );
}

// Dashboard skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>

            {/* Election cards */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <ElectionCardSkeleton />
                <ElectionCardSkeleton />
            </div>
        </div>
    );
}

// Elections list skeleton
export function ElectionsListSkeleton() {
    return (
        <div className="space-y-4">
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
        </div>
    );
}

// Results page skeleton
export function ResultsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>

            {/* Winner card */}
            <Card className="border-2 border-muted p-8">
                <div className="flex items-center gap-6">
                    <Skeleton className="w-28 h-28 rounded-full" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Candidates list */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="w-14 h-14 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                    <Skeleton className="h-3 w-full rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Table row skeleton
export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20" />
        </div>
    );
}
