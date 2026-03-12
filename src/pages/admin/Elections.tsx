import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Users, Vote, Clock, ArrowRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ElectionStatus } from '@/types';
import { useAdminElections } from '@/hooks/useQueries';
import { AdminElectionsListSkeleton } from '@/components/common/Skeletons';

const statusFilters: { label: string; value: ElectionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Closed', value: 'closed' },
];

export default function AdminElections() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ElectionStatus | 'all'>('all');

  const { data: elections = [], isLoading } = useAdminElections();

  const filteredElections = elections.filter((election: any) => {
    const matchesSearch = election.title.toLowerCase().includes(search.toLowerCase()) ||
      election.positionName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-2">Elections</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage all elections in the system</p>
        </div>
        <Link to="/admin/elections/new" className="shrink-0">
          <Button variant="hero" className="w-full sm:w-auto"><PlusCircle className="w-4 h-4" /> Create Election</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search elections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(statusFilter === filter.value && 'shadow-md')}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Elections List */}
      <div className="space-y-4">
        {isLoading ? (
          <AdminElectionsListSkeleton />
        ) : filteredElections.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No elections found</h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first election to get started'}
              </p>
              {!search && statusFilter === 'all' && (
                <Link to="/admin/elections/new">
                  <Button variant="hero"><PlusCircle className="w-4 h-4" /> Create Election</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredElections.map((election: any, index: number) => {
            const candidateCount = election.candidateCount || election.candidates?.length || 0;
            const voterCount = election.eligibleCount || election.eligibleVoters?.length || 0;

            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border/50 hover:shadow-md hover:border-primary/20 transition-all">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={election.status} />
                          <span className="text-xs text-muted-foreground">ID: {election.id}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">Position: {election.positionName}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {candidateCount > 0 ? `${candidateCount} candidates` : 'No candidates'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Vote className="w-4 h-4" /> {voterCount > 0 ? `${voterCount} eligible voters` : 'No voters'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Link to={`/admin/elections/${election.id}`} className="sm:shrink-0">
                        <Button variant="outline" className="w-full sm:w-auto">Manage <ArrowRight className="w-4 h-4 ml-1" /></Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
