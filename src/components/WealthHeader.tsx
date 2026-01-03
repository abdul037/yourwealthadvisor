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
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">WealthTrack</h1>
              <p className="text-xs text-muted-foreground">Portfolio & Expense Manager</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
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
          
          <div className="flex items-center gap-2">
            <CurrencySelector />
            <CurrencyConverter />
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="w-5 h-5" />
            </Button>
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            
            {user ? (
              <>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
                  {user.email?.[0].toUpperCase() || 'U'}
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
