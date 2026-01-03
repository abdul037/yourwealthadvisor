import { useCurrency } from '@/components/CurrencyConverter';

type ExtendedCurrency = 'AED' | 'USD' | 'INR' | 'PKR';

interface FormattedCurrencyProps {
  amount: number;
  from?: ExtendedCurrency;
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
  
  if (compact) {
    const converted = convert(amount, from);
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
  
  return <span className={className}>{format(amount, from)}</span>;
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
  
  const formatAmount = (amount: number, from: ExtendedCurrency = 'AED') => {
    return format(amount, from);
  };
  
  const formatCompact = (amount: number, from: ExtendedCurrency = 'AED') => {
    const converted = convert(amount, from);
    if (converted >= 1000000) {
      return `${symbols[displayCurrency]} ${(converted / 1000000).toFixed(1)}M`;
    }
    if (converted >= 1000) {
      return `${symbols[displayCurrency]} ${(converted / 1000).toFixed(1)}K`;
    }
    return format(amount, from);
  };
  
  return { formatAmount, formatCompact, convert, displayCurrency, symbol: symbols[displayCurrency] };
}
