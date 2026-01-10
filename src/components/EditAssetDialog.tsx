import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Asset, useAssets } from '@/hooks/useAssets';

const ASSET_CATEGORIES = [
  'Cash',
  'Stocks',
  'Bonds',
  'Crypto',
  'Gold',
  'DigiGold',
  'Land Asset',
  'Car',
  'Insurance',
  'PF',
  'TokenRE',
];

const CURRENCIES = ['AED', 'USD', 'INR', 'EUR', 'GBP', 'SAR'];

const LIQUIDITY_LEVELS = [
  { value: 'L1', label: 'L1 - Highly Liquid (within days)' },
  { value: 'L2', label: 'L2 - Moderately Liquid (weeks)' },
  { value: 'L3', label: 'L3 - Illiquid (months+)' },
  { value: 'NL', label: 'NL - Not Liquid (Locked Assets)' },
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

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function EditAssetDialog({ open, onOpenChange, asset }: EditAssetDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [liquidityLevel, setLiquidityLevel] = useState('L2');
  const [appreciationRate, setAppreciationRate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const { updateAsset } = useAssets();

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setCategory(asset.category);
      setAmount(String(asset.amount));
      setCurrency(asset.currency);
      setLiquidityLevel(asset.liquidity_level || 'L2');
      setAppreciationRate(asset.appreciation_rate ? String(asset.appreciation_rate) : '');
      setPurchasePrice(asset.purchase_price ? String(asset.purchase_price) : '');
      setPurchaseDate(asset.purchase_date || '');
      setNotes(asset.notes || '');
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset || !name || !category || !amount) return;

    updateAsset.mutate({
      id: asset.id,
      name,
      category,
      amount: parseFloat(amount),
      currency,
      liquidity_level: liquidityLevel,
      appreciation_rate: appreciationRate ? parseFloat(appreciationRate) : null,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      purchase_date: purchaseDate || null,
      notes: notes || null,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Asset Name *</Label>
            <Input
              id="edit-name"
              placeholder="e.g., Sarwa Investment Account"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-liquidity">Liquidity</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Current Value *</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-currency">Currency</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-purchasePrice">Purchase Price</Label>
              <Input
                id="edit-purchasePrice"
                type="number"
                step="0.01"
                placeholder="Optional"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-purchaseDate">Purchase Date</Label>
              <Input
                id="edit-purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-appreciationRate">
              Expected Annual Return (%)
              {category && APPRECIATION_HINTS[category] && (
                <span className="text-xs text-muted-foreground ml-2">
                  Typical: {APPRECIATION_HINTS[category]}
                </span>
              )}
            </Label>
            <Input
              id="edit-appreciationRate"
              type="number"
              step="0.1"
              placeholder="e.g., 8 for 8%"
              value={appreciationRate}
              onChange={(e) => setAppreciationRate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Optional notes about this asset"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAsset.isPending}>
              {updateAsset.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
