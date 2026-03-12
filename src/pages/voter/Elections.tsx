import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, Clock, CheckCircle, Calendar, ArrowRight, AlertCircle, Users, Filter } from 'lucide-react';
import type { Election } from '@/types';
import { useVoterElections } from '@/hooks/useQueries';
import { ElectionsListSkeleton } from '@/components/common/Skeletons';

type StatusFilter = 'all' | 'ongoing' | 'scheduled';

export default function Elections() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data: elections = [], isLoading } = useVoterElections();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasVoted = (election: any) => election.hasVoted || false;

  const filteredElections = elections.filter((election: Election) => {
    if (statusFilter === 'all') return true;
    return election.status === statusFilter;
  });

  const sortedElections = [...filteredElections].sort((a: Election, b: Election) => {
    const statusOrder: Record<string, number> = { ongoing: 0, scheduled: 1, closed: 2, draft: 3 };
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  const counts = {
    all: elections.length,
    ongoing: elections.filter((e: Election) => e.status === 'ongoing').length,
    scheduled: elections.filter((e: Election) => e.status === 'scheduled').length,
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'scheduled', label: 'Upcoming' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Elections</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Elections you are eligible to participate in</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={statusFilter === btn.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(btn.value)}
            className="min-w-[80px]"
          >
            {btn.label}
            {counts[btn.value] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({counts[btn.value]})</span>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <ElectionsListSkeleton />
      ) : sortedElections.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Elections Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all' ? 'There are no elections available at the moment.' : `There are no ${statusFilter} elections.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedElections.map((election: Election, index: number) => {
            const voted = hasVoted(election);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const candidateCount = (election as any).candidateCount || 0;
            const canVote = election.status === 'ongoing' && !voted;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isPublished = (election as any).publishResults === true || (election as any).publicResults === true;
            const canViewResults = election.status === 'closed' && isPublished;

            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-border/50 hover:shadow-md transition-shadow ${canVote ? 'border-primary/30' : ''}`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={election.status} />
                          {voted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-status-ongoing">
                              <CheckCircle className="w-3.5 h-3.5" /> Voted
                            </span>
                          )}
                          {election.status === 'closed' && (
                            <span className={`text-xs font-medium ${isPublished ? 'text-status-ongoing' : 'text-muted-foreground'}`}>
                              {isPublished ? '✓ Results Published' : '🔒 Results Pending'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">Position: {election.positionName}</p>
                        {election.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{election.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {candidateCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" /> {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {election.status === 'ongoing' && election.endTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> Ends: {new Date(election.endTime).toLocaleString()}
                            </span>
                          )}
                          {election.status === 'scheduled' && election.startTime && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Starts: {new Date(election.startTime).toLocaleString()}
                            </span>
                          )}
                          {election.status === 'closed' && election.endTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" /> Ended: {new Date(election.endTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="sm:shrink-0">
                        {canVote ? (
                          <Link to={`/vote/${election.id}`}>
                            <Button variant="hero" className="w-full sm:w-auto">Vote Now <ArrowRight className="w-4 h-4" /></Button>
                          </Link>
                        ) : canViewResults ? (
                          <Link to={`/results/${election.id}`}>
                            <Button variant="outline" className="w-full sm:w-auto">View Results <ArrowRight className="w-4 h-4" /></Button>
                          </Link>
                        ) : voted ? (
                          <Button variant="secondary" disabled className="w-full sm:w-auto">
                            <CheckCircle className="w-4 h-4 mr-2" /> Vote Cast
                          </Button>
                        ) : election.status === 'scheduled' ? (
                          <Button variant="outline" disabled className="w-full sm:w-auto">
                            <Calendar className="w-4 h-4 mr-2" /> Upcoming
                          </Button>
                        ) : election.status === 'closed' && !isPublished ? (
                          <Button variant="outline" disabled className="w-full sm:w-auto">Results Pending</Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
