import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get('role') === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      // Redirect based on role
      const role = user?.role;
      if (role === 'admin' || role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillCredentials = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const demoAccounts = [
    { role: 'User', email: 'user@gmail.com', password: 'user@1234', color: 'border-green-500/40 bg-green-500/5' },
    { role: 'Admin', email: 'admin@gmail.com', password: 'admin@123', color: 'border-blue-500/40 bg-blue-500/5' },
    { role: 'Superadmin', email: 'superadmin@gmail.com', password: 'superadmin@123', color: 'border-purple-500/40 bg-purple-500/5' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="TrueChoice Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold">Welcome back</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {isAdminLogin ? 'Admin Portal' : 'Sign in to continue'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder={isAdminLogin ? 'admin@college.edu' : 'you@college.edu'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {!isAdminLogin && (
            <p className="mt-6 text-center text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          )}

          {/* Demo Credentials */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">Demo Credentials</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-3">
              {demoAccounts.map((account) => (
                <div
                  key={account.role}
                  className={`rounded-xl border p-3 ${account.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => fillCredentials(account.email, account.password)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{account.role}</span>
                    <span className="text-xs text-primary font-medium">Click to fill</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Email:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono text-foreground">{account.email}</code>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(account.email, `${account.role}-email`); }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedField === `${account.role}-email` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Password:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-mono text-foreground">{account.password}</code>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); copyToClipboard(account.password, `${account.role}-pass`); }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedField === `${account.role}-pass` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>

      {/* Right Side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 items-center justify-center p-12">
        <motion.div
          className="text-center text-primary-foreground"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <img src="/logo.png" alt="TrueChoice Logo" className="w-64 h-auto object-contain" />
          </motion.div>
          <h2 className="text-3xl font-heading font-bold mb-4">TrueChoice</h2>
          <p className="text-lg text-primary-foreground/80 max-w-sm">
            Revolutionize Campus with secure, transparent, and fair elections.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
