import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
    Shield,
    User,
    Crown,
    Search,
    Loader2,
    AlertTriangle,
    UserCheck,
    ArrowUpRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useSuperadminAdmin, useSuperadminUsers, useQueryInvalidation } from '@/hooks/useQueries';
import { SuperadminDashboardSkeleton } from '@/components/common/Skeletons';
import { superadminAPI } from '@/services/api';

interface UserInfo {
    id: string;
    _id?: string;
    fullName: string;
    email: string;
    srn: string;
    role: string;
    createdAt?: string;
}

export default function SuperAdminDashboard() {
    const { toast } = useToast();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        action: 'make-admin' | 'make-superadmin' | null;
        user: UserInfo | null;
    }>({ open: false, action: null, user: null });

    const { data: adminData, isLoading: loadingAdmin } = useSuperadminAdmin();
    const { data: users = [], isLoading: loadingUsers } = useSuperadminUsers();
    const { invalidateSuperadmin } = useQueryInvalidation();

    const isLoading = loadingAdmin || loadingUsers;

    const currentAdmin: UserInfo | null = adminData?.admin
        ? { ...adminData.admin, id: adminData.admin._id || adminData.admin.id }
        : null;

    const filteredUsers = users.filter((user: UserInfo) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.srn?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const voterUsers = filteredUsers.filter((u: UserInfo) => u.role === 'voter');

    const handleMakeAdmin = async (user: UserInfo) => {
        setActionLoading(user.id);
        try {
            await superadminAPI.makeAdmin(user.id);
            toast({ title: 'Admin Updated', description: `${user.fullName} is now the admin` });
            invalidateSuperadmin();
        } catch (err: any) {
            toast({ title: 'Failed to update admin', description: err?.response?.data?.error || err?.message || 'An error occurred', variant: 'destructive' });
        } finally {
            setActionLoading(null);
            setConfirmDialog({ open: false, action: null, user: null });
        }
    };

    const handleMakeSuperadmin = async (user: UserInfo) => {
        setActionLoading(user.id);
        try {
            await superadminAPI.makeSuperadmin(user.id);
            toast({ title: 'Superadmin Transferred', description: `${user.fullName} is now the superadmin. Logging you out...` });
            setTimeout(() => { logout(); navigate('/login'); }, 1500);
        } catch (err: any) {
            toast({ title: 'Failed to transfer superadmin', description: err?.response?.data?.error || err?.message || 'An error occurred', variant: 'destructive' });
            setActionLoading(null);
            setConfirmDialog({ open: false, action: null, user: null });
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Crown className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-heading font-bold">Superadmin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">Manage admin privileges and system settings</p>
            </div>

            {isLoading ? (
                <SuperadminDashboardSkeleton />
            ) : (
                <>
                    {/* Current Admin Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <Card className="border-2 border-primary/20">
                            <CardHeader>
                                <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /><CardTitle>Current Admin</CardTitle></div>
                                <CardDescription>The admin can create elections, manage candidates, and control voting</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {currentAdmin ? (
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                                        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                                            <User className="w-7 h-7 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{currentAdmin.fullName}</h3>
                                                <Badge variant="default">Admin</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{currentAdmin.email}</p>
                                            <p className="text-sm text-muted-foreground">SRN: {currentAdmin.srn}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                        <p className="text-sm">No admin is currently assigned. Promote a user to admin below.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* User Management */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <CardTitle>User Management</CardTitle>
                                        <CardDescription>Promote users to admin or transfer superadmin ownership</CardDescription>
                                    </div>
                                    <div className="relative sm:w-64">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {voterUsers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        {users.length === 0
                                            ? 'No users found. The users list endpoint may not be available.'
                                            : 'No voters found matching your search.'}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {voterUsers.map((user: UserInfo, index: number) => (
                                            <motion.div
                                                key={user.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium truncate">{user.fullName}</h4>
                                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                    <p className="text-xs text-muted-foreground">SRN: {user.srn}</p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setConfirmDialog({ open: true, action: 'make-admin', user })} disabled={actionLoading === user.id}>
                                                        {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserCheck className="w-4 h-4 mr-1" /> Make Admin</>}
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => setConfirmDialog({ open: true, action: 'make-superadmin', user })} disabled={actionLoading === user.id}>
                                                        {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowUpRight className="w-4 h-4 mr-1" /> Transfer Ownership</>}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, action: null, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmDialog.action === 'make-admin' ? 'Promote to Admin?' : 'Transfer Superadmin Ownership?'}</DialogTitle>
                        <DialogDescription>
                            {confirmDialog.action === 'make-admin' ? (
                                <>This will make <strong>{confirmDialog.user?.fullName}</strong> the new admin. The current admin will be demoted to voter.</>
                            ) : (
                                <><span className="text-destructive font-medium">Warning: This action cannot be undone!</span><br /><br />You will transfer your superadmin privileges to <strong>{confirmDialog.user?.fullName}</strong>. You will be demoted to voter and lose all admin access.</>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog({ open: false, action: null, user: null })}>Cancel</Button>
                        <Button
                            variant={confirmDialog.action === 'make-superadmin' ? 'destructive' : 'default'}
                            onClick={() => {
                                if (confirmDialog.action === 'make-admin' && confirmDialog.user) handleMakeAdmin(confirmDialog.user);
                                else if (confirmDialog.action === 'make-superadmin' && confirmDialog.user) handleMakeSuperadmin(confirmDialog.user);
                            }}
                            disabled={actionLoading !== null}
                        >
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
