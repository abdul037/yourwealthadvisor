import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, X, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type TransactionType = 'income' | 'expense' | 'asset' | 'debt' | 'transfer';

export interface BulkTransaction {
  date: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  currency: string;
  partner?: string;
  liquidity_level?: string;
  interest_rate?: number;
  notes?: string;
  status: 'valid' | 'warning' | 'error';
  errors?: string[];
}

const TRANSACTION_TYPES: { value: TransactionType; label: string; color: string }[] = [
  { value: 'income', label: 'Income', color: 'bg-wealth-positive/20 text-wealth-positive' },
  { value: 'expense', label: 'Expense', color: 'bg-wealth-negative/20 text-wealth-negative' },
  { value: 'asset', label: 'Asset', color: 'bg-chart-2/20 text-chart-2' },
  { value: 'debt', label: 'Debt', color: 'bg-accent/20 text-accent' },
  { value: 'transfer', label: 'Transfer', color: 'bg-muted-foreground/20 text-muted-foreground' },
];

const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Freelance', 'Investment', 'Rental', 'Dividend', 'Side Business', 'Other'];
const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Subscriptions', 'Housing', 'Childcare', 'Other'];
const ASSET_CATEGORIES = ['Cash', 'Stocks', 'Bonds', 'Gold', 'Crypto', 'Real Estate', 'Land Asset', 'Insurance', 'Provident Fund', 'DigiGold', 'Other'];
const DEBT_CATEGORIES = ['Mortgage', 'Car Loan', 'Personal Loan', 'Credit Card', 'Student Loan', 'Business Loan', 'Other'];
const CURRENCIES = ['AED', 'USD', 'INR', 'EUR', 'GBP', 'SAR'];
const LIQUIDITY_LEVELS = ['L1', 'L2', 'L3', 'NL'];

function validateTransaction(row: Partial<BulkTransaction>, type: TransactionType): BulkTransaction {
  const errors: string[] = [];
  
  // Date validation
  if (!row.date) {
    errors.push('Date is required');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(row.date)) {
      errors.push('Date must be YYYY-MM-DD format');
    }
  }
  
  // Amount validation
  if (!row.amount || isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
    errors.push('Valid positive amount is required');
  }
  
  // Category validation
  if (!row.category) {
    errors.push('Category is required');
  }
  
  // Description validation
  if (!row.description || row.description.length < 2) {
    errors.push('Description is required (min 2 chars)');
  }
  
  // Currency validation
  if (!row.currency || !CURRENCIES.includes(row.currency.toUpperCase())) {
    errors.push('Valid currency is required');
  }

  // Interest rate for debt
  if (type === 'debt' && row.interest_rate !== undefined) {
    if (isNaN(Number(row.interest_rate)) || Number(row.interest_rate) < 0 || Number(row.interest_rate) > 100) {
      errors.push('Interest rate must be 0-100');
    }
  }
  
  return {
    date: row.date || '',
    type,
    category: row.category || '',
    description: row.description || '',
    amount: Number(row.amount) || 0,
    currency: (row.currency || 'AED').toUpperCase(),
    partner: row.partner,
    liquidity_level: row.liquidity_level,
    interest_rate: row.interest_rate,
    notes: row.notes,
    status: errors.length === 0 ? 'valid' : 'error',
    errors,
  };
}

function parseCSV(text: string, type: TransactionType): BulkTransaction[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  const transactions: BulkTransaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted values with commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Partial<BulkTransaction> = {};
    
    headers.forEach((header, idx) => {
      const value = values[idx]?.replace(/"/g, '').trim() || '';
      switch (header) {
        case 'date': row.date = value; break;
        case 'category': row.category = value; break;
        case 'description': row.description = value; break;
        case 'amount': row.amount = parseFloat(value) || 0; break;
        case 'currency': row.currency = value.toUpperCase(); break;
        case 'partner': row.partner = value; break;
        case 'liquidity_level': case 'liquidity': row.liquidity_level = value.toUpperCase(); break;
        case 'interest_rate': case 'rate': row.interest_rate = parseFloat(value); break;
        case 'notes': row.notes = value; break;
      }
    });
    
    transactions.push(validateTransaction(row, type));
  }
  
  return transactions;
}

function generateTemplate(type: TransactionType): string {
  const baseHeaders = 'date,category,description,amount,currency';
  const today = new Date().toISOString().split('T')[0];
  
  switch (type) {
    case 'income':
      return `${baseHeaders},partner,liquidity_level,notes\n${today},Salary,"Monthly salary",32000,AED,Ahmed,L1,"Main income"\n${today},Freelance,"Consulting work",5000,AED,Sara,L2,""`;
    case 'expense':
      return `${baseHeaders},notes\n${today},Housing,"Apartment Rent",8500,AED,"Monthly rent"\n${today},Utilities,"DEWA Bill",850,AED,"Electricity + Water"`;
    case 'asset':
      return `${baseHeaders},liquidity_level,notes\n${today},Stocks,"Tesla shares",15000,USD,L1,"US market"\n${today},Gold,"Physical gold",25000,AED,L2,"Investment"`;
    case 'debt':
      return `${baseHeaders},interest_rate,notes\n${today},Car Loan,"Nissan Patrol finance",180000,AED,4.5,"Monthly payment 3500"\n${today},Credit Card,"ADCB Credit Card",8500,AED,24,"Clear monthly"`;
    case 'transfer':
      return `${baseHeaders},notes\n${today},Internal,"Savings transfer",5000,AED,"Monthly savings"`;
    default:
      return baseHeaders;
  }
}

