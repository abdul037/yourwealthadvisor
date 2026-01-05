import { useCurrency } from '@/components/CurrencyConverter';
import { Currency } from '@/lib/portfolioData';

type ExtendedCurrency = 'AED' | 'USD' | 'INR' | 'PKR';

// Helper to convert any currency to ExtendedCurrency for display
const toExtendedCurrency = (currency: string): ExtendedCurrency => {
  if (['AED', 'USD', 'INR', 'PKR'].includes(currency)) {
    return currency as ExtendedCurrency;
  }
  return 'AED'; // Default fallback
};

interface FormattedCurrencyProps {
  amount: number;
  from?: ExtendedCurrency | Currency;
  className?: string;
  showSymbol?: boolean;
  compact?: boolean;
}

export function FormattedCurrency({ 
  amount, 
  from = 'AED', 
  className = '',
  showSymbol = true,
  compact = false
}: FormattedCurrencyProps) {
  const { format, convert, displayCurrency } = useCurrency();
  const fromCurrency = toExtendedCurrency(from);
  
  if (compact) {
    const converted = convert(amount, fromCurrency);
    const symbols: Record<ExtendedCurrency, string> = {
      'AED': 'AED',
      'USD': '$',
      'INR': '₹',
      'PKR': '₨'
    };
    
    const formatCompact = (num: number): string => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      }
      return num.toFixed(0);
    };
    
    return (
      <span className={className}>
        {showSymbol ? `${symbols[displayCurrency]} ` : ''}{formatCompact(converted)}
      </span>
    );
  }
  
  return <span className={className}>{format(amount, fromCurrency)}</span>;
}

// Hook for getting formatted currency values
export function useFormattedCurrency() {
  const { format, convert, displayCurrency } = useCurrency();
  
  const symbols: Record<ExtendedCurrency, string> = {
    'AED': 'AED',
    'USD': '$',
    'INR': '₹',
    'PKR': '₨'
  };
  
  const formatAmount = (amount: number, from: ExtendedCurrency | Currency | string = 'AED') => {
    const fromCurrency = toExtendedCurrency(from);
    return format(amount, fromCurrency);
  };
  
  const formatCompact = (amount: number, from: ExtendedCurrency | Currency | string = 'AED') => {
    const fromCurrency = toExtendedCurrency(from);
    const converted = convert(amount, fromCurrency);
    if (converted >= 1000000) {
      return `${symbols[displayCurrency]} ${(converted / 1000000).toFixed(1)}M`;
    }
    if (converted >= 1000) {
      return `${symbols[displayCurrency]} ${(converted / 1000).toFixed(1)}K`;
    }
    return format(amount, fromCurrency);
  };
  
  return { formatAmount, formatCompact, convert, displayCurrency, symbol: symbols[displayCurrency] };
}
