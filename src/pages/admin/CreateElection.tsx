import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/services/api';
import { dateInputToUTC } from '@/utils/dateUtils';
import {
  ArrowLeft,
  Loader2,
  Vote,
  Calendar,
  FileText,
  Briefcase,
  Save,
  Clock
} from 'lucide-react';

export default function CreateElection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'draft' | 'schedule' | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    positionName: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  const handleSaveAsDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionType('draft');

    // Backend requires all fields including dates - we'll create with dates but as draft status
    if (!formData.title || !formData.positionName || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Missing required fields',
        description: 'All fields including dates are required.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (startDate >= endDate) {
      toast({
        title: 'Invalid date range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    try {
      // Backend always creates as draft - no status parameter needed
      const payload = {
        title: formData.title,
        positionName: formData.positionName,
        description: formData.description || '',
        startTime: dateInputToUTC(formData.startTime),
        endTime: dateInputToUTC(formData.endTime),
      };

      const res = await adminAPI.createElection(payload);

      toast({
        title: 'Election created as draft!',
        description: res?.message || 'Your election has been created as draft. You can schedule it later.',
      });

      navigate('/admin/elections');
    } catch (err: any) {
      console.error('Create election error:', err);
      toast({
        title: 'Failed to create election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionType('schedule');

    // Backend requires all fields
    if (!formData.title || !formData.positionName || !formData.startTime || !formData.endTime) {
      toast({
        title: 'Missing required fields',
        description: 'All fields including dates are required.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    // Validate dates
    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (startDate >= endDate) {
      toast({
        title: 'Invalid date range',
        description: 'End time must be after start time.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    // Validate start time is in the future
    if (startDate <= new Date()) {
      toast({
        title: 'Invalid start time',
        description: 'Start time must be in the future.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      setActionType(null);
      return;
    }

    try {
      // Backend always creates as draft - we'll create it and then schedule it via update
      const payload = {
        title: formData.title,
        positionName: formData.positionName,
        description: formData.description || '',
        startTime: dateInputToUTC(formData.startTime),
        endTime: dateInputToUTC(formData.endTime),
      };

      const res = await adminAPI.createElection(payload);
      const electionId = res.election?._id || res.election?.id;

      if (electionId) {
        // Schedule the election by updating status
        try {
          await adminAPI.scheduleElection(electionId, {
            startTime: dateInputToUTC(formData.startTime),
            endTime: dateInputToUTC(formData.endTime),
          });

          toast({
            title: 'Election created and scheduled!',
            description: 'Your election has been created and scheduled successfully.',
          });
        } catch (scheduleErr: any) {
          // If scheduling fails, election is still created as draft
          console.error('Schedule error:', scheduleErr);
          toast({
            title: 'Election created as draft',
            description: 'Election was created but scheduling failed. You can schedule it later from the manage page.',
          });
        }
      } else {
        toast({
          title: 'Election created',
          description: res?.message || 'Your election has been created.',
        });
      }

      navigate('/admin/elections');
    } catch (err: any) {
      console.error('Create election error:', err);
      toast({
        title: 'Failed to create election',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin/elections')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Vote className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">Create Election</h1>
              <p className="text-muted-foreground">Set up a new election for your organization</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the main details about the election
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Election Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., CSE Club President Election 2025"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionName" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position Name
                  </Label>
                  <Input
                    id="positionName"
                    placeholder="e.g., President, Secretary, Coordinator"
                    value={formData.positionName}
                    onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role and responsibilities..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Schedule
                </CardTitle>
                <CardDescription>
                  Set the voting period for this election. Required for both draft and scheduled elections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  The election will automatically start and end at the specified times. Save as draft to edit later, or schedule to activate immediately.
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/elections')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={isSubmitting}
              >
                {isSubmitting && actionType === 'draft' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="hero"
                onClick={handleSchedule}
                disabled={isSubmitting}
              >
                {isSubmitting && actionType === 'schedule' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule Election
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
