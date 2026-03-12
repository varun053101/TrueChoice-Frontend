import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Vote, Users, CheckSquare, PlusCircle, ArrowRight, Clock } from 'lucide-react';
import { useAdminElections } from '@/hooks/useQueries';
import { DashboardSkeleton } from '@/components/common/Skeletons';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: elections = [], isLoading } = useAdminElections();

  const totalElections = elections.length;
  const activeElections = elections.filter((e: any) => e.status === 'ongoing').length;
  // Backend /admin/elections returns candidateCount (number) per election, not a candidates array
  const totalCandidates = elections.reduce((acc: number, e: any) => acc + (e.candidateCount || 0), 0);

  const recentElections = elections.slice(0, 5);

  const stats = [
    { label: 'Total Elections', value: totalElections, icon: CheckSquare, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Active Now', value: activeElections, icon: Vote, color: 'text-status-ongoing', bgColor: 'bg-status-ongoing/10' },
    { label: 'Candidates', value: totalCandidates, icon: Users, color: 'text-status-scheduled', bgColor: 'bg-status-scheduled/10' },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Welcome back, {user?.name}. Manage elections and voters.</p>
        </div>
        <Link to="/admin/elections/new" className="shrink-0">
          <Button variant="hero" className="w-full sm:w-auto"><PlusCircle className="w-4 h-4" /> Create Election</Button>
        </Link>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
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

          {/* Recent Elections */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold">Recent Elections</h2>
              <Link to="/admin/elections">
                <Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentElections.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No elections yet</h3>
                    <Link to="/admin/elections/new">
                      <Button variant="hero"><PlusCircle className="w-4 h-4" /> Create Election</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                recentElections.map((election: any, index: number) => {
                  const candidates = election.candidates || [];
                  const voters = election.eligibleCount || 0;
                  return (
                    <motion.div key={election.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card className="border-border/50 hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <StatusBadge status={election.status} />
                                <span className="text-xs text-muted-foreground">{election.positionName}</span>
                              </div>
                              <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {candidates.length} candidates</span>
                                <span className="flex items-center gap-1"><Vote className="w-4 h-4" /> {voters} eligible voters</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatDate(election.startTime)}</span>
                              </div>
                            </div>
                            <Link to={`/admin/elections/${election.id}`} className="sm:shrink-0">
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">Manage <ArrowRight className="w-4 h-4 ml-1" /></Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
