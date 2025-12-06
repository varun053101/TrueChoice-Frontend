import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { electionsAPI } from '@/services/api';
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
import type { Election, Candidate } from '@/types';

export default function VotingPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [alreadyVoted, setAlreadyVoted] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const loadBallot = async () => {
      if (!electionId) return;
      setLoading(true);
      try {
        const res = await electionsAPI.getBallot(electionId);
        const ballotElection = res.election || res?.data?.election;
        const ballotCandidates = res.candidates || res?.data?.candidates || [];
        const eligible = res.isEligible ?? true; // default true if backend not sending
        const voted = res.hasVoted ?? false;

        if (mounted) {
          setElection({
            ...(ballotElection || {}),
            id: ballotElection?._id || ballotElection?.id || electionId,
          } as Election);
          let normalizedCandidates = (ballotCandidates || []).map((c: any) => ({
            ...c,
            id: c._id || c.id,
          }));

          // If ballot response didn't include candidates, attempt fallback fetch
          if (normalizedCandidates.length === 0) {
            try {
              const candRes = await electionsAPI.getCandidates(electionId);
              const candData = candRes.candidates || candRes || [];
              normalizedCandidates = candData.map((c: any) => ({
                ...c,
                id: c._id || c.id,
              }));
            } catch (err) {
              console.error('Fallback candidates fetch failed:', err);
            }
          }

          setCandidates(normalizedCandidates);
          setIsEligible(eligible);
          setAlreadyVoted(voted);
          setHasVoted(voted);
        }
      } catch (err: any) {
        console.error('Load ballot error:', err);
        toast({
          title: 'Failed to load ballot',
          description: err?.response?.data?.error || err?.message || 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBallot();
    return () => { mounted = false; };
  }, [electionId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading ballot...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!election) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Election Not Found</h1>
          <p className="text-muted-foreground mb-4">The election you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!isEligible) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-status-scheduled mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Not Eligible</h1>
          <p className="text-muted-foreground mb-4">You are not eligible to vote in this election.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (alreadyVoted || hasVoted) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-status-ongoing/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-status-ongoing" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">Vote Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for participating in the election. Your vote has been recorded.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
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
          <p className="text-muted-foreground mb-4">
            This election is not currently accepting votes.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast({
        title: 'No candidate selected',
        description: 'Please select a candidate before submitting your vote.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await electionsAPI.castVote(electionId!, selectedCandidate);
      toast({
        title: 'Vote submitted successfully!',
        description: 'Thank you for participating in the election.',
      });
      setHasVoted(true);
    } catch (err: any) {
      console.error('Cast vote error:', err);
      toast({
        title: 'Failed to submit vote',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold mb-2">{election.title}</h1>
            <p className="text-lg text-muted-foreground">
              Position: <span className="font-medium text-foreground">{election.positionName}</span>
            </p>
            {election.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl">{election.description}</p>
            )}
          </div>
          {election.endTime && (
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ends: {new Date(election.endTime).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Vote className="w-5 h-5 text-primary" />
            <p className="text-sm">
              Select your preferred candidate below and click "Submit Vote" to cast your vote. 
              <span className="font-medium"> You can only vote once.</span>
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
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.displayName}
                          className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-md"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-md">
                          <User className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      {selectedCandidate === candidate.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                        >
                          <CheckCircle className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{candidate.displayName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center line-clamp-4">
                      {candidate.manifesto}
                    </CardDescription>
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
          disabled={!selectedCandidate || isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Vote className="w-5 h-5" />
              Submit Vote
            </>
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
}
