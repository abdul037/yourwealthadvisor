import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  Wallet, 
  TrendingDown, 
  LineChart,
  MoreHorizontal,
  Sparkles,
  Shield,
  Download,
  Target,
  Split
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const mainNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/income', label: 'Income', icon: DollarSign },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/social', label: 'Social', icon: Sparkles },
];

const moreItems = [
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/debt', label: 'Debt Tracker', icon: TrendingDown },
  { path: '/savings', label: 'Savings Goals', icon: Target },
  { path: '/trends', label: 'Trends', icon: LineChart },
  { path: '/ai-tools', label: 'AI Tools', icon: Sparkles },
  { path: '/admin', label: 'Admin Portal', icon: Shield },
  { path: '/install', label: 'Install App', icon: Download },
];

export function MobileBottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  const isMoreActive = moreItems.some(item => isActive(item.path));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
              isActive(item.path) 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isMoreActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 mb-2 bg-card border-border"
            side="top"
          >
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link 
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 cursor-pointer",
                    isActive(item.path) && "text-primary font-medium"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
