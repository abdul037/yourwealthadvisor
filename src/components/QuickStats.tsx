import { Building, TrendingUp, Coins, ExternalLink } from 'lucide-react';
import { Asset } from '@/lib/portfolioData';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Period, getSimulatedChange } from '@/lib/periodUtils';
import { useMemo } from 'react';

interface QuickStatsProps {
  assets: Asset[];
  period?: Period;
}

export function QuickStats({ assets, period = '1W' }: QuickStatsProps) {
  const { formatAmount } = useFormattedCurrency();
  
  // Generate period-based changes for each category
  const categoryChanges = useMemo(() => ({
    land: getSimulatedChange(period, 1.2),
    stocks: getSimulatedChange(period, 3.5),
    gold: getSimulatedChange(period, 0.8),
  }), [period]);
  
  const totalWealth = assets.reduce((sum, a) => sum + a.aedValue, 0);
  const stocksValue = assets.filter(a => a.category === 'Stocks').reduce((sum, a) => sum + a.aedValue, 0);
  const landValue = assets.filter(a => a.category === 'Land Asset').reduce((sum, a) => sum + a.aedValue, 0);
  const goldValue = assets.filter(a => ['Gold', 'DigiGold'].includes(a.category)).reduce((sum, a) => sum + a.aedValue, 0);
  
  const stats = [
    { 
      label: 'Real Estate', 
      value: landValue, 
      icon: Building, 
      color: 'text-asset-land',
      bg: 'bg-asset-land/20',
      percentage: ((landValue / totalWealth) * 100).toFixed(1),
      change: categoryChanges.land,
      link: '/trends'
    },
    { 
      label: 'Stocks & Equities', 
      value: stocksValue, 
      icon: TrendingUp, 
      color: 'text-asset-stocks',
      bg: 'bg-asset-stocks/20',
      percentage: ((stocksValue / totalWealth) * 100).toFixed(1),
      change: categoryChanges.stocks,
      link: '/trends'
    },
    { 
      label: 'Gold Holdings', 
      value: goldValue, 
      icon: Coins, 
      color: 'text-asset-gold',
      bg: 'bg-asset-gold/20',
      percentage: ((goldValue / totalWealth) * 100).toFixed(1),
      change: categoryChanges.gold,
      link: '/trends'
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={stat.label}
          className="wealth-card flex items-center justify-between"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold font-mono">{formatAmount(stat.value)}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{stat.percentage}% of total</p>
                <span className={`text-xs font-medium ${stat.change >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
                  {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <Link to={stat.link}>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
