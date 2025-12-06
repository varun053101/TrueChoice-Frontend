import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/services/api';
import { formatDate } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Vote,
  Users,
  CheckSquare,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await adminAPI.getElections();
        // Handle various response formats and normalize IDs
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
        // Normalize IDs (_id to id)
        const normalized = electionsData.map((e: any) => ({
          ...e,
          id: e._id || e.id,
        }));
        if (mounted) setElections(normalized);
      } catch (err) {
        console.error('Failed to load elections for dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const totalElections = elections.length;
  const activeElections = elections.filter(e => e.status === 'ongoing').length;
  const totalCandidates = elections.reduce((acc, e) => acc + (e.candidates?.length || 0), 0);
  const totalEligibleVoters = elections.reduce((acc, e) => acc + (e.eligibleCount || 0), 0);

  const recentElections = elections.slice(0, 5);

  const stats = [
    {
      label: 'Total Elections',
      value: totalElections,
      icon: CheckSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active Now',
      value: activeElections,
      icon: Vote,
      color: 'text-status-ongoing',
      bgColor: 'bg-status-ongoing/10'
    },
    {
      label: 'Candidates',
      value: totalCandidates,
      icon: Users,
      color: 'text-status-scheduled',
      bgColor: 'bg-status-scheduled/10'
    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Manage elections and voters.
          </p>
        </div>
        <Link to="/admin/elections/new">
          <Button variant="hero">
            <PlusCircle className="w-4 h-4" />
            Create Election
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentElections.map((election, index) => {
            const candidates = election.candidates || [];
            const voters = election.eligibleCount || (election.eligibleVoters ? election.eligibleVoters.length : 0) || 0;

            return (
              <motion.div
                key={election.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={election.status} />
                          <span className="text-xs text-muted-foreground">
                            {election.positionName}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {candidates.length} candidates
                          </span>
                          <span className="flex items-center gap-1">
                            <Vote className="w-4 h-4" />
                            {voters} eligible voters
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(election.startTime)}
                          </span>
                        </div>
                      </div>
                      <Link to={`/admin/elections/${election.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>
    </DashboardLayout>
  );
}
