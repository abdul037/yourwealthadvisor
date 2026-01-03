import { useState, useEffect } from 'react';
import { Bell, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { CurrencyConverter, CurrencySelector } from '@/components/CurrencyConverter';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
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

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2">
          <CurrencySelector />
          <div className="hidden sm:block">
            <CurrencyConverter />
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground w-9 h-9">
            <Bell className="w-5 h-5" />
          </Button>
          
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-semibold text-primary-foreground">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground w-9 h-9">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
