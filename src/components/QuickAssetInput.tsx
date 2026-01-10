import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAssets } from '@/hooks/useAssets';
import { useAssetParser, ParsedAsset } from '@/hooks/useAssetParser';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Mic, MicOff, Sparkles, ArrowRight, Check, X, Edit3, ChevronDown, ChevronUp, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const CATEGORY_ICONS: Record<string, string> = {
  'Cash': '💵',
  'Stocks': '📈',
  'Bonds': '📊',
  'Crypto': '₿',
  'Gold': '🥇',
  'DigiGold': '✨',
  'Land Asset': '🏠',
  'Car': '🚗',
  'Insurance': '🛡️',
  'PF': '🏦',
  'TokenRE': '🏢',
};

const EXAMPLE_PHRASES = [
  "My Sarwa portfolio is worth 50000",
  "Gold 2oz valued at 15000 AED",
  "Tesla stock worth $5000",
  "Crypto 10000 in Binance",
];

interface QuickAssetInputProps {
  onSuccess?: () => void;
}

export function QuickAssetInput({ onSuccess }: QuickAssetInputProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [input, setInput] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Editable fields for preview
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState('AED');
  const [editLiquidity, setEditLiquidity] = useState('L2');
  const [editAppreciation, setEditAppreciation] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const { addAsset } = useAssets();
  const { parseAsset, parsedAsset, isLoading, error, reset } = useAssetParser();
  const { 
    isListening, 
    isSupported: isVoiceSupported, 
    transcript, 
    startListening, 
    stopListening 
  } = useVoiceInput();

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Sync parsed asset to editable fields
  useEffect(() => {
    if (parsedAsset) {
      setEditName(parsedAsset.name);
      setEditCategory(parsedAsset.category);
      setEditAmount(parsedAsset.amount.toString());
      setEditCurrency(parsedAsset.currency);
      setEditLiquidity(parsedAsset.liquidity_level);
      setEditAppreciation(parsedAsset.appreciation_rate?.toString() || '');
    }
  }, [parsedAsset]);

  const handleParse = async () => {
    if (!input.trim()) return;
    await parseAsset(input);
  };

  const handleConfirm = () => {
    if (!editName || !editCategory || !editAmount) return;

    addAsset.mutate({
      name: editName,
      category: editCategory,
      amount: parseFloat(editAmount),
      currency: editCurrency,
      liquidity_level: editLiquidity,
      appreciation_rate: editAppreciation ? parseFloat(editAppreciation) : null,
      notes: editNotes || null,
    }, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
          onSuccess?.();
        }, 1500);
      }
    });
  };

  const resetForm = () => {
    setInput('');
    setEditName('');
    setEditCategory('');
    setEditAmount('');
    setEditCurrency('AED');
    setEditLiquidity('L2');
    setEditAppreciation('');
    setEditNotes('');
    setIsEditing(false);
    setShowAdvanced(false);
    reset();
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <p className="text-lg font-medium text-foreground">Asset Added!</p>
        <p className="text-sm text-muted-foreground mt-1">{editName}</p>
      </div>
    );
  }

  // Preview/Confirmation state (AI mode)
  if (parsedAsset && mode === 'ai') {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Asset Preview</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>

        <div className={cn(
          "rounded-lg border p-4 space-y-4",
          "bg-amber-500/5 border-amber-500/30"
        )}>
          {isEditing ? (
            // Editable form
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Asset Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-9"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_ICONS[cat]} {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Liquidity</Label>
                  <Select value={editLiquidity} onValueChange={setEditLiquidity}>
                    <SelectTrigger className="h-9">
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
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Currency</Label>
                  <Select value={editCurrency} onValueChange={setEditCurrency}>
                    <SelectTrigger className="h-9">
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
                <Label className="text-xs">
                  Annual Return (%)
                  {editCategory && APPRECIATION_HINTS[editCategory] && (
                    <span className="text-muted-foreground ml-2">
                      Typical: {APPRECIATION_HINTS[editCategory]}
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editAppreciation}
                  onChange={(e) => setEditAppreciation(e.target.value)}
                  placeholder="e.g., 8"
                  className="h-9"
                />
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full h-8 text-xs"
              >
                {showAdvanced ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {showAdvanced ? 'Hide' : 'Show'} Notes
              </Button>

              {showAdvanced && (
                <div className="space-y-2">
                  <Label className="text-xs">Notes (optional)</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="min-h-[60px] text-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            // Preview display
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">
                  {CATEGORY_ICONS[editCategory] || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{editName}</p>
                  <p className="text-xs text-muted-foreground">{editCategory}</p>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-foreground">
                {editCurrency} {parseFloat(editAmount).toLocaleString()}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {LIQUIDITY_LEVELS.find(l => l.value === editLiquidity)?.label.split(' - ')[1]}
                </span>
                {editAppreciation && (
                  <span>~{editAppreciation}% return</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={resetForm}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={addAsset.isPending || !editName || !editCategory || !editAmount}
            className="flex-1"
          >
            {addAsset.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  // Manual form mode
  if (mode === 'manual') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Manual Entry</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('ai')}
            className="h-8 text-xs text-primary"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Mode
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name *</Label>
            <Input
              id="asset-name"
              placeholder="e.g., Sarwa Portfolio"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Liquidity</Label>
              <Select value={editLiquidity} onValueChange={setEditLiquidity}>
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
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={editCurrency} onValueChange={setEditCurrency}>
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
              {editCategory && APPRECIATION_HINTS[editCategory] && (
                <span className="text-xs text-muted-foreground ml-2">
                  Typical: {APPRECIATION_HINTS[editCategory]}
                </span>
              )}
            </Label>
            <Input
              type="number"
              step="0.1"
              placeholder="e.g., 8 for 8%"
              value={editAppreciation}
              onChange={(e) => setEditAppreciation(e.target.value)}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full h-8 text-xs"
          >
            {showAdvanced ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
            {showAdvanced ? 'Hide' : 'Show'} Notes
          </Button>

          {showAdvanced && (
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Any additional notes..."
                className="min-h-[60px]"
              />
            </div>
          )}

          <Button 
            onClick={handleConfirm} 
            className="w-full" 
            disabled={addAsset.isPending || !editName || !editCategory || !editAmount}
          >
            {addAsset.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Asset'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // AI input mode (default)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">AI-Powered</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMode('manual')}
          className="h-8 text-xs"
        >
          Manual Entry
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm opacity-50" />
        <div className="relative flex items-center gap-2 p-1 rounded-lg border bg-background">
          {isVoiceSupported && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(
                "h-10 w-10 shrink-0 rounded-md transition-colors",
                isListening && "bg-red-500/10 text-red-500 animate-pulse"
              )}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleParse()}
            placeholder="Describe your asset..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isLoading}
          />
          
          <Button
            onClick={handleParse}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-md"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Try saying:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PHRASES.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => setInput(phrase)}
              className="text-xs px-2 py-1 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
            >
              "{phrase}"
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-dashed">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Add stocks, crypto, property, gold, and more. AI will categorize and set smart defaults.
        </p>
      </div>
    </div>
  );
}
