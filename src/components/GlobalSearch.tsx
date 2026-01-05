import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Wallet,
  TrendingDown,
  LineChart,
  Target,
  Sparkles,
  Settings,
  Search,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useMilestones } from '@/hooks/useMilestones';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, keywords: ['home', 'overview'] },
  { name: 'Income', path: '/income', icon: DollarSign, keywords: ['salary', 'earnings', 'revenue'] },
  { name: 'Expenses', path: '/expenses', icon: Receipt, keywords: ['spending', 'costs', 'bills'] },
  { name: 'Budget Planner', path: '/budget', icon: Wallet, keywords: ['allocation', 'planning'] },
  { name: 'Debt Tracker', path: '/debt', icon: TrendingDown, keywords: ['loans', 'mortgage', 'credit'] },
  { name: 'Financial Trends', path: '/trends', icon: LineChart, keywords: ['charts', 'analytics', 'net worth'] },
  { name: 'Savings Goals', path: '/savings', icon: Target, keywords: ['goals', 'targets', 'milestones'] },
  { name: 'AI Tools', path: '/ai-tools', icon: Sparkles, keywords: ['ai', 'insights', 'categorizer'] },
  { name: 'Settings', path: '/admin', icon: Settings, keywords: ['admin', 'preferences', 'configuration'] },
];

interface GlobalSearchProps {
  onExportClick?: () => void;
}

export function GlobalSearch({ onExportClick }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const { assets } = useAssets();
  const { transactions } = useTransactions({ limit: 50 });
  const { debts } = useDebts();
  const { milestones } = useMilestones();

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  const handleExport = useCallback(() => {
    setOpen(false);
    onExportClick?.();
  }, [onExportClick]);

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for pages, transactions, assets..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Data
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          {/* Navigation */}
          <CommandGroup heading="Pages">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.path}
                value={`${item.name} ${item.keywords.join(' ')}`}
                onSelect={() => handleSelect(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
          
          {/* Assets */}
          {assets.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Assets">
                {assets.slice(0, 5).map((asset) => (
                  <CommandItem
                    key={asset.id}
                    value={`asset ${asset.name} ${asset.category}`}
                    onSelect={() => handleSelect('/')}
                  >
                    <DollarSign className="mr-2 h-4 w-4 text-wealth-positive" />
                    <span>{asset.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {asset.currency} {asset.amount.toLocaleString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Transactions">
                {transactions.slice(0, 5).map((transaction) => (
                  <CommandItem
                    key={transaction.id}
                    value={`transaction ${transaction.description} ${transaction.category}`}
                    onSelect={() => handleSelect('/expenses')}
                  >
                    <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{transaction.description || transaction.category}</span>
                    <span className={`ml-auto text-xs ${transaction.type === 'expense' ? 'text-wealth-negative' : 'text-wealth-positive'}`}>
                      {transaction.type === 'expense' ? '-' : '+'}{transaction.currency} {transaction.amount.toLocaleString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {/* Debts */}
          {debts.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Debts">
                {debts.slice(0, 3).map((debt) => (
                  <CommandItem
                    key={debt.id}
                    value={`debt ${debt.name} ${debt.type}`}
                    onSelect={() => handleSelect('/debt')}
                  >
                    <TrendingDown className="mr-2 h-4 w-4 text-wealth-negative" />
                    <span>{debt.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {debt.currency} {debt.current_balance.toLocaleString()}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          {/* Milestones */}
          {milestones.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Milestones">
                {milestones.slice(0, 3).map((milestone) => (
                  <CommandItem
                    key={milestone.id}
                    value={`milestone goal ${milestone.name}`}
                    onSelect={() => handleSelect('/savings')}
                  >
                    <Target className="mr-2 h-4 w-4 text-primary" />
                    <span>{milestone.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {milestone.is_achieved ? '✓ Achieved' : `Target: ${milestone.target_amount.toLocaleString()}`}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
