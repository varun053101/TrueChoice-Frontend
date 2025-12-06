import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { adminAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Election, Candidate } from '@/types';
import {
  ArrowLeft,
  Play,
  Square,
  Eye,
  Users,
  UserPlus,
  Upload,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  Loader2,
  FileDown,
  Crown,
  Trophy // Added Trophy
} from 'lucide-react';
import { exportElectionResultsToPDF } from '@/utils/pdfExport';
import { formatDate, formatForInput, dateInputToUTC } from '@/utils/dateUtils';

export default function ManageElection() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [eligibleCount, setEligibleCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [newCandidate, setNewCandidate] = useState({ name: '', manifesto: '' });
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const [showForceStartDialog, setShowForceStartDialog] = useState(false);
  const [showForceCloseDialog, setShowForceCloseDialog] = useState(false);
  const [isForcingAction, setIsForcingAction] = useState(false);
  const [isUploadingVoters, setIsUploadingVoters] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    positionName: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    if (!electionId) return;

    const loadElection = async () => {
      setLoading(true);
      try {
        // Backend returns: { election, stats: { totalCandidates, totalVotes }, candidates }
        const electionRes = await adminAPI.getElection(electionId);

        // Parse election data - backend returns full election object
        const electionData = electionRes.election;
        if (electionData) {
          // Convert _id to id if needed, handle date formatting
          const formattedElection = {
            ...electionData,
            id: electionData._id || electionData.id,
            startTime: electionData.startTime,
            endTime: electionData.endTime,
          };
          setElection(formattedElection as Election);

          // Set settings form values
          setSettingsForm({
            title: electionData.title || '',
            positionName: electionData.positionName || '',
            description: electionData.description || '',
            startTime: formatForInput(electionData.startTime),
            endTime: formatForInput(electionData.endTime),
          });
        }

        // Candidates are included in the response - normalize IDs
        let candidatesData = (electionRes.candidates || []).map((c: any) => ({
          ...c,
          id: c._id || c.id,
          votes: 0 // Initialize to 0, will be updated if results are available
        }));

        // If election is closed, fetch separate results to get vote counts
        if (electionData.status === 'closed') {
          try {
            const resultsRes = await adminAPI.getElectionResults(electionId!);
            // resultsRes: { totalVotes, results: [{ candidateId, votes, percentage, ... }] }
            if (resultsRes && resultsRes.results) {
              // Merge vote counts into candidatesData
              candidatesData = candidatesData.map((cand: any) => {
                const match = resultsRes.results.find((r: any) => r.candidateId === cand.id);
                return match ? { ...cand, votes: match.votes } : { ...cand, votes: 0 };
              });

              // Sort by votes descending for closed elections
              candidatesData.sort((a: any, b: any) => b.votes - a.votes);
            }
          } catch (resErr) {
            console.error('Failed to load election results:', resErr);
          }
        }

        setCandidates(candidatesData);

        // Set eligible voter count from stats (backend now includes this)
        const voterCount = electionRes.stats?.eligibleCount || electionRes.eligibleCount || 0;
        setEligibleCount(voterCount);
      } catch (err: any) {
        console.error('Failed to load election:', err);
        toast({
          title: 'Failed to load election',
          description: err?.response?.data?.error || err?.message || 'An error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadElection();
  }, [electionId, toast]);


  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading election...</p>
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
          <Button onClick={() => navigate('/admin/elections')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleForceStart = async () => {
    if (!electionId) return;

    setIsForcingAction(true);
    try {
      const res = await adminAPI.forceStartElection(electionId);
      toast({
        title: 'Election Started',
        description: res?.message || 'The election is now accepting votes.',
      });

      // Reload election data
      const updatedElection = await adminAPI.getElection(electionId);
      const electionData = updatedElection.election;
      if (electionData) {
        setElection({
          ...electionData,
          id: electionData._id || electionData.id,
        } as Election);
      }

      setShowForceStartDialog(false);
    } catch (err: any) {
      console.error('Force start error:', err);
      toast({
        title: 'Failed to start election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsForcingAction(false);
    }
  };

  const handleForceClose = async () => {
    if (!electionId) return;

    setIsForcingAction(true);
    try {
      const res = await adminAPI.forceCloseElection(electionId);
      toast({
        title: 'Election Closed',
        description: res?.message || 'The election has been closed.',
      });

      // Reload election data
      const updatedElection = await adminAPI.getElection(electionId);
      const electionData = updatedElection.election;
      if (electionData) {
        setElection({
          ...electionData,
          id: electionData._id || electionData.id,
        } as Election);
      }

      setShowForceCloseDialog(false);
    } catch (err: any) {
      console.error('Force close error:', err);
      toast({
        title: 'Failed to close election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsForcingAction(false);
    }
  };

  const handlePublishResults = async () => {
    if (!electionId) return;

    try {
      const res = await adminAPI.publishResults(electionId);
      toast({
        title: 'Results Published',
        description: res?.message || 'Results are now visible to voters.',
      });

      // Reload election data
      const updatedElection = await adminAPI.getElection(electionId);
      const electionData = updatedElection.election;
      if (electionData) {
        setElection({
          ...electionData,
          id: electionData._id || electionData.id,
        } as Election);
      }
    } catch (err: any) {
      console.error('Publish results error:', err);
      toast({
        title: 'Failed to publish results',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!electionId) return;

    // Only allow editing when in draft status
    if (election?.status !== 'draft') {
      toast({
        title: 'Cannot edit',
        description: 'Election can only be edited while it is in draft state.',
        variant: 'destructive',
      });
      return;
    }

    // Validate dates
    if (settingsForm.startTime && settingsForm.endTime) {
      const start = new Date(settingsForm.startTime);
      const end = new Date(settingsForm.endTime);
      if (start >= end) {
        toast({
          title: 'Invalid date range',
          description: 'End time must be after start time.',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSavingSettings(true);
    try {
      const updateData: any = {};
      if (settingsForm.title) updateData.title = settingsForm.title;
      if (settingsForm.positionName) updateData.positionName = settingsForm.positionName;
      updateData.description = settingsForm.description || '';
      if (settingsForm.startTime) updateData.startTime = dateInputToUTC(settingsForm.startTime);
      if (settingsForm.endTime) updateData.endTime = dateInputToUTC(settingsForm.endTime);

      const res = await adminAPI.editElection(electionId, updateData);

      toast({
        title: 'Settings saved',
        description: res?.message || 'Election settings updated successfully.',
      });

      // Reload election data
      const updatedElection = await adminAPI.getElection(electionId);
      const electionData = updatedElection.election;
      if (electionData) {
        setElection({
          ...electionData,
          id: electionData._id || electionData.id,
        } as Election);
        setSettingsForm({
          title: electionData.title || '',
          positionName: electionData.positionName || '',
          description: electionData.description || '',
          startTime: formatForInput(electionData.startTime),
          endTime: formatForInput(electionData.endTime),
        });
      }
    } catch (err: any) {
      console.error('Save settings error:', err);
      toast({
        title: 'Failed to save settings',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleScheduleElection = async () => {
    if (!electionId) return;

    if (election?.status !== 'draft') {
      toast({
        title: 'Cannot schedule',
        description: 'Only draft elections can be scheduled.',
        variant: 'destructive',
      });
      return;
    }

    // Validate dates exist and are valid
    if (!settingsForm.startTime || !settingsForm.endTime) {
      toast({
        title: 'Missing dates',
        description: 'Please set start and end times before scheduling.',
        variant: 'destructive',
      });
      return;
    }

    const start = new Date(settingsForm.startTime);
    const end = new Date(settingsForm.endTime);

    if (start >= end) {
      toast({
        title: 'Invalid date range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      return;
    }

    if (start <= new Date()) {
      toast({
        title: 'Invalid start time',
        description: 'Start time must be in the future for scheduling.',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);
    try {
      const res = await adminAPI.scheduleElection(electionId, {
        startTime: dateInputToUTC(settingsForm.startTime),
        endTime: dateInputToUTC(settingsForm.endTime),
      });

      toast({
        title: 'Election scheduled',
        description: res?.message || 'Election has been scheduled successfully.',
      });

      // Reload election data
      const updatedElection = await adminAPI.getElection(electionId);
      const electionData = updatedElection.election;
      if (electionData) {
        setElection({
          ...electionData,
          id: electionData._id || electionData.id,
        } as Election);
      }
    } catch (err: any) {
      console.error('Schedule election error:', err);
      toast({
        title: 'Failed to schedule election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!electionId || !newCandidate.name || !newCandidate.manifesto) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all candidate details.',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingCandidate(true);
    try {
      await adminAPI.addCandidate({
        electionId,
        displayName: newCandidate.name,
        manifesto: newCandidate.manifesto,
      });

      toast({
        title: 'Candidate Added',
        description: `${newCandidate.name} has been added to the election.`,
      });

      // Reload candidates - backend returns: { election: {...}, totalCandidates, candidates }
      const candidatesRes = await adminAPI.getCandidates(electionId);
      const candidatesData = (candidatesRes.candidates || []).map((c: any) => ({
        ...c,
        id: c._id || c.id,
      }));
      setCandidates(candidatesData);

      setNewCandidate({ name: '', manifesto: '' });
    } catch (err: any) {
      console.error('Add candidate error:', err);
      toast({
        title: 'Failed to add candidate',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsAddingCandidate(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!electionId) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVoters(true);
    try {
      const res = await adminAPI.uploadVoters(electionId, file);
      const uploadedCount = res?.uniqueSrns || res?.validSrns || 0;
      setEligibleCount(uploadedCount);

      toast({
        title: 'Voters Uploaded',
        description: res?.message || `Successfully uploaded ${uploadedCount} eligible voters.`,
      });
    } catch (err: any) {
      console.error('Upload voters error:', err);
      toast({
        title: 'Failed to upload voters',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingVoters(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!candidateId || !electionId) return;

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      return;
    }

    setDeletingCandidateId(candidateId);
    try {
      await adminAPI.deleteCandidate(candidateId);

      toast({
        title: 'Candidate Deleted',
        description: 'The candidate has been removed from the election.',
      });

      // Reload candidates
      const candidatesRes = await adminAPI.getCandidates(electionId);
      const candidatesData = (candidatesRes.candidates || []).map((c: any) => ({
        ...c,
        id: c._id || c.id,
      }));
      setCandidates(candidatesData);
    } catch (err: any) {
      console.error('Delete candidate error:', err);
      toast({
        title: 'Failed to delete candidate',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setDeletingCandidateId(null);
    }
  };

  const handleDeleteElection = async () => {
    if (!electionId) return;

    setIsDeleting(true);
    try {
      await adminAPI.deleteElection(electionId);
      toast({
        title: 'Election Deleted',
        description: 'The election has been permanently deleted.',
      });
      navigate('/admin/elections');
    } catch (err: any) {
      console.error('Delete election error:', err);
      toast({
        title: 'Failed to delete election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/elections')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold">{election.title}</h1>
                <StatusBadge status={election.status} />
              </div>
              <p className="text-lg text-muted-foreground">
                Position: {election.positionName}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {election.startTime && election.endTime ? (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(election.startTime)} - {formatDate(election.endTime)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Not scheduled
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {candidates.length} candidates
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {eligibleCount} eligible voters
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Schedule Election - Available for draft elections */}
              {election.status === 'draft' && (
                <Button
                  variant="hero"
                  onClick={handleScheduleElection}
                  disabled={isScheduling}
                >
                  {isScheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Election
                    </>
                  )}
                </Button>
              )}

              {/* Force Start - Only available for scheduled elections (backend requirement) */}
              {election.status === 'scheduled' && (
                <Button
                  variant="hero"
                  onClick={() => setShowForceStartDialog(true)}
                  disabled={isForcingAction}
                >
                  {isForcingAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Force Start
                    </>
                  )}
                </Button>
              )}

              {/* Force Close - Available for ongoing elections */}
              {election.status === 'ongoing' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowForceCloseDialog(true)}
                  disabled={isForcingAction}
                >
                  {isForcingAction ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Force Close
                    </>
                  )}
                </Button>
              )}

              {/* Publish Results - Available for closed elections without public results */}
              {election.status === 'closed' && !election.publicResults && (
                <Button variant="hero" onClick={handlePublishResults}>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish Results
                </Button>
              )}

              {/* Export PDF - Available for closed elections with published results */}
              {election.status === 'closed' && election.publicResults && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      // Get vote counts from candidates
                      const totalVotes = candidates.reduce((sum, c) => sum + ((c as any).voteCount || 0), 0);
                      const candidatesWithPercentage = candidates.map((c) => ({
                        displayName: c.displayName,
                        voteCount: (c as any).voteCount || 0,
                        percentage: totalVotes > 0 ? Math.round((((c as any).voteCount || 0) / totalVotes) * 100) : 0,
                      })).sort((a, b) => b.voteCount - a.voteCount);

                      exportElectionResultsToPDF({
                        title: election.title,
                        positionName: election.positionName,
                        endTime: election.endTime,
                        totalVotes,
                        candidates: candidatesWithPercentage,
                      });

                      toast({
                        title: 'PDF Exported',
                        description: 'Election results have been downloaded.',
                      });
                    } catch (err) {
                      toast({
                        title: 'Export Failed',
                        description: 'Failed to generate PDF.',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className={`grid w-full ${election.status === 'closed' ? 'grid-cols-1' : 'grid-cols-3'}`}>
            <TabsTrigger value="candidates" className="flex items-center gap-2">
              {election.status === 'closed' ? <Crown className="w-4 h-4 text-yellow-500" /> : <Users className="w-4 h-4" />}
              {election.status === 'closed' ? 'Results & Candidates' : `Candidates (${candidates.length})`}
            </TabsTrigger>
            {election.status !== 'closed' && (
              <>
                <TabsTrigger value="voters" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Eligible Voters ({eligibleCount})
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-6">
            {/* Winner Section for Closed Elections */}


            {/* Add Candidate Form - Only in draft */}
            {election.status === 'draft' && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Add New Candidate</CardTitle>
                  <CardDescription>Add a candidate to this election</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="candidateName">Display Name</Label>
                      <Input
                        id="candidateName"
                        placeholder="Candidate name"
                        value={newCandidate.name}
                        onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manifesto">Manifesto</Label>
                      <Input
                        id="manifesto"
                        placeholder="Brief manifesto or statement"
                        value={newCandidate.manifesto}
                        onChange={(e) => setNewCandidate({ ...newCandidate, manifesto: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddCandidate} disabled={isAddingCandidate}>
                    {isAddingCandidate ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Add Candidate
                  </Button>
                </CardContent>
              </Card>
            )}
            {/* Winner Section for Closed Elections */}
            {election.status === 'closed' && candidates.length > 0 && (
              (() => {
                const totalVotes = candidates.reduce((sum, c) => sum + ((c as any).votes || 0), 0);

                if (totalVotes === 0) {
                  return (
                    <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-8 text-center mb-6">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="text-lg font-medium text-muted-foreground">No Votes Cast</h3>
                      <p className="text-sm text-muted-foreground/70">
                        This election ended without any votes being recorded.
                      </p>
                    </div>
                  );
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                  >
                    <Card className="border-2 border-status-scheduled bg-gradient-to-br from-status-scheduled/10 to-status-scheduled/5 overflow-hidden">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            {candidates[0].photoUrl ? (
                              <img
                                src={candidates[0].photoUrl}
                                alt={candidates[0].displayName}
                                className="w-24 h-24 rounded-full object-cover border-4 border-status-scheduled shadow-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-status-scheduled shadow-lg">
                                <User className="w-10 h-10 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-status-scheduled flex items-center justify-center shadow-md">
                              <Trophy className="w-4 h-4 text-status-scheduled-foreground" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-status-scheduled font-semibold text-sm mb-1 flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              WINNER
                            </p>
                            <h2 className="text-2xl font-heading font-bold mb-1">{candidates[0].displayName}</h2>
                            {/* Show manifesto if available, but safely cast since it might not exist on type */}
                            {(candidates[0] as any).manifesto && (
                              <p className="text-muted-foreground mb-2">{(candidates[0] as any).manifesto}</p>
                            )}
                            <div className="flex items-center gap-4">
                              <span className="text-3xl font-bold">{(candidates[0] as any).votes || 0}</span>
                              <span className="text-muted-foreground">votes</span>
                              {/* Calculate percentage for winner */}
                              {(() => {
                                const total = candidates.reduce((sum, c) => sum + ((c as any).votes || 0), 0);
                                const winVotes = (candidates[0] as any).votes || 0;
                                const pct = total > 0 ? Math.round((winVotes / total) * 100) : 0;
                                return <span className="text-2xl font-bold text-status-ongoing">{pct}%</span>;
                              })()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()
            )}

            {/* Candidates List */}
            <div className="space-y-4">
              {candidates.map((candidate, index) => {
                // Calculate percentage for results
                // Calculate percentage for results
                // Use 'votes' property which we merged in loadElection
                const totalVotes = candidates.reduce((sum, c) => sum + ((c as any).votes || 0), 0);
                const voteCount = (candidate as any).votes || 0;
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                return (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-border/50 ${election.status === 'closed' ? 'bg-muted/20' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
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
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{candidate.displayName}</h3>
                              {election.status === 'closed' && (
                                <div className="text-right">
                                  <span className="text-lg font-bold">{voteCount}</span>
                                  <span className="text-sm text-muted-foreground ml-1">votes</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {candidate.manifesto}
                            </p>

                            {/* Visual Progress Bar for Results */}
                            {election.status === 'closed' && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="font-medium">{percentage}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {election.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteCandidate(candidate.id || (candidate as any)._id)}
                              disabled={deletingCandidateId === (candidate.id || (candidate as any)._id)}
                            >
                              {deletingCandidateId === (candidate.id || (candidate as any)._id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Voters Tab */}
          <TabsContent value="voters" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Upload Eligible Voters</CardTitle>
                <CardDescription>
                  Upload a CSV file with SRN numbers of eligible voters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Drag and drop a CSV file, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="csv-upload">
                    <Button variant="outline" asChild>
                      <span>Select CSV File</span>
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Eligible Voters Status */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Eligible Voters ({eligibleCount})</CardTitle>
              </CardHeader>
              <CardContent>
                {eligibleCount > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{eligibleCount} voters have been added to this election.</span>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No eligible voters uploaded yet.</p>
                    <p className="text-xs mt-1">Upload a CSV file above to add eligible voters.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Election Settings</CardTitle>
                <CardDescription>
                  {election.status === 'draft'
                    ? 'Modify election details and schedule'
                    : 'Settings are read-only for non-draft elections'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={settingsForm.title}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    disabled={election.status !== 'draft'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position Name</Label>
                  <Input
                    value={settingsForm.positionName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, positionName: e.target.value })}
                    disabled={election.status !== 'draft'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    placeholder="Optional description"
                    disabled={election.status !== 'draft'}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={settingsForm.startTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, startTime: e.target.value })}
                      disabled={election.status !== 'draft'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={settingsForm.endTime}
                      onChange={(e) => setSettingsForm({ ...settingsForm, endTime: e.target.value })}
                      disabled={election.status !== 'draft'}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <Button
                    variant="hero"
                    onClick={handleSaveSettings}
                    disabled={election.status !== 'draft' || isSavingSettings}
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  {election.status === 'draft' && (
                    <Button
                      variant="outline"
                      onClick={handleScheduleElection}
                      disabled={isScheduling}
                    >
                      {isScheduling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Election
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Election
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Force Start Confirmation Dialog */}
      <AlertDialog open={showForceStartDialog} onOpenChange={setShowForceStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Start Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force start this election? This will immediately begin the voting period,
              overriding the scheduled start time. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isForcingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceStart}
              disabled={isForcingAction}
              className="bg-primary hover:bg-primary/90"
            >
              {isForcingAction ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Force Start
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Close Confirmation Dialog */}
      <AlertDialog open={showForceCloseDialog} onOpenChange={setShowForceCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Close Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force close this election? This will immediately end the voting period,
              overriding the scheduled end time. Voters will no longer be able to cast votes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isForcingAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleForceClose}
              disabled={isForcingAction}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isForcingAction ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Closing...
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Force Close
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Election Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this election? This will remove all candidates, votes, and results.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteElection}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
