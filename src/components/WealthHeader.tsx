import { useState, useEffect } from 'react';
import { TrendingUp, Bell, LayoutDashboard, Receipt, DollarSign, LineChart, Shield, Wallet, Settings, TrendingDown, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CurrencyConverter, CurrencySelector } from '@/components/CurrencyConverter';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export function WealthHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Signed out', description: 'You have been signed out.' });
    navigate('/auth');
  };
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/income', label: 'Income', icon: DollarSign },
    { path: '/expenses', label: 'Expenses', icon: Receipt },
    { path: '/budget', label: 'Budget', icon: Wallet },
    { path: '/debt', label: 'Debt', icon: TrendingDown },
    { path: '/trends', label: 'Trends', icon: LineChart },
    { path: '/admin', label: 'Admin', icon: Shield },
  ];
  
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">WealthTrack</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Portfolio & Expense Manager</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={location.pathname === item.path ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`gap-2 ${location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <CurrencySelector />
            <div className="hidden sm:block">
              <CurrencyConverter />
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground w-8 h-8 sm:w-9 sm:h-9">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Link to="/admin" className="hidden sm:block">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            
            {user ? (
              <>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs sm:text-sm font-semibold text-primary-foreground flex-shrink-0">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground w-8 h-8 sm:w-9 sm:h-9">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="lg:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <Button 
                variant={location.pathname === item.path ? "secondary" : "ghost"} 
                size="sm" 
                className={`gap-1 text-xs flex-shrink-0 px-2 ${location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <item.icon className="w-3 h-3" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
