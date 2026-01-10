import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIncomes } from '@/hooks/useIncomes';
import { usePartners } from '@/hooks/usePartners';
import { CheckCircle2, Loader2, Wallet, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment Returns' },
  { value: 'dividend', label: 'Dividends' },
  { value: 'business', label: 'Business Income' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP', 'INR', 'SAR'];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const LIQUIDITY_LEVELS = [
  { value: 'L1', label: 'Instant (L1)' },
  { value: 'L2', label: '1 Week (L2)' },
  { value: 'L3', label: '1 Month+ (L3)' },
  { value: 'NL', label: 'Non-Liquid (NL)' },
];

interface QuickIncomeInputProps {
  onSuccess?: () => void;
}

export function QuickIncomeInput({ onSuccess }: QuickIncomeInputProps) {
  const { addIncome, isLoading: incomesLoading } = useIncomes();
  const { partners, addPartner, isLoading: partnersLoading } = usePartners();
  
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState('salary');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [frequency, setFrequency] = useState('monthly');
  const [partnerId, setPartnerId] = useState('');
  const [liquidityLevel, setLiquidityLevel] = useState('L1');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [showNewPartner, setShowNewPartner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceName.trim() || !amount || !partnerId) {
      return;
    }

    try {
      await addIncome.mutateAsync({
        source_name: sourceName.trim(),
        source_type: sourceType,
        amount: parseFloat(amount),
        currency,
        frequency,
        partner_id: partnerId,
        liquidity_level: liquidityLevel as 'L1' | 'L2' | 'L3' | 'NL',
        is_active: true,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetForm();
        onSuccess?.();
      }, 1500);
    } catch (error) {
      console.error('Failed to add income source:', error);
    }
  };

  const handleAddPartner = async () => {
    if (!newPartnerName.trim()) return;
    
    try {
      const result = await addPartner.mutateAsync({
        name: newPartnerName.trim(),
        is_active: true,
      });
      setPartnerId(result.id);
      setNewPartnerName('');
      setShowNewPartner(false);
    } catch (error) {
      console.error('Failed to add partner:', error);
    }
  };

  const resetForm = () => {
    setSourceName('');
    setSourceType('salary');
    setAmount('');
    setCurrency('AED');
    setFrequency('monthly');
    setPartnerId('');
    setLiquidityLevel('L1');
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground">Income Source Added!</p>
        <p className="text-sm text-muted-foreground mt-1">
          {sourceName} - {currency} {parseFloat(amount).toLocaleString()}/{frequency}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Add Income Source</h3>
          <p className="text-xs text-muted-foreground">Track recurring income streams</p>
        </div>
      </div>

      {/* Source Name */}
      <div className="space-y-2">
        <Label htmlFor="sourceName">Source Name</Label>
        <Input
          id="sourceName"
          placeholder="e.g., Main Salary, Rental - Marina Apt"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          required
        />
      </div>

      {/* Type and Partner in 2 columns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Income Type</Label>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INCOME_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Partner / Earner</Label>
          {showNewPartner ? (
            <div className="flex gap-2">
              <Input
                placeholder="Name"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleAddPartner}
                disabled={addPartner.isPending}
              >
                {addPartner.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <Select value={partnerId} onValueChange={setPartnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {partners.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id}>
                    {partner.name}
                  </SelectItem>
                ))}
                <SelectItem value="_new" onSelect={() => setShowNewPartner(true)}>
                  <span className="flex items-center gap-2 text-primary">
                    <Plus className="h-3 w-3" /> Add New Partner
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Amount, Currency, Frequency */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="25000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
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
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map((freq) => (
                <SelectItem key={freq.value} value={freq.value}>
                  {freq.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liquidity Level */}
      <div className="space-y-2">
        <Label>Liquidity Level</Label>
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

      {/* Submit */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={addIncome.isPending || !sourceName.trim() || !amount || !partnerId}
      >
        {addIncome.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          'Add Income Source'
        )}
      </Button>
    </form>
  );
}
