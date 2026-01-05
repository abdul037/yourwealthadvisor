import { TrendingUp, TrendingDown, Building2, Coins, BarChart3, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { BankAccount } from '@/lib/mockBankingData';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Period, getPeriodLabel, getSimulatedChange } from '@/lib/periodUtils';
import { useAssets } from '@/hooks/useAssets';
import { Skeleton } from '@/components/ui/skeleton';

interface PortfolioAggregationProps {
  connectedAccounts?: BankAccount[];
  period?: Period;
}

interface PlatformSummary {
  name: string;
  logo: string;
  value: number;
  currency: string;
  type: 'investment' | 'crypto' | 'utility';
  change?: number;
}

// Map asset categories to display info
const CATEGORY_INFO: Record<string, { logo: string; type: 'investment' | 'crypto' | 'utility' }> = {
  'Stocks': { logo: '📈', type: 'investment' },
  'Bonds': { logo: '📊', type: 'investment' },
  'ETFs': { logo: '📉', type: 'investment' },
  'Mutual Funds': { logo: '🎯', type: 'investment' },
  'Real Estate': { logo: '🏢', type: 'investment' },
  'Retirement': { logo: '🇦🇪', type: 'investment' },
  'Fixed Deposit': { logo: '🏦', type: 'investment' },
  'Crypto': { logo: '₿', type: 'crypto' },
  'Bitcoin': { logo: '₿', type: 'crypto' },
  'Ethereum': { logo: '🪙', type: 'crypto' },
  'Gold': { logo: '🥇', type: 'investment' },
  'Cash': { logo: '💵', type: 'investment' },
};

const USD_TO_AED = 3.67;

