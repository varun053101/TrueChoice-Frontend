import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vote, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
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
      // Redirect based on role (handled in AuthContext)
      navigate('/dashboard');
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
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
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="TrueChoice Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Welcome back</h1>
              <p className="text-muted-foreground">
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
            <p className="mt-6 text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          )}

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
