import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { electionsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Trophy,
  User,
  AlertTriangle,
  Calendar,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultCandidate {
  id: string;
  displayName: string;
  manifesto?: string;
  photoUrl?: string;
  voteCount: number;
  percentage: number;
}

interface ElectionInfo {
  id: string;
  title: string;
  positionName: string;
  endTime?: string;
}

export default function ResultsPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [election, setElection] = useState<ElectionInfo | null>(null);
  const [candidates, setCandidates] = useState<ResultCandidate[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!electionId) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Election Details (Title, Position, etc.)
      // We try to find it in the all/active list first to avoid 'Ballot Closed' errors from getBallot
      let electionInfo: ElectionInfo | null = null;
      try {
        const allElections = await electionsAPI.getAll();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const match = (Array.isArray(allElections) ? allElections : (allElections as any).elections || []).find((e: any) => (e._id || e.id) === electionId);
        if (match) {
          electionInfo = {
            id: match._id || match.id,
            title: match.title,
            positionName: match.positionName,
            endTime: match.endTime
          };
        }
      } catch (err) {
        console.warn('Failed to fetch election via getAll:', err);
      }

      // 2. Fetch All Candidates (to ensure we have those with 0 votes)
      let allCandidates: any[] = [];
      try {
        const candidatesRes = await electionsAPI.getCandidates(electionId);
        allCandidates = Array.isArray(candidatesRes) ? candidatesRes : candidatesRes.candidates || [];
      } catch (err) {
        console.warn('Failed to fetch candidates:', err);
      }

      // 3. Fetch Votes/Results
      let voteData: any[] = [];
      let total = 0;

      try {
        const resultsRes = await electionsAPI.getResults(electionId);
        console.log('ResultsPage - Raw Results:', resultsRes);

        // If results endpoint provides election info and we missed it earlier, grab it
        if (!electionInfo && (resultsRes.election || resultsRes.title)) {
          const eData = resultsRes.election || resultsRes;
          electionInfo = {
            id: eData._id || eData.id || electionId,
            title: eData.title || 'Election Results',
            positionName: eData.positionName || '',
            endTime: eData.endTime
          };
        }

        // Handle different structures for results
        const resultsList = resultsRes.results || resultsRes.candidates || resultsRes || [];
        voteData = Array.isArray(resultsList) ? resultsList : [];
        total = resultsRes.totalVotes || voteData.reduce((sum: number, item: any) => sum + (item.votes || item.voteCount || 0), 0);
      } catch (err) {
        console.warn('Failed to fetch results (might be empty):', err);
      }

      // If we still don't have election info, generic fallback
      if (!electionInfo) {
        electionInfo = {
          id: electionId,
          title: 'Election Results',
          positionName: 'View details below',
          endTime: new Date().toISOString()
        };
      }
      setElection(electionInfo);
      setTotalVotes(total);

      // 4. Merge Candidates with Votes
      // If we couldn't get the candidate list, fallback to using just the result list
      const baseList = allCandidates.length > 0 ? allCandidates : voteData;

      const mergedCandidates: ResultCandidate[] = baseList.map((cand: any) => {
        const candId = cand._id || cand.id || cand.candidateId;
        // Find matching vote entry
        const voteEntry = voteData.find((v: any) => (v.candidateId || v._id || v.id) === candId);

        const voteCount = voteEntry ? (voteEntry.votes || voteEntry.voteCount || 0) : 0;

        return {
          id: candId,
          displayName: cand.displayName || cand.name || 'Unknown Candidate',
          manifesto: cand.manifesto || '',
          photoUrl: cand.photoUrl,
          voteCount: voteCount,
          percentage: 0 // calculated below
        };
      });

      // Calculate percentages based on TOTAL votes (not just the sum of displayed ones, though they should match)
      // Sorting: Highest votes first
      mergedCandidates.sort((a, b) => b.voteCount - a.voteCount);

      if (total > 0) {
        mergedCandidates.forEach(c => {
          c.percentage = Math.round((c.voteCount / total) * 100);
        });
      }

      setCandidates(mergedCandidates);

    } catch (err: any) {
      console.error('Load results error:', err);
      const errorMsg = err?.response?.data?.error || err?.message || 'Failed to load results';
      setError(errorMsg);
      toast({
        title: 'Failed to load results',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [electionId, toast]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !election) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Results Not Available</h1>
          <p className="text-muted-foreground mb-4">
            {error || 'Results for this election are not available.'}
          </p>
          <Button onClick={() => navigate('/elections')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const winner = candidates[0];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/elections')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Elections
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">{election.title}</h1>
            <p className="text-lg text-muted-foreground">
              Position: <span className="font-medium text-foreground">{election.positionName}</span>
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {election.endTime && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ended: {new Date(election.endTime).toLocaleString()}
              </div>
            )}
            <p className="mt-1 font-medium text-foreground">{totalVotes} total votes</p>
          </div>
        </div>
      </div>

      {candidates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No votes have been cast in this election.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Winner Card */}
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="border-2 border-status-scheduled bg-gradient-to-br from-status-scheduled/10 to-status-scheduled/5 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {winner.photoUrl ? (
                        <img
                          src={winner.photoUrl}
                          alt={winner.displayName}
                          className="w-28 h-28 rounded-full object-cover border-4 border-status-scheduled shadow-lg"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-4 border-status-scheduled shadow-lg">
                          <User className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-status-scheduled flex items-center justify-center shadow-md">
                        <Trophy className="w-5 h-5 text-status-scheduled-foreground" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-status-scheduled font-semibold text-sm mb-1 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        WINNER
                      </p>
                      <h2 className="text-2xl font-heading font-bold mb-1">{winner.displayName}</h2>
                      {winner.manifesto && (
                        <p className="text-muted-foreground mb-3">{winner.manifesto}</p>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-bold">{winner.voteCount}</span>
                        <span className="text-muted-foreground">votes</span>
                        <span className="text-2xl font-bold text-status-ongoing">{winner.percentage}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* All Results */}
          <h2 className="text-xl font-heading font-semibold mb-4">All Candidates</h2>
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  'transition-all',
                  index === 0 && 'border-status-scheduled/50'
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm">
                        {index + 1}
                      </div>
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.displayName}
                          className="w-14 h-14 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{candidate.displayName}</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold">{candidate.voteCount} votes</span>
                            <span className="text-muted-foreground">({candidate.percentage}%)</span>
                          </div>
                        </div>
                        <Progress
                          value={candidate.percentage}
                          className={cn(
                            'h-3',
                            index === 0 && '[&>div]:bg-status-scheduled'
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