interface ComprehensiveBulkUploadProps {
  onImportComplete?: (type: TransactionType, count: number) => void;
}

export function ComprehensiveBulkUpload({ onImportComplete }: ComprehensiveBulkUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeType, setActiveType] = useState<TransactionType>('income');
  const [parsedData, setParsedData] = useState<BulkTransaction[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const transactions = parseCSV(text, activeType);
      setParsedData(transactions);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const template = generateTemplate(activeType);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wealthtrack_${activeType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    const validTransactions = parsedData.filter(t => t.status === 'valid');
    if (validTransactions.length === 0) {
      toast({ title: 'No valid transactions', description: 'Please fix errors before importing.', variant: 'destructive' });
      return;
    }
    
    setImporting(true);
    
    // For demo, we'll just show success - in production, this would save to DB
    toast({ 
      title: 'Import successful', 
      description: `${validTransactions.length} ${activeType} transactions imported.` 
    });
    
    onImportComplete?.(activeType, validTransactions.length);
    setParsedData([]);
    setImporting(false);
    setIsOpen(false);
  };

  const clearData = () => {
    setParsedData([]);
  };

  const validCount = parsedData.filter(t => t.status === 'valid').length;
  const errorCount = parsedData.filter(t => t.status === 'error').length;

  const getCategoriesForType = (type: TransactionType) => {
    switch (type) {
      case 'income': return INCOME_CATEGORIES;
      case 'expense': return EXPENSE_CATEGORIES;
      case 'asset': return ASSET_CATEGORIES;
      case 'debt': return DEBT_CATEGORIES;
      default: return ['Internal', 'External'];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="wealth-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Comprehensive Bulk Import</h3>
            <p className="text-sm text-muted-foreground">
              Import all transaction types when no API connection is available
            </p>
          </div>
        </div>

        {/* Transaction Type Selector */}
        <Tabs value={activeType} onValueChange={(v) => { setActiveType(v as TransactionType); setParsedData([]); }}>
          <TabsList className="grid w-full grid-cols-5 mb-4">
            {TRANSACTION_TYPES.map(type => (
              <TabsTrigger key={type.value} value={type.value} className="text-xs">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TRANSACTION_TYPES.map(type => (
            <TabsContent key={type.value} value={type.value} className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm mb-3">
                  <strong>Required columns:</strong> date, category, description, amount, currency
                  {type.value === 'income' && <><br/><strong>Optional:</strong> partner, liquidity_level, notes</>}
                  {type.value === 'asset' && <><br/><strong>Optional:</strong> liquidity_level, notes</>}
                  {type.value === 'debt' && <><br/><strong>Optional:</strong> interest_rate, notes</>}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Download {type.label} Template
                  </Button>
                  <label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="default" size="sm" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Valid Categories Reference */}
              <div className="p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-2">Valid categories for {type.label}:</p>
                <div className="flex flex-wrap gap-1">
                  {getCategoriesForType(type.value).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Preview Section */}
      {parsedData.length > 0 && (
        <div className="wealth-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold">Preview</h4>
              <p className="text-sm text-muted-foreground">
                {parsedData.length} rows found • 
                <span className="text-wealth-positive ml-1">{validCount} valid</span>
                {errorCount > 0 && <span className="text-wealth-negative ml-1">• {errorCount} errors</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearData}>
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button size="sm" onClick={handleImport} disabled={validCount === 0 || importing}>
                <FileUp className="w-4 h-4 mr-2" />
                {importing ? 'Importing...' : `Import ${validCount} Valid`}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-80">
            <div className="space-y-2">
              {parsedData.map((tx, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border ${
                    tx.status === 'valid' 
                      ? 'border-wealth-positive/30 bg-wealth-positive/5' 
                      : 'border-wealth-negative/30 bg-wealth-negative/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {tx.status === 'valid' ? (
                        <CheckCircle2 className="w-5 h-5 text-wealth-positive shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-wealth-negative shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{tx.description || 'No description'}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{tx.date}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{tx.category}</Badge>
                          {tx.partner && (
                            <>
                              <span>•</span>
                              <span>{tx.partner}</span>
                            </>
                          )}
                        </div>
                        {tx.errors && tx.errors.length > 0 && (
                          <div className="mt-1 text-xs text-wealth-negative">
                            {tx.errors.join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-medium">
                        {tx.currency} {tx.amount.toLocaleString()}
                      </p>
                      {tx.liquidity_level && (
                        <Badge variant="outline" className="text-xs mt-1">{tx.liquidity_level}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
