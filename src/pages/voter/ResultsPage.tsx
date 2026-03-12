import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoterResults, useVoterElections, useVoterCandidates } from '@/hooks/useQueries';
import { ResultsSkeleton } from '@/components/common/Skeletons';

interface ResultCandidate {
  id: string;
  displayName: string;
  manifesto?: string;
  photoUrl?: string;
  voteCount: number;
  percentage: number;
}

export default function ResultsPage() {
  const { electionId: rawElectionId, '*': splatRest } = useParams();
  // Reconstruct slash-containing election IDs from wildcard route splat
  const electionId = rawElectionId
    ? splatRest
      ? `${decodeURIComponent(rawElectionId)}/${splatRest}`
      : decodeURIComponent(rawElectionId)
    : undefined;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use cached elections list to get election metadata
  const { data: allElections = [] } = useVoterElections();
  const electionMeta = allElections.find(
    (e: any) => e.id === electionId || e._id === electionId
  ) ?? null;

  // Fetch results (cached per election)
  const { data: resultsData, isLoading: loadingResults, isError: resultsError } = useVoterResults(electionId);

  // Fetch candidates for fallback/merging
  const { data: candidatesData = [], isLoading: loadingCandidates } = useVoterCandidates(electionId);

  const isLoading = loadingResults || loadingCandidates;

  // ─── Merge candidates with vote data ───────────────────────
  let mergedCandidates: ResultCandidate[] = [];
  let totalVotes = 0;
  let election = electionMeta;
  let hasExplicitWinners = false;

  if (!isLoading && resultsData) {
    // Possibly get election from results response
    if (!election && (resultsData.election || resultsData.title)) {
      const eData = resultsData.election || resultsData;
      election = {
        id: eData._id || eData.id || electionId,
        title: eData.title || 'Election Results',
        positionName: eData.positionName || '',
        endTime: eData.endTime,
      } as any;
    }

    const resultsList: any[] = resultsData.results || resultsData.candidates || [];
    totalVotes =
      resultsData.totalVotes ??
      resultsList.reduce((sum: number, r: any) => sum + (r.votes || r.voteCount || 0), 0);

    const baseList = candidatesData.length > 0 ? candidatesData : resultsList;
    hasExplicitWinners = Array.isArray((resultsData as any).winners) && (resultsData as any).winners.length > 0;

    mergedCandidates = baseList.map((cand: any) => {
      const candId = String(cand._id || cand.id || cand.candidateId || '');
      const voteEntry = resultsList.find(
        (v: any) => String(v.candidateId || v._id || v.id) === candId
      );
      const voteCount = voteEntry ? (voteEntry.votes || voteEntry.voteCount || 0) : 0;
      const percentage =
        typeof voteEntry?.percentage === 'number'
          ? voteEntry.percentage
          : totalVotes > 0
            ? Number(((voteCount / totalVotes) * 100).toFixed(2))
            : 0;

      return {
        id: candId,
        displayName: cand.displayName || cand.name || 'Unknown Candidate',
        manifesto: cand.manifesto || '',
        photoUrl: cand.photoUrl,
        voteCount,
        percentage,
      };
    });

    mergedCandidates.sort((a, b) => b.voteCount - a.voteCount);
  }

  if (isLoading) {
    return <DashboardLayout><ResultsSkeleton /></DashboardLayout>;
  }

  if (resultsError || (!election && !electionMeta)) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Results Not Available</h1>
          <p className="text-muted-foreground mb-4">Results for this election are not available yet.</p>
          <Button onClick={() => navigate('/elections')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Elections</Button>
        </div>
      </DashboardLayout>
    );
  }

  // Prefer backend-declared winners (handles ties) when available.
  let winner: ResultCandidate | undefined = mergedCandidates[0];
  let isTie = false;

  if (hasExplicitWinners && resultsData && mergedCandidates.length > 0) {
    const winnersFromApi: any[] = (resultsData as any).winners || [];
    const winnerIds = new Set(
      winnersFromApi.map((w: any) => String(w.candidateId || w.id || ''))
    );
    const winnerCandidates = mergedCandidates.filter((c) => winnerIds.has(c.id));
    if (winnerCandidates.length > 0) {
      winner = winnerCandidates[0];
      isTie = winnerCandidates.length > 1;
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/elections')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Elections
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">{(election as any)?.title}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Position: <span className="font-medium text-foreground">{(election as any)?.positionName}</span>
            </p>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            {(election as any)?.endTime && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Ended: {new Date((election as any).endTime).toLocaleString()}
              </div>
            )}
            <p className="mt-1 font-medium text-foreground">{totalVotes} total votes</p>
          </div>
        </div>
      </div>

      {mergedCandidates.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No votes have been cast in this election.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Winner Card */}
          {winner && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8">
              <Card className="border-2 border-status-scheduled bg-gradient-to-br from-status-scheduled/10 to-status-scheduled/5 overflow-hidden">
                <CardContent className="p-5 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                    <div className="relative">
                      {winner.photoUrl ? (
                        <img src={winner.photoUrl} alt={winner.displayName} className="w-28 h-28 rounded-full object-cover border-4 border-status-scheduled shadow-lg" />
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
                        {isTie ? 'WINNERS (Tie)' : 'WINNER'}
                      </p>
                      <h2 className="text-2xl font-heading font-bold mb-1">{winner.displayName}</h2>
                      {winner.manifesto && <p className="text-muted-foreground mb-3">{winner.manifesto}</p>}
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
            {mergedCandidates.map((candidate, index) => (
              <motion.div key={candidate.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={cn('transition-all', index === 0 && 'border-status-scheduled/50')}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted font-bold text-sm shrink-0">{index + 1}</div>
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.displayName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-border shrink-0" />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                          <h3 className="font-semibold">{candidate.displayName}</h3>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-base sm:text-lg font-bold">{candidate.voteCount} votes</span>
                            <span className="text-muted-foreground text-sm">({candidate.percentage}%)</span>
                          </div>
                        </div>
                        <Progress value={candidate.percentage} className={cn('h-3', index === 0 && '[&>div]:bg-status-scheduled')} />
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
