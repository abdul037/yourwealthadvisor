import { useMemo } from 'react';
import { useAssets } from './useAssets';
import { useTransactions } from './useTransactions';
import { useLinkedAccounts } from './useLinkedAccounts';
import { convertToAED } from '@/lib/currencyUtils';

export function useNetWorth() {
  const { assets, isLoading: assetsLoading } = useAssets();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts: linkedAccounts, isLoading: linkedAccountsLoading } = useLinkedAccounts();

  const isLoading = assetsLoading || transactionsLoading || linkedAccountsLoading;

  const { totalIncome, totalExpenses, cashPosition } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertToAED(t.amount, t.currency || 'AED'), 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      cashPosition: income - expenses,
    };
  }, [transactions]);

  const assetsTotal = useMemo(() => 
    assets.reduce((sum, asset) => 
      sum + convertToAED(asset.amount || 0, asset.currency || 'AED'), 0
    ), [assets]);

  const linkedAccountsBalance = useMemo(() => 
    (linkedAccounts || []).reduce((sum, acc) => {
      const valueInAED = convertToAED(acc.opening_balance, acc.currency);
      return sum + (valueInAED > 0 ? valueInAED : 0);
    }, 0), [linkedAccounts]);

  const netWorth = assetsTotal + linkedAccountsBalance + cashPosition;

  return {
    netWorth,
    assetsTotal,
    linkedAccountsBalance,
    cashPosition,
    totalIncome,
    totalExpenses,
    isLoading,
  };
}
