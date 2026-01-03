import { Asset, formatCurrency, CATEGORY_COLORS, LIQUIDITY_LABELS } from '@/lib/portfolioData';
import { Building, TrendingUp, Wallet, Car, Shield, Landmark, Coins, PiggyBank, Bitcoin, Gem } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Land Asset': <Building className="w-4 h-4" />,
  'Stocks': <TrendingUp className="w-4 h-4" />,
  'Cash': <Wallet className="w-4 h-4" />,
  'Car': <Car className="w-4 h-4" />,
  'Bonds': <Shield className="w-4 h-4" />,
  'TokenRE': <Landmark className="w-4 h-4" />,
  'Gold': <Coins className="w-4 h-4" />,
  'Insurance': <Shield className="w-4 h-4" />,
  'PF': <PiggyBank className="w-4 h-4" />,
  'Crypto': <Bitcoin className="w-4 h-4" />,
  'DigiGold': <Gem className="w-4 h-4" />,
};

const CATEGORY_BG: Record<string, string> = {
  'Land Asset': 'bg-asset-land/20 text-asset-land',
  'Stocks': 'bg-asset-stocks/20 text-asset-stocks',
  'Cash': 'bg-asset-cash/20 text-asset-cash',
  'Car': 'bg-asset-car/20 text-asset-car',
  'Bonds': 'bg-asset-bonds/20 text-asset-bonds',
  'TokenRE': 'bg-asset-realEstate/20 text-asset-realEstate',
  'Gold': 'bg-asset-gold/20 text-asset-gold',
  'Insurance': 'bg-asset-insurance/20 text-asset-insurance',
  'PF': 'bg-asset-pf/20 text-asset-pf',
  'Crypto': 'bg-asset-crypto/20 text-asset-crypto',
  'DigiGold': 'bg-asset-gold/20 text-asset-gold',
};

export function AssetList({ assets }: AssetListProps) {
  const sortedAssets = [...assets].sort((a, b) => b.aedValue - a.aedValue);
  
  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">All Assets</h3>
        <span className="text-xs text-muted-foreground">{assets.length} items</span>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {sortedAssets.map((asset, index) => (
          <div 
            key={asset.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CATEGORY_BG[asset.category]}`}>
              {CATEGORY_ICONS[asset.category]}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{asset.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{asset.category}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {asset.liquidityLevel}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-mono font-medium">{formatCurrency(asset.aedValue)}</p>
              <p className="text-xs text-muted-foreground font-mono">
                ${asset.usdValue.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
