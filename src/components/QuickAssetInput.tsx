import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssets } from '@/hooks/useAssets';

const ASSET_CATEGORIES = [
  'Cash', 'Stocks', 'Bonds', 'Crypto', 'Gold', 'DigiGold', 
  'Land Asset', 'Car', 'Insurance', 'PF', 'TokenRE',
];

const CURRENCIES = ['AED', 'USD', 'INR', 'EUR', 'GBP', 'SAR'];

const LIQUIDITY_LEVELS = [
  { value: 'L1', label: 'L1 - Highly Liquid' },
  { value: 'L2', label: 'L2 - Moderate' },
  { value: 'L3', label: 'L3 - Less Liquid' },
  { value: 'NL', label: 'NL - Not Liquid' },
];

const APPRECIATION_HINTS: Record<string, string> = {
  'Stocks': '8-12%',
  'Cash': '2-3%',
  'Gold': '3-5%',
  'Crypto': '10-20%',
  'Land Asset': '3-5%',
  'Bonds': '4-6%',
  'Car': '-10 to -15%',
  'Insurance': '4-6%',
  'PF': '8-9%',
  'DigiGold': '3-5%',
  'TokenRE': '5-8%',
};

interface QuickAssetInputProps {
  onSuccess?: () => void;
}

export function QuickAssetInput({ onSuccess }: QuickAssetInputProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [liquidityLevel, setLiquidityLevel] = useState('L2');
  const [appreciationRate, setAppreciationRate] = useState('');
  
  const { addAsset } = useAssets();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !category || !amount) return;

    addAsset.mutate({
      name,
      category,
      amount: parseFloat(amount),
      currency,
      liquidity_level: liquidityLevel,
      appreciation_rate: appreciationRate ? parseFloat(appreciationRate) : null,
    }, {
      onSuccess: () => {
        resetForm();
        onSuccess?.();
      }
    });
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setAmount('');
    setCurrency('AED');
    setLiquidityLevel('L2');
    setAppreciationRate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="asset-name">Asset Name *</Label>
        <Input
          id="asset-name"
          placeholder="e.g., Sarwa Portfolio"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Liquidity</Label>
          <Select value={liquidityLevel} onValueChange={setLiquidityLevel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIQUIDITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Current Value *</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((cur) => (
                <SelectItem key={cur} value={cur}>{cur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Annual Return (%)
          {category && APPRECIATION_HINTS[category] && (
            <span className="text-xs text-muted-foreground ml-2">
              Typical: {APPRECIATION_HINTS[category]}
            </span>
          )}
        </Label>
        <Input
          type="number"
          step="0.1"
          placeholder="e.g., 8 for 8%"
          value={appreciationRate}
          onChange={(e) => setAppreciationRate(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={addAsset.isPending}>
        {addAsset.isPending ? 'Adding...' : 'Add Asset'}
      </Button>
    </form>
  );
}
