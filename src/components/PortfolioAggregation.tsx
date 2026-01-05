import { TrendingUp, TrendingDown, Building2, Coins, BarChart3, Zap, RefreshCw, ExternalLink } from 'lucide-react';
import { BankAccount, DEMO_INVESTMENT_ACCOUNTS, DEMO_CRYPTO_ACCOUNTS, DEMO_UTILITY_ACCOUNTS } from '@/lib/mockBankingData';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Period, getPeriodLabel, getSimulatedChange } from '@/lib/periodUtils';

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

export function PortfolioAggregation({ connectedAccounts = [], period = '1W' }: PortfolioAggregationProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { formatAmount } = useFormattedCurrency();
  
  // Get period-based change
  const periodChange = useMemo(() => getSimulatedChange(period, 5.2), [period]);
  const periodLabel = getPeriodLabel(period);
  
  // Combine demo accounts with any connected accounts for display
  const allInvestmentAccounts = [...DEMO_INVESTMENT_ACCOUNTS, ...connectedAccounts.filter(a => a.accountType === 'investment')];
  const allCryptoAccounts = [...DEMO_CRYPTO_ACCOUNTS, ...connectedAccounts.filter(a => a.accountType === 'crypto')];
  const allUtilityAccounts = [...DEMO_UTILITY_ACCOUNTS, ...connectedAccounts.filter(a => a.accountType === 'utility')];
  
  // Calculate totals (convert to AED for consistency)
  const USD_TO_AED = 3.67;
  
  const investmentTotalAED = allInvestmentAccounts.reduce((sum, acc) => {
    const valueInAED = acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance;
    return sum + valueInAED;
  }, 0);
  
  const cryptoTotalAED = allCryptoAccounts.reduce((sum, acc) => {
    // For BTC, assume ~150,000 AED per BTC
    if (acc.currency === 'BTC') {
      return sum + acc.balance * 150000;
    }
    const valueInAED = acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance;
    return sum + valueInAED;
  }, 0);
  
  const utilityDueAED = allUtilityAccounts.reduce((sum, acc) => {
    return sum + (acc.balance < 0 ? Math.abs(acc.balance) : 0);
  }, 0);
  
  const totalPortfolioValue = investmentTotalAED + cryptoTotalAED;
  
  // Generate platform summaries
  const investmentSummaries: PlatformSummary[] = allInvestmentAccounts.map(acc => ({
    name: acc.bankName,
    logo: acc.bankLogo,
    value: acc.currency === 'USD' ? acc.balance * USD_TO_AED : acc.balance,
    currency: 'AED',
    type: 'investment' as const,
    change: Math.random() * 10 - 3, // Simulated change
  }));
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

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
                <p className="text-xs text-muted-foreground">Across all connected platforms</p>
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
          <div className="space-y-2">
            {investmentSummaries.slice(0, 4).map((platform, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{platform.logo}</span>
                  <span className="text-sm">{platform.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{formatAmount(platform.value)}</p>
                  <p className={`text-xs ${platform.change && platform.change >= 0 ? 'text-wealth-positive' : 'text-wealth-negative'}`}>
                    {platform.change && platform.change >= 0 ? '+' : ''}{platform.change?.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
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
          <div className="space-y-2">
            {allCryptoAccounts.map((acc, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{acc.bankLogo}</span>
                  <span className="text-sm">{acc.bankName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">
                    {acc.currency === 'BTC' 
                      ? `${acc.balance} BTC`
                      : formatAmount(acc.balance)
                    }
                  </p>
                </div>
              </div>
            ))}
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
            {allUtilityAccounts.filter(a => a.balance < 0).map((acc, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{acc.bankLogo}</span>
                  <span className="text-sm">{acc.bankName}</span>
                </div>
                <p className="text-sm font-mono text-wealth-negative">
                  {formatAmount(Math.abs(acc.balance))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
