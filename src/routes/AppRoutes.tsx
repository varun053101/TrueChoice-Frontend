import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Loader2 } from 'lucide-react';

// Lazy loaded pages
const Landing = lazy(() => import('@/pages/Landing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const VoterDashboard = lazy(() => import('@/pages/voter/Dashboard'));
const VotingPage = lazy(() => import('@/pages/voter/VotingPage'));
const ResultsPage = lazy(() => import('@/pages/voter/ResultsPage'));
const Elections = lazy(() => import('@/pages/voter/Elections'));
const Results = lazy(() => import('@/pages/voter/Results'));
const Profile = lazy(() => import('@/pages/voter/Profile'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminElections = lazy(() => import('@/pages/admin/Elections'));
const CreateElection = lazy(() => import('@/pages/admin/CreateElection'));
const ManageElection = lazy(() => import('@/pages/admin/ManageElection'));
const SuperAdminDashboard = lazy(() => import('@/pages/superadmin/Dashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function SmartRedirect() {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Landing />;
    if (user?.role === 'admin' || user?.role === 'superadmin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
}

// Fallback loader while bundles are fetching
function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );
}

export function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<SmartRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Voter Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute requiredRole="voter">
                            <VoterDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/elections"
                    element={
                        <ProtectedRoute requiredRole="voter">
                            <Elections />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results"
                    element={
                        <ProtectedRoute requiredRole="voter">
                            <Results />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute requiredRole="voter">
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/vote/:electionId/*"
                    element={
                        <ProtectedRoute requiredRole="voter">
                            <VotingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/results/:electionId/*"
                    element={
                        <ProtectedRoute>
                            <ResultsPage />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requiredRole={['admin', 'superadmin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/elections"
                    element={
                        <ProtectedRoute requiredRole={['admin', 'superadmin']}>
                            <AdminElections />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/elections/new"
                    element={
                        <ProtectedRoute requiredRole={['admin', 'superadmin']}>
                            <CreateElection />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/elections/:electionId/*"
                    element={
                        <ProtectedRoute requiredRole={['admin', 'superadmin']}>
                            <ManageElection />
                        </ProtectedRoute>
                    }
                />

                {/* Superadmin Routes */}
                <Route
                    path="/superadmin"
                    element={
                        <ProtectedRoute requiredRole="superadmin">
                            <SuperAdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
