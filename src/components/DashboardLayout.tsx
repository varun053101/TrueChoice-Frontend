import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Vote,
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  User,
  LogOut,
  PlusCircle,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const voterNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/elections', icon: CheckSquare, label: 'Elections' },
  { to: '/results', icon: BarChart3, label: 'Results' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/elections', icon: CheckSquare, label: 'Elections' },
  { to: '/admin/elections/new', icon: PlusCircle, label: 'Create Election' },
];

const superadminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/elections', icon: CheckSquare, label: 'Elections' },
  { to: '/admin/elections/new', icon: PlusCircle, label: 'Create Election' },
  { to: '/superadmin', icon: Crown, label: 'Superadmin' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperadmin;
  const navItems = isSuperadmin ? superadminNavItems : (isAdmin ? adminNavItems : voterNavItems);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar fixed h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="TrueChoice Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-heading font-bold text-sidebar-foreground">TrueChoice</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className={cn('w-5 h-5', isActive && 'text-sidebar-primary')} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50 mb-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
