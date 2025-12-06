import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Vote, Shield, Users, ChartBar, CheckCircle, ArrowRight } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <img src="/logo.png" alt="TrueChoice Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-heading font-bold">TrueChoice</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" size="lg">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="hero" size="lg">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8"
            >
              <Shield className="w-4 h-4" />
              Secure & Transparent Elections
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight"
            >
              Revolutionize <span className="text-gradient">Campus</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              A secure online voting platform for college elections. Transparent, fair, and accessible to all eligible members.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Voting
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login?role=admin">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Admin Portal
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why TrueChoice?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with security and transparency at its core
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Secure Voting',
                description: 'JWT authentication and encrypted vote storage ensure your vote is protected.',
              },
              {
                icon: CheckCircle,
                title: 'One Vote Policy',
                description: 'Each eligible voter can vote only once per election. No duplicates allowed.',
              },
              {
                icon: Users,
                title: 'Eligibility Control',
                description: 'Admins upload voter lists to ensure only authorized students can participate.',
              },
              {
                icon: ChartBar,
                title: 'Transparent Results',
                description: 'Results are calculated fairly and published when admins decide.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to participate in elections
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Register', description: 'Sign up with your college email and SRN' },
              { step: '02', title: 'Get Verified', description: 'Admin adds you to eligible voter list' },
              { step: '03', title: 'Vote', description: 'Cast your vote when election is ongoing' },
              { step: '04', title: 'Results', description: 'View results when published by admin' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="flex items-start gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl">
                  {item.step}
                </div>
                <div className="pt-3">
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
              Ready to Make Your Choice?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students already using TrueChoice for fair elections.
            </p>
            <Link to="/register">
              <Button variant="glass" size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Register Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TrueChoice Logo" className="w-6 h-6 object-contain" />
              <span className="font-heading font-semibold">TrueChoice</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 TrueChoice. Secure Online Voting Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
