import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { electionsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Clock, CheckCircle, Calendar, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import type { Election } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function VoterDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        // Normalize IDs (_id to id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalizedElections = electionsData.map((e: any) => ({
          ...e,
          id: e._id || e.id,
          hasVoted: e.hasVoted || false,
        }));

        if (mounted) setElections(normalizedElections);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const ongoingElections = elections.filter(e => e.status === 'ongoing');
  const upcomingElections = elections.filter(e => e.status === 'scheduled');
  const completedElections = elections.filter(e => e.status === 'closed' && e.publicResults);

  // Check if user has voted (from backend response)
  const hasVoted = (election: Election) => election.hasVoted || false;

  const stats = [
    {
      label: 'Ongoing Elections',
      value: ongoingElections.length,
      icon: Vote,
      color: 'text-status-ongoing',
      bgColor: 'bg-status-ongoing/10'
    },
    {
      label: 'Upcoming',
      value: upcomingElections.length,
      icon: Calendar,
      color: 'text-status-scheduled',
      bgColor: 'bg-status-scheduled/10'
    },
    {
      label: 'Results Available',
      value: completedElections.length,
      icon: CheckCircle,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Your SRN: <span className="font-mono font-medium text-foreground">{user?.srn}</span>
          </p>
        </div>
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">
          Your SRN: <span className="font-mono font-medium text-foreground">{user?.srn}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-heading font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Ongoing Elections */}
      {ongoingElections.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold">Cast Your Vote</h2>
            <Link to="/elections">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {ongoingElections.map((election, index) => {
              const voted = hasVoted(election);
              const candidateCount = election.candidateCount || 0;

              return (
                <motion.div
                  key={election.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 ${voted ? 'border-status-ongoing/30 bg-status-ongoing/5' : 'border-primary/30 bg-primary/5'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status={election.status} />
                            {voted && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-status-ongoing">
                                <CheckCircle className="w-3.5 h-3.5" />
                                You have voted
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Position: {election.positionName}
                            {candidateCount > 0 && ` • ${candidateCount} Candidate${candidateCount !== 1 ? 's' : ''}`}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            Ends: {formatDate(election.endTime)}
                          </div>
                        </div>
                        <Link to={voted ? `/results/${election.id}` : `/vote/${election.id}`}>
                          <Button variant={voted ? 'secondary' : 'hero'}>
                            {voted ? 'View Status' : 'Vote Now'}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Upcoming Elections */}
      {upcomingElections.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-heading font-semibold mb-4">Upcoming Elections</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingElections.map((election, index) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={election.status} />
                    </div>
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    <CardDescription>{election.positionName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Starts: {formatDate(election.startTime)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Results Available */}
      {completedElections.length > 0 && (
        <section>
          <h2 className="text-xl font-heading font-semibold mb-4">Results Available</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {completedElections.map((election, index) => (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={election.status} />
                      <Link to={`/results/${election.id}`}>
                        <Button variant="ghost" size="sm">
                          View Results <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                    <CardTitle className="text-lg">{election.title}</CardTitle>
                    <CardDescription>{election.positionName}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* No Elections */}
      {elections.length === 0 && (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Elections Available</h3>
            <p className="text-muted-foreground">
              You are not currently eligible for any elections. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
