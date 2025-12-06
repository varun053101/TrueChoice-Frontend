import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { electionsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, Clock, CheckCircle, Calendar, ArrowRight, AlertCircle, Users, Loader2, Filter } from 'lucide-react';
import type { Election } from '@/types';
import { useToast } from '@/hooks/use-toast';

type StatusFilter = 'all' | 'ongoing' | 'scheduled' | 'closed';

export default function Elections() {
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    let mounted = true;
    const loadElections = async () => {
      setLoading(true);
      try {
        // Try to get all public elections (shows all regardless of eligibility)
        // Fallback to getActive if the endpoint doesn't exist yet
        let res;
        try {
          res = await electionsAPI.getAll();
        } catch {
          // Fallback to active elections if /all endpoint not available
          res = await electionsAPI.getActive();
        }

        // Backend returns elections - handle various response formats
        let electionsData: any[] = [];
        if (Array.isArray(res)) {
          electionsData = res;
        } else if (Array.isArray(res?.elections)) {
          electionsData = res.elections;
        } else if (Array.isArray(res?.data?.elections)) {
          electionsData = res.data.elections;
        } else if (Array.isArray(res?.data)) {
          electionsData = res.data;
        }

        // Normalize IDs and data (_id to id)
        const normalizedElections = electionsData.map((e: any) => ({
          ...e,
          id: e._id || e.id,
          hasVoted: e.hasVoted || false,
          publicResults: e.publicResults || false,
        }));

        if (mounted) setElections(normalizedElections);
      } catch (err: any) {
        console.error('Failed to load elections:', err);
        toast({
          title: 'Failed to load elections',
          description: err?.response?.data?.error || err?.message || 'An error occurred',
          variant: 'destructive',
        });
        if (mounted) setElections([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadElections();
    return () => { mounted = false; };
  }, [toast]);

  // Check if user has voted (from backend response)
  const hasVoted = (election: any) => election.hasVoted || false;

  // Filter elections by status
  const filteredElections = elections.filter(election => {
    if (statusFilter === 'all') return true;
    return election.status === statusFilter;
  });

  // Sort: ongoing first, then scheduled, then closed
  const sortedElections = [...filteredElections].sort((a, b) => {
    const statusOrder: Record<string, number> = { ongoing: 0, scheduled: 1, closed: 2, draft: 3 };
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
  });

  // Count for each status
  const counts = {
    all: elections.length,
    ongoing: elections.filter(e => e.status === 'ongoing').length,
    scheduled: elections.filter(e => e.status === 'scheduled').length,
    closed: elections.filter(e => e.status === 'closed').length,
  };

  const filterButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'scheduled', label: 'Upcoming' },
    { value: 'closed', label: 'Closed' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Elections</h1>
          <p className="text-muted-foreground">
            Browse all elections and cast your vote
          </p>
        </div>
        {/* Filter skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
        {/* Election cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="flex items-center gap-4 pt-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Elections</h1>
        <p className="text-muted-foreground">
          Browse all elections and cast your vote
        </p>
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

      {sortedElections.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Elections Found</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'There are no elections available at the moment.'
                : `There are no ${statusFilter} elections.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedElections.map((election, index) => {
            const voted = hasVoted(election);
            const candidateCount = (election as any).candidateCount || 0;
            const canVote = election.status === 'ongoing' && !voted;
            const isPublished = (election as any).publicResults === true;
            const canViewResults = election.status === 'closed' && isPublished;

            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`border-border/50 hover:shadow-md transition-shadow ${canVote ? 'border-primary/30' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={election.status} />
                          {voted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-status-ongoing">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Voted
                            </span>
                          )}
                          {election.status === 'closed' && (
                            <span className={`text-xs font-medium ${isPublished ? 'text-status-ongoing' : 'text-muted-foreground'}`}>
                              {isPublished ? '✓ Results Published' : '🔒 Results Pending'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Position: {election.positionName}
                        </p>
                        {election.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {election.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {candidateCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {candidateCount} candidate{candidateCount !== 1 ? 's' : ''}
                            </span>
                          )}
                          {election.status === 'ongoing' && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Ends: {new Date(election.endTime).toLocaleString()}
                            </span>
                          )}
                          {election.status === 'scheduled' && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Starts: {new Date(election.startTime).toLocaleString()}
                            </span>
                          )}
                          {election.status === 'closed' && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Ended: {new Date(election.endTime).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {canVote ? (
                          <Link to={`/vote/${election.id}`}>
                            <Button variant="hero">
                              Vote Now
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : canViewResults ? (
                          <Link to={`/results/${election.id}`}>
                            <Button variant="outline">
                              View Results
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        ) : voted ? (
                          <Button variant="secondary" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Vote Cast
                          </Button>
                        ) : election.status === 'scheduled' ? (
                          <Button variant="outline" disabled>
                            <Calendar className="w-4 h-4 mr-2" />
                            Upcoming
                          </Button>
                        ) : election.status === 'closed' && !isPublished ? (
                          <Button variant="outline" disabled>
                            Results Pending
                          </Button>
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
