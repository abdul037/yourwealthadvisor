import { useCoins } from '@/hooks/useCoins';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

export function CoinBalance() {
  const { balance, lifetimeEarned, transactions, isLoading } = useCoins();

  if (isLoading) {
    return (
      <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30 hover:border-amber-500/50">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-amber-600 dark:text-amber-400">{balance.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs">coins</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Tharwa Coins</h4>
              <p className="text-sm text-muted-foreground">Your virtual currency</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-500">{balance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3" />
                {lifetimeEarned.toLocaleString()} earned total
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h5 className="text-sm font-medium mb-2">Recent Activity</h5>
            <ScrollArea className="h-48">
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm">{tx.description || tx.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <span className={tx.amount > 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="border-t pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Earn coins by:</strong> Daily logins, completing challenges, getting upvotes, and achievements
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
