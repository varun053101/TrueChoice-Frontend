import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { electionsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Election } from '@/types';

export default function Results() {
  const { toast } = useToast();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const loadElections = useCallback(async () => {
    setLoading(true);
    try {
      // Use getAll to get all elections including closed ones
      let res;
      try {
        res = await electionsAPI.getAll();
      } catch {
        res = await electionsAPI.getActive();
      }

      // Handle various response formats
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

      // Filter to closed elections with public results
      const closedWithResults = electionsData
        .filter((e: any) => e.status === 'closed' && e.publicResults === true)
        .map((e: any) => ({
          ...e,
          id: e._id || e.id,
        }));

      console.log('Results - closed with publicResults:', closedWithResults);
      setElections(closedWithResults);
    } catch (err: any) {
      console.error('Failed to load results:', err);
      toast({
        title: 'Failed to load results',
        description: err?.response?.data?.error || err?.message || 'An error occurred',
        variant: 'destructive',
      });
      setElections([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadElections();
  }, [loadElections]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold mb-2">Election Results</h1>
          <p className="text-muted-foreground">
            View results of completed elections
          </p>
        </div>
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading results...</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Election Results</h1>
        <p className="text-muted-foreground">
          View results of completed elections
        </p>
      </div>

      {elections.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Available</h3>
            <p className="text-muted-foreground">
              There are no completed elections with published results yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {elections.map((election, index) => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={election.status} />
                        <span className="text-xs text-status-ongoing font-medium">✓ Results Published</span>
                      </div>
                      <CardTitle>{election.title}</CardTitle>
                      <CardDescription>{election.positionName}</CardDescription>
                    </div>
                    <Link to={`/results/${election.id}`}>
                      <Button variant="outline" size="sm">
                        View Results
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
