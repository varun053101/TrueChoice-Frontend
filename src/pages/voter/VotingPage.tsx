import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  AlertTriangle,
  Vote,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/types';
import { useVoterBallot, useCastVote } from '@/hooks/useQueries';
import { VotingPageSkeleton } from '@/components/common/Skeletons';

export default function VotingPage() {
  const { electionId: rawElectionId, '*': splatRest } = useParams();
  // Reconstruct slash-containing election IDs from wildcard route splat
  const electionId = rawElectionId
    ? splatRest
      ? `${decodeURIComponent(rawElectionId)}/${splatRest}`
      : decodeURIComponent(rawElectionId)
    : undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [hasVotedLocally, setHasVotedLocally] = useState(false);

  const { data: ballotData, isLoading, isError } = useVoterBallot(electionId);
  const castVoteMutation = useCastVote(electionId);

  // Derive data from ballot response
  const election = ballotData
    ? { ...(ballotData.election || {}), id: ballotData.election?._id || ballotData.election?.id || electionId }
    : null;

  const candidates: Candidate[] = useMemo(
    () =>
      (ballotData?.candidates || []).map((c: any) => ({
        ...c,
        id: String(c._id || c.id || c.candidateId || ''),
      })),
    [ballotData?.candidates]
  );

  const alreadyVoted = ballotData?.hasVoted || hasVotedLocally || false;

  if (isLoading) {
    return (
      <DashboardLayout>
        <VotingPageSkeleton />
      </DashboardLayout>
    );
  }

  if (isError || !election) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Election Not Found</h1>
          <p className="text-muted-foreground mb-4">The election you're looking for doesn't exist or isn't open yet.</p>
          <Button onClick={() => navigate('/dashboard')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }



  if (election.status !== 'ongoing') {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Election Not Active</h1>
          <p className="text-muted-foreground mb-4">This election is not currently accepting votes.</p>
          <Button onClick={() => navigate('/dashboard')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast({ title: 'No candidate selected', description: 'Please select a candidate before submitting your vote.', variant: 'destructive' });
      return;
    }

    if (!electionId) {
      toast({ title: 'Election error', description: 'Could not determine election ID. Please refresh the page.', variant: 'destructive' });
      return;
    }

    try {
      console.log('[Vote] Submitting vote:', { electionId, candidateId: selectedCandidate });
      await castVoteMutation.mutateAsync({ candidateId: selectedCandidate });
      toast({ title: 'Vote submitted successfully!', description: 'Thank you for participating in the election.' });
      setHasVotedLocally(true);
    } catch (err: any) {
      toast({
        title: 'Failed to submit vote',
        description: err?.response?.data?.message || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">{election.title}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Position: <span className="font-medium text-foreground">{election.positionName}</span>
            </p>
            {election.description && <p className="text-muted-foreground mt-2 max-w-2xl">{election.description}</p>}
          </div>
          {election.endTime && (
            <div className="text-sm text-muted-foreground sm:text-right">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Ends: {new Date(election.endTime).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {alreadyVoted && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Card className="border-status-ongoing/50 bg-status-ongoing/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-6 h-6 rounded-full bg-status-ongoing flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </motion.div>
                <p className="text-sm font-medium">Your vote has been submitted successfully! Thank you for participating.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Vote className="w-5 h-5 text-primary" />
            <p className="text-sm">
              Select your preferred candidate and click "Submit Vote". <span className="font-medium">You can only vote once.</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence>
          {candidates.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No candidates available for this election.
            </div>
          ) : (
            candidates.map((candidate, index) => (
              <motion.div key={candidate.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-lg',
                    selectedCandidate === candidate.id
                      ? 'border-2 border-primary ring-2 ring-primary/20 shadow-lg'
                      : 'border-border/50 hover:border-primary/30'
                  )}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="relative mx-auto mb-3">
                      {candidate.photoUrl ? (
                        <img src={candidate.photoUrl} alt={candidate.displayName} className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                          <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      {selectedCandidate === candidate.id && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{candidate.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center line-clamp-4">{candidate.manifesto}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          variant="hero"
          size="xl"
          onClick={handleVote}
          disabled={castVoteMutation.isPending || alreadyVoted}
          className="min-w-[200px]"
        >
          {alreadyVoted ? (
            <><CheckCircle className="w-5 h-5" /> Vote Submitted</>
          ) : castVoteMutation.isPending ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
          ) : (
            <><Vote className="w-5 h-5" /> Submit Vote</>
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
}
