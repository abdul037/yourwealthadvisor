import { Link } from 'react-router-dom';
import { 
  TrendingUp, Wallet, PiggyBank, CreditCard, 
  BarChart3, Shield, ArrowRight, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TharwaLogo } from '@/components/TharwaLogo';

const features = [
  {
    icon: Wallet,
    title: 'Track Income',
    description: 'Monitor all income sources across family members with detailed breakdowns',
  },
  {
    icon: CreditCard,
    title: 'Monitor Expenses',
    description: 'Categorize spending and identify where your money goes each month',
  },
  {
    icon: PiggyBank,
    title: 'Set Savings Goals',
    description: 'Create financial goals and track your progress with visual milestones',
  },
  {
    icon: BarChart3,
    title: 'Plan Budgets',
    description: 'Allocate monthly income and get alerts when approaching limits',
  },
];

const benefits = [
  { icon: TrendingUp, text: 'See your complete financial picture' },
  { icon: Shield, text: 'Your data is private and secure' },
  { icon: Sparkles, text: 'AI-powered insights and recommendations' },
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <TharwaLogo size="lg" variant="full" />
        <Link to="/auth">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Your Personal{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Wealth Manager
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Take control of your family finances. Track income, expenses, savings goals, 
            and investments — all in one beautiful dashboard.
          </p>
          <p className="text-sm text-muted-foreground">
            ثروة نت — إدارة ثروتك الشخصية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Everything you need to manage your wealth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-lg mx-auto">
            <p className="text-3xl font-bold text-primary">1,000+</p>
            <p className="text-muted-foreground">Families tracking their wealth with Tharwa Net</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-center mb-6">Why Tharwa Net?</h2>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link to="/auth">
                  <Button className="gap-2">
                    Start Managing Your Wealth
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © 2026 Tharwa Net • Your Personalized Wealth Manager
        </p>
      </footer>
    </div>
  );
}