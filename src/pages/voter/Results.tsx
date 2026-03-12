import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { useVoterAllElections } from '@/hooks/useQueries';
import { ResultsListSkeleton } from '@/components/common/Skeletons';
import type { Election } from '@/types';

export default function Results() {
  // Fetch ALL elections (including closed) for the results list
  const { data: allElections = [], isLoading } = useVoterAllElections();

  // Backend's /user/elections/all already only returns closed elections with publicResults=true
  // so we just need to filter on status === 'closed'
  const elections = allElections.filter(
    (e: any) => e.status === 'closed'
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Election Results</h1>
        <p className="text-muted-foreground">View results of completed elections</p>
      </div>

      {isLoading ? (
        <ResultsListSkeleton />
      ) : elections.length === 0 ? (
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
          {elections.map((election: Election, index: number) => (
            <motion.div
              key={election.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={election.status} />
                        <span className="text-xs text-status-ongoing font-medium">✓ Results Published</span>
                      </div>
                      <h3 className="text-lg font-semibold">{election.title}</h3>
                      <p className="text-sm text-muted-foreground">{election.positionName}</p>
                    </div>
                    <Link to={`/results/${election.id}`} className="sm:shrink-0">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Results <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
