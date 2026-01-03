import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Filter, Download, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BankTransaction } from '@/lib/mockBankingData';
import { format } from 'date-fns';

interface ImportedTransactionsProps {
  transactions: BankTransaction[];
  onCategorize?: (transactionId: string, category: string) => void;
}

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Utilities',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Subscriptions',
  'Housing',
  'Childcare',
  'Salary',
  'Investment',
  'Freelance',
  'Other',
];

export function ImportedTransactions({ transactions, onCategorize }: ImportedTransactionsProps) {
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Description', 'Category', 'Amount', 'Type', 'Merchant'].join(','),
      ...filteredTransactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        `"${t.description}"`,
        t.category,
        t.amount,
        t.type,
        t.merchantName || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="font-medium">No transactions imported yet</p>
        <p className="text-sm">Connect a bank account and sync to import transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-xl font-bold text-green-500">{formatAmount(totalCredits, 'AED')}</p>
        </div>
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-xl font-bold text-red-500">{formatAmount(totalDebits, 'AED')}</p>
        </div>
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">Net Flow</p>
          <p className={`text-xl font-bold ${totalCredits - totalDebits >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatAmount(totalCredits - totalDebits, 'AED')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        
        <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Income</SelectItem>
            <SelectItem value="debit">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
        
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                transaction.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
              }`}>
                {transaction.type === 'credit' ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                  {transaction.merchantName && (
                    <>
                      <span>•</span>
                      <span>{transaction.merchantName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {transaction.category}
              </Badge>
              <p className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}
                {formatAmount(transaction.amount, transaction.currency)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
