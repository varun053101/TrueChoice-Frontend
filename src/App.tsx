import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VoterDashboard from "./pages/voter/Dashboard";
import VotingPage from "./pages/voter/VotingPage";
import ResultsPage from "./pages/voter/ResultsPage";
import Elections from "./pages/voter/Elections";
import Results from "./pages/voter/Results";
import Profile from "./pages/voter/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminElections from "./pages/admin/Elections";
import CreateElection from "./pages/admin/CreateElection";
import ManageElection from "./pages/admin/ManageElection";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Smart redirect based on auth status
function SmartRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (user?.role === 'admin' || user?.role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              path="/vote/:electionId"
              element={
                <ProtectedRoute requiredRole="voter">
                  <VotingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:electionId"
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
              path="/admin/elections/:electionId"
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
