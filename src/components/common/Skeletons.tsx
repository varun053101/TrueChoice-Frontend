import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ─── Primitives ───────────────────────────────────────────────

/** Single election card in a list */
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
                    <Skeleton className="h-10 w-28 rounded-lg ml-4" />
                </div>
            </CardContent>
        </Card>
    );
}

/** Stats card used on dashboards */
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

/** Table / user list row */
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

// ─── Page-level skeletons ─────────────────────────────────────

/** Voter / Admin dashboard */
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <ElectionCardSkeleton />
                <ElectionCardSkeleton />
            </div>
        </div>
    );
}

/** Elections list page */
export function ElectionsListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Filter bar skeleton */}
            <div className="flex items-center gap-2 mb-6">
                <Skeleton className="w-4 h-4 rounded" />
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-md" />
                ))}
            </div>
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
        </div>
    );
}

/** Admin Elections list (with search bar) */
export function AdminElectionsListSkeleton() {
    return (
        <div className="space-y-4">
            {/* Search + filter skeleton */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Skeleton className="h-10 flex-1 max-w-md rounded-md" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-8 w-20 rounded-md" />
                    ))}
                </div>
            </div>
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
            <ElectionCardSkeleton />
        </div>
    );
}

/** Results list page (voter) */
export function ResultsListSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                                <Skeleton className="h-6 w-64" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-9 w-28 rounded-md" />
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

/** Election results detail page */
export function ResultsSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
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

/** Voting page — candidate grid */
export function VotingPageSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-3">
                <Skeleton className="h-4 w-36 mb-4" />
                <Skeleton className="h-9 w-96" />
                <Skeleton className="h-5 w-48" />
            </div>
            {/* Instruction banner */}
            <Skeleton className="h-14 w-full rounded-lg" />
            {/* Candidate cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardHeader className="text-center pb-2">
                            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-3" />
                            <Skeleton className="h-5 w-32 mx-auto" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-4/5 mx-auto" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            {/* Submit button */}
            <div className="flex justify-center">
                <Skeleton className="h-12 w-48 rounded-lg" />
            </div>
        </div>
    );
}

/** Manage election (admin) — header + tabs */
export function ManageElectionSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Back + header */}
            <div className="space-y-4">
                <Skeleton className="h-9 w-36 rounded-lg" />
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-80" />
                        <Skeleton className="h-5 w-48" />
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
            {/* Tabs */}
            <Skeleton className="h-10 w-full rounded-lg" />
            {/* Candidate cards */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-64" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-24 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-8 w-24" />
            <Card className="border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                    ))}
                    <div className="pt-4 border-t border-border">
                        <Skeleton className="h-9 w-36 rounded-md" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/** Superadmin dashboard */
export function SuperadminDashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80" />
            </div>
            {/* Current admin card */}
            <Card className="border-2 border-primary/20">
                <CardHeader>
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-80 mt-1" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                        <Skeleton className="w-14 h-14 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-36" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* User management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-10 w-64 rounded-md" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[1, 2, 3, 4].map((i) => <TableRowSkeleton key={i} />)}
                </CardContent>
            </Card>
        </div>
    );
}
