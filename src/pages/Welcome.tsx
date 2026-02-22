import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { 
  TrendingUp, Wallet, PiggyBank, CreditCard, BarChart3, 
  Shield, ArrowRight, Sparkles, Brain, Users, Landmark,
  Trophy, Download, Crown, Check, Globe, Lock, Zap,
  UserPlus, Link2, BarChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TharwaLogo } from '@/components/TharwaLogo';

// ─── Scroll-reveal hook ───
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, className: visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8', visible };
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, className: reveal } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${reveal} ${className}`}>
      {children}
    </div>
  );
}

// ─── Data ───
const features = [
  { icon: Wallet, title: 'Income Tracking', desc: 'Monitor salary, freelance, and passive income across family members' },
  { icon: CreditCard, title: 'Expense Management', desc: 'Auto-categorize spending and spot leaks in your budget instantly' },
  { icon: PiggyBank, title: 'Savings Goals', desc: 'Set targets for emergencies, vacations, or big purchases with visual progress' },
  { icon: BarChart3, title: 'Budget Planner', desc: 'Allocate income smartly and get alerts before you overspend' },
  { icon: Brain, title: 'AI Insights', desc: 'Get personalized recommendations powered by machine learning on your data' },
  { icon: Landmark, title: 'Debt Payoff', desc: 'Snowball or avalanche strategies with payoff date projections' },
  { icon: Users, title: 'Split Expenses', desc: 'Share costs with roommates, trips, or family — settle up in seconds' },
  { icon: Trophy, title: 'Social Challenges', desc: 'Compete with friends on savings streaks and financial milestones' },
];

const stats = [
  { icon: Globe, label: 'Built for UAE families' },
  { icon: CreditCard, label: 'AED + multi-currency' },
  { icon: Sparkles, label: 'AI-powered insights' },
  { icon: Lock, label: '100% private & secure' },
];

const steps = [
  { num: '01', icon: UserPlus, title: 'Sign Up Free', desc: 'Create your account in 30 seconds — no credit card needed' },
  { num: '02', icon: Link2, title: 'Add Your Finances', desc: 'Enter income, expenses, assets, and debts manually or via bulk upload' },
  { num: '03', icon: BarChart, title: 'Get AI Insights', desc: 'Receive personalized recommendations and track your wealth growth' },
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <TharwaLogo size="md" variant="full" />
          <div className="flex items-center gap-3">
            <Link to="/auth?mode=signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              Trusted by families across the UAE
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Your Personal{' '}
              <span className="gradient-text">Wealth Manager</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Track income, expenses, savings goals, and investments for your entire family — 
              powered by AI insights and built for the UAE.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 w-full sm:w-auto text-base px-8 h-12 glow-effect">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">No credit card required • Free forever</p>
          </div>

          {/* Dashboard Preview Mock */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="wealth-card p-1">
              <div className="rounded-xl bg-background/60 border border-border/50 p-6 space-y-4">
                {/* Mock header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="wealth-label">Total Net Worth</p>
                    <p className="text-3xl sm:text-4xl font-bold font-mono tracking-tight mt-1">AED 847,230</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-wealth-positive/20 text-wealth-positive">
                    <TrendingUp className="w-3 h-3" />
                    +12.4%
                  </div>
                </div>
                {/* Mock chart bars */}
                <div className="flex items-end gap-2 h-24 pt-4">
                  {[40, 55, 45, 65, 50, 72, 60, 80, 70, 90, 75, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary/60 to-primary/20"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Mock stats row */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Invested</p>
                    <p className="font-mono font-semibold text-sm mt-0.5">AED 523,400</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Cash</p>
                    <p className="font-mono font-semibold text-sm mt-0.5 text-wealth-positive">AED 198,830</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Savings Rate</p>
                    <p className="font-mono font-semibold text-sm mt-0.5 text-accent">34.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 justify-center py-2">
                <s.icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Everything you need to{' '}
                <span className="gradient-text">grow your wealth</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                From daily expense tracking to AI-powered financial insights — one app for your entire family.
              </p>
            </div>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <Section key={f.title}>
                <Card className="group border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_30px_-8px_hsl(var(--primary)/0.15)] h-full"
                  style={{ transitionDelay: `${i * 50}ms` }}>
                  <CardContent className="pt-6">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <Section>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
              Get started in <span className="gradient-text">3 simple steps</span>
            </h2>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <Section key={s.num}>
                <div className="relative text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-xs font-mono font-bold text-primary/60 tracking-widest">{s.num}</span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(50%+48px)] w-[calc(100%-48px)] border-t border-dashed border-primary/20" />
                  )}
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Case / Dubai Focus ─── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Section>
            <div className="max-w-3xl mx-auto">
              <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20 overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Built for Dubai expat families
                      </h2>
                      <p className="text-muted-foreground">
                        Managing AED, USD, INR, and more? Tharwa Net handles multi-currency tracking 
                        so you can see your true global net worth in one place.
                      </p>
                      <div className="space-y-2.5 pt-2">
                        {[
                          'Track school fees, DEWA bills, and rent',
                          'Monitor savings goals in any currency',
                          'AI categorization for UAE merchants',
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Globe className="w-20 h-20 text-primary/40" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Pricing Teaser ─── */}
      <section className="py-16 bg-muted/10">
        <div className="container mx-auto px-4">
          <Section>
            <div className="text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Crown className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Free forever.{' '}
                <span className="text-accent">Premium when you're ready.</span>
              </h2>
              <p className="text-muted-foreground">
                All core features are free with no limits. Unlock AI insights, 
                advanced reports, and priority support with Premium.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 w-full sm:w-auto">
                    Start Free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/membership">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Plans
                  </Button>
                </Link>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-muted/10">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <TharwaLogo size="sm" variant="full" />
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-foreground transition-colors">Dashboard</Link>
              <Link to="/membership" className="hover:text-foreground transition-colors">Membership</Link>
              <Link to="/install" className="hover:text-foreground transition-colors flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Install App
              </Link>
            </nav>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Tharwa Net • Your Personalized Wealth Manager
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
