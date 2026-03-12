import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Crown,
  Menu,
  X
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
  { to: '/admin/profile', icon: User, label: 'Profile' },
];

const superadminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/elections', icon: CheckSquare, label: 'Elections' },
  { to: '/admin/elections/new', icon: PlusCircle, label: 'Create Election' },
  { to: '/superadmin', icon: Crown, label: 'Superadmin' },
  { to: '/superadmin/profile', icon: User, label: 'Profile' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSuperadmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin' || isSuperadmin;
  const navItems = isSuperadmin ? superadminNavItems : (isAdmin ? adminNavItems : voterNavItems);

  const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3" onClick={onNavClick}>
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
            <Link key={item.to} to={item.to} onClick={onNavClick}>
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
          onClick={() => { logout(); onNavClick?.(); }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-border bg-sidebar fixed h-screen flex-col z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="TrueChoice Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-heading font-bold text-sidebar-foreground">TrueChoice</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SidebarContent onNavClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
