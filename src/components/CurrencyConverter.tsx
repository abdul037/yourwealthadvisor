import { useState, useEffect, createContext, useContext } from 'react';
import { ArrowRightLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { convertCurrency, formatCurrency, Currency } from '@/lib/portfolioData';

// Extended exchange rates with more currencies
const EXTENDED_RATES: Record<string, number> = {
  'AED_USD': 0.27,
  'AED_INR': 22.44,
  'AED_EUR': 0.25,
  'AED_GBP': 0.21,
  'AED_SAR': 1.02,
  'AED_PKR': 75.68,
  'AED_PHP': 15.18,
  'AED_EGP': 13.49,
  'USD_AED': 3.67,
  'USD_INR': 83.50,
  'USD_EUR': 0.92,
  'USD_GBP': 0.79,
  'USD_SAR': 3.75,
  'USD_PKR': 278.50,
  'USD_PHP': 55.80,
  'USD_EGP': 49.50,
  'EUR_USD': 1.09,
  'EUR_AED': 4.00,
  'EUR_INR': 90.50,
  'EUR_GBP': 0.86,
  'GBP_USD': 1.27,
  'GBP_AED': 4.66,
  'GBP_EUR': 1.17,
  'GBP_INR': 105.50,
  'INR_AED': 0.044,
  'INR_USD': 0.012,
  'INR_EUR': 0.011,
  'INR_GBP': 0.0095,
  'SAR_AED': 0.98,
  'SAR_USD': 0.27,
};

type ExtendedCurrency = 'AED' | 'USD' | 'INR' | 'PKR';

const CURRENCIES: { code: ExtendedCurrency; name: string; symbol: string; flag: string }[] = [
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
];

function convertExtended(amount: number, from: ExtendedCurrency, to: ExtendedCurrency): number {
  if (from === to) return amount;
  
  const directKey = `${from}_${to}`;
  if (EXTENDED_RATES[directKey]) {
    return amount * EXTENDED_RATES[directKey];
  }
  
  // Try converting through USD
  const toUSD = EXTENDED_RATES[`${from}_USD`];
  const fromUSD = EXTENDED_RATES[`USD_${to}`];
  if (toUSD && fromUSD) {
    return amount * toUSD * fromUSD;
  }
  
  // Try converting through AED
  const toAED = EXTENDED_RATES[`${from}_AED`];
  const fromAED = EXTENDED_RATES[`AED_${to}`];
  if (toAED && fromAED) {
    return amount * toAED * fromAED;
  }
  
  return amount;
}

// Currency Context for global state
interface CurrencyContextType {
  displayCurrency: ExtendedCurrency;
  setDisplayCurrency: (currency: ExtendedCurrency) => void;
  convert: (amount: number, from: ExtendedCurrency) => number;
  format: (amount: number, from?: ExtendedCurrency) => string;
}

export const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState<ExtendedCurrency>('AED');

  const convert = (amount: number, from: ExtendedCurrency = 'AED') => {
    return convertExtended(amount, from, displayCurrency);
  };

  const format = (amount: number, from: ExtendedCurrency = 'AED') => {
    const converted = convert(amount, from);
    const currency = CURRENCIES.find(c => c.code === displayCurrency);
    return `${currency?.symbol || ''}${converted.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

// Global Currency Selector Component
export function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const currentCurrency = CURRENCIES.find(c => c.code === displayCurrency);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-base">{currentCurrency?.flag}</span>
          <span className="font-mono">{displayCurrency}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1" align="end">
        {CURRENCIES.map(currency => (
          <button
            key={currency.code}
            onClick={() => setDisplayCurrency(currency.code)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
              displayCurrency === currency.code
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
          >
            <span className="text-lg">{currency.flag}</span>
            <div className="text-left">
              <p className="font-medium">{currency.code}</p>
              <p className="text-xs text-muted-foreground">{currency.name}</p>
            </div>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// Inline Currency Converter Widget
export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState<ExtendedCurrency>('AED');
  const [toCurrency, setToCurrency] = useState<ExtendedCurrency>('USD');
  const [isOpen, setIsOpen] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const converted = convertExtended(numAmount, fromCurrency, toCurrency);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowRightLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Convert</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Currency Converter</h4>
          </div>

          {/* From Currency */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">From</label>
            <div className="flex gap-2">
              <Select value={fromCurrency} onValueChange={(v) => setFromCurrency(v as ExtendedCurrency)}>
                <SelectTrigger className="w-28">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span>{fromCurrencyData?.flag}</span>
                      <span>{fromCurrency}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 font-mono"
                placeholder="Amount"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={swapCurrencies}>
              <ArrowRightLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* To Currency */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">To</label>
            <div className="flex gap-2">
              <Select value={toCurrency} onValueChange={(v) => setToCurrency(v as ExtendedCurrency)}>
                <SelectTrigger className="w-28">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <span>{toCurrencyData?.flag}</span>
                      <span>{toCurrency}</span>
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 px-3 py-2 rounded-md bg-muted font-mono text-lg font-bold">
                {toCurrencyData?.symbol}{converted.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
            1 {fromCurrency} = {convertExtended(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