export function PortfolioAggregation({ connectedAccounts = [], period = '1W' }: PortfolioAggregationProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { formatAmount } = useFormattedCurrency();
  const { assets, isLoading, refetch } = useAssets();
  
  // Get period-based change
  const periodChange = useMemo(() => getSimulatedChange(period, 5.2), [period]);
  const periodLabel = getPeriodLabel(period);

  // Convert connected accounts to the format we need
  const connectedInvestments = connectedAccounts.filter(a => a.accountType === 'investment');
  const connectedCrypto = connectedAccounts.filter(a => a.accountType === 'crypto');
  const connectedUtilities = connectedAccounts.filter(a => a.accountType === 'utility');

  // Categorize assets from database
  const investmentAssets = useMemo(() => {
    return assets.filter(a => {
      const category = a.category.toLowerCase();
      return category.includes('stock') || 
             category.includes('bond') || 
             category.includes('etf') ||
             category.includes('mutual') ||
             category.includes('real estate') ||
             category.includes('retirement') ||
             category.includes('fixed deposit') ||
             category.includes('gold') ||
             category === 'cash';
    });
  }, [assets]);

  const cryptoAssets = useMemo(() => {
    return assets.filter(a => {
      const category = a.category.toLowerCase();
      return category.includes('crypto') || 
             category.includes('bitcoin') || 
             category.includes('ethereum');
    });
  }, [assets]);
  
  // Calculate totals from real database assets
  const investmentTotalFromDB = useMemo(() => {
    return investmentAssets.reduce((sum, asset) => {
      const valueInAED = asset.currency === 'USD' ? asset.amount * USD_TO_AED : asset.amount;
      return sum + valueInAED;
    }, 0);
  }, [investmentAssets]);

  const cryptoTotalFromDB = useMemo(() => {
    return cryptoAssets.reduce((sum, asset) => {
      // Handle BTC conversion
      if (asset.currency === 'BTC') {
        return sum + asset.amount * 150000;
      }
      const valueInAED = asset.currency === 'USD' ? asset.amount * USD_TO_AED : asset.amount;
      return sum + valueInAED;
    }, 0);
  }, [cryptoAssets]);

  // Add connected account values
  const connectedInvestmentTotal = connectedInvestments.reduce((sum, acc) => {
    const valueInAED = acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance;
    return sum + valueInAED;
  }, 0);

  const connectedCryptoTotal = connectedCrypto.reduce((sum, acc) => {
    if (acc.currency === 'BTC') {
      return sum + acc.balance * 150000;
    }
    const valueInAED = acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance;
    return sum + valueInAED;
  }, 0);

  const utilityDueAED = connectedUtilities.reduce((sum, acc) => {
    return sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0);
  }, 0);

  // Final totals combining database + connected accounts
  const investmentTotalAED = investmentTotalFromDB + connectedInvestmentTotal;
  const cryptoTotalAED = cryptoTotalFromDB + connectedCryptoTotal;
  const totalPortfolioValue = investmentTotalAED + cryptoTotalAED;
  
  // Generate platform summaries from database assets
  const investmentSummaries: PlatformSummary[] = useMemo(() => {
    const summaries: PlatformSummary[] = investmentAssets.map(asset => ({
      name: asset.name,
      logo: CATEGORY_INFO[asset.category]?.logo || '📊',
      value: asset.currency === 'USD' ? asset.amount * USD_TO_AED : asset.amount,
      currency: 'AED',
      type: 'investment' as const,
      change: Math.random() * 10 - 3,
    }));

    // Add connected investment accounts
    connectedInvestments.forEach(acc => {
      summaries.push({
        name: acc.bankName,
        logo: acc.bankLogo,
        value: acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance,
        currency: 'AED',
        type: 'investment' as const,
        change: Math.random() * 10 - 3,
      });
    });

    return summaries;
  }, [investmentAssets, connectedInvestments]);

  const cryptoSummaries: PlatformSummary[] = useMemo(() => {
    const summaries: PlatformSummary[] = cryptoAssets.map(asset => ({
      name: asset.name,
      logo: CATEGORY_INFO[asset.category]?.logo || '₿',
      value: asset.currency === 'BTC' ? asset.amount * 150000 : 
             asset.currency === 'USD' ? asset.amount * USD_TO_AED : asset.amount,
      currency: 'AED',
      type: 'crypto' as const,
    }));

    // Add connected crypto accounts
    connectedCrypto.forEach(acc => {
      summaries.push({
        name: acc.bankName,
        logo: acc.bankLogo,
        value: acc.currency === 'BTC' ? acc.balance * 150000 :
               acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance,
        currency: 'AED',
        type: 'crypto' as const,
      });
    });

    return summaries;
  }, [cryptoAssets, connectedCrypto]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (totalPortfolioValue === 0 && utilityDueAED === 0) {
    return (
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Investment Portfolio Overview</p>
              <p className="text-xs text-muted-foreground">No investments tracked yet</p>
            </div>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm" className="gap-1">
              Add Assets <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Add investment assets or connect platforms to see your portfolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Portfolio Value Card */}
      <div className="wealth-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Investment Portfolio</p>
                <p className="text-xs text-muted-foreground">From your assets & connected platforms</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync All
            </Button>
          </div>
          
          <div className="flex items-end gap-4 flex-wrap">
            <p className="text-3xl sm:text-4xl font-bold font-mono">{formatAmount(totalPortfolioValue)}</p>
            <div className={`flex items-center gap-1 mb-1 ${periodChange >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
              {periodChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{periodChange >= 0 ? '+' : ''}{periodChange.toFixed(1)}%</span>
              <span className="text-xs text-muted-foreground">{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Investments */}
        <div className="wealth-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-asset-stocks/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-asset-stocks" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Investments</p>
                <p className="text-lg font-bold font-mono">{formatAmount(investmentTotalAED)}</p>
              </div>
            </div>
            <Link to="/trends">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {investmentSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No investments yet</p>
            ) : (
              investmentSummaries.slice(0, 6).map((platform, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.logo}</span>
                    <span className="text-sm truncate max-w-[100px]">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{formatAmount(platform.value)}</p>
                    {platform.change !== undefined && (
                      <p className={`text-xs ${platform.change >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
                        {platform.change >= 0 ? '+' : ''}{platform.change.toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Crypto */}
        <div className="wealth-card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-asset-crypto/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-asset-crypto" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Crypto Assets</p>
              <p className="text-lg font-bold font-mono">{formatAmount(cryptoTotalAED)}</p>
            </div>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {cryptoSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No crypto assets yet</p>
            ) : (
              cryptoSummaries.map((platform, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.logo}</span>
                    <span className="text-sm">{platform.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{formatAmount(platform.value)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Utilities Due */}
        <div className="wealth-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Utilities Due</p>
                <p className="text-lg font-bold font-mono text-accent">{formatAmount(utilityDueAED)}</p>
              </div>
            </div>
            <Link to="/expenses">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {connectedUtilities.filter(a => a.balance < 0).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No utilities connected</p>
            ) : (
              connectedUtilities.filter(a => a.balance < 0).map((acc, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{acc.bankLogo}</span>
                    <span className="text-sm">{acc.bankName}</span>
                  </div>
                  <p className="text-sm font-mono text-wealth-negative">
                    {formatAmount(Math.abs(acc.balance))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}