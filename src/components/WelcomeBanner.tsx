import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { DemoDataSeeder } from '@/components/DemoDataSeeder';

export function WelcomeBanner() {
  const { isAuthenticated, displayName, profile, loading } = useUserProfile();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  if (loading) {
    return (
      <div className="wealth-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 animate-pulse">
        <div className="h-16" />
      </div>
    );
  }

  // Not authenticated - show sign in prompt
  if (!isAuthenticated) {
    return (
      <div className="wealth-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20" data-tour="welcome">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">Welcome to Tharwa Net!</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to track your finances and manage your wealth
              </p>
            </div>
          </div>
          <Link to="/auth">
            <Button className="gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated but onboarding not complete
  if (!profile?.onboarding_completed) {
    return (
      <div className="wealth-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20" data-tour="welcome">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground">
              {displayName?.[0]?.toUpperCase() || '👋'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {greeting}, {displayName || 'there'}! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                Welcome to Tharwa Net! Let's set up your wealth dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DemoDataSeeder />
            <Link to="/admin">
              <Button className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated and onboarding complete - show personalized greeting
  return (
    <div className="wealth-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10" data-tour="welcome">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
          {displayName?.[0]?.toUpperCase() || '👋'}
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold">
            {greeting}, {displayName}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Here's your financial overview for today
          </p>
        </div>
      </div>
    </div>
  );
}
