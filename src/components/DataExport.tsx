import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAssets } from '@/hooks/useAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useBudgets } from '@/hooks/useBudgets';
import { useIncomes } from '@/hooks/useIncomes';
import { useMilestones } from '@/hooks/useMilestones';
import { toast } from '@/hooks/use-toast';

type ExportFormat = 'csv' | 'json';
type DataType = 'assets' | 'transactions' | 'debts' | 'budgets' | 'incomes' | 'milestones';

interface DataExportProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function DataExport({ open: controlledOpen, onOpenChange, triggerButton = true }: DataExportProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedData, setSelectedData] = useState<DataType[]>(['transactions']);
  const [isExporting, setIsExporting] = useState(false);

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const { assets } = useAssets();
  const { transactions } = useTransactions();
  const { debts } = useDebts();
  const { budgets } = useBudgets();
  const { incomes } = useIncomes();
  const { milestones } = useMilestones();

  const dataTypes: { value: DataType; label: string; count: number }[] = [
    { value: 'transactions', label: 'Transactions', count: transactions.length },
    { value: 'assets', label: 'Assets', count: assets.length },
    { value: 'incomes', label: 'Income Sources', count: incomes.length },
    { value: 'debts', label: 'Debts', count: debts.length },
    { value: 'budgets', label: 'Budgets', count: budgets.length },
    { value: 'milestones', label: 'Milestones', count: milestones.length },
  ];

  const toggleDataType = (type: DataType) => {
    setSelectedData(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const convertToCSV = (data: any[], filename: string): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const exportData: Record<string, any[]> = {};

      if (selectedData.includes('transactions')) {
        exportData.transactions = transactions.map(t => ({
          id: t.id,
          date: t.transaction_date,
          type: t.type,
          category: t.category,
          description: t.description,
          amount: t.amount,
          currency: t.currency,
        }));
      }

      if (selectedData.includes('assets')) {
        exportData.assets = assets.map(a => ({
          id: a.id,
          name: a.name,
          category: a.category,
          amount: a.amount,
          currency: a.currency,
          liquidity_level: a.liquidity_level,
        }));
      }

      if (selectedData.includes('incomes')) {
        exportData.incomes = incomes.map(i => ({
          id: i.id,
          source_name: i.source_name,
          source_type: i.source_type,
          amount: i.amount,
          frequency: i.frequency,
          currency: i.currency,
        }));
      }

      if (selectedData.includes('debts')) {
        exportData.debts = debts.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          principal: d.principal,
          current_balance: d.current_balance,
          interest_rate: d.interest_rate,
          minimum_payment: d.minimum_payment,
          currency: d.currency,
        }));
      }

      if (selectedData.includes('budgets')) {
        exportData.budgets = budgets.map(b => ({
          id: b.id,
          category: b.category,
          allocated_amount: b.allocated_amount,
          period: b.period,
          currency: b.currency,
        }));
      }

      if (selectedData.includes('milestones')) {
        exportData.milestones = milestones.map(m => ({
          id: m.id,
          name: m.name,
          target_amount: m.target_amount,
          current_amount: m.current_amount,
          target_date: m.target_date,
          is_achieved: m.is_achieved,
        }));
      }

      if (format === 'json') {
        const jsonContent = JSON.stringify(exportData, null, 2);
        downloadFile(jsonContent, `tharwanet_export_${timestamp}.json`, 'application/json');
      } else {
        // Export each data type as separate CSV files in a combined download
        for (const [key, data] of Object.entries(exportData)) {
          if (data.length > 0) {
            const csvContent = convertToCSV(data, key);
            downloadFile(csvContent, `tharwanet_${key}_${timestamp}.csv`, 'text/csv');
          }
        }
      }

      toast({
        title: 'Export successful',
        description: `Your data has been exported as ${format.toUpperCase()}.`,
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </DialogTitle>
        <DialogDescription>
          Download your financial data in CSV or JSON format.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-6 py-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV (Spreadsheet)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  JSON (Developer)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Selection */}
        <div className="space-y-3">
          <Label>Data to Export</Label>
          <div className="space-y-2">
            {dataTypes.map((type) => (
              <div
                key={type.value}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleDataType(type.value)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedData.includes(type.value)}
                    onCheckedChange={() => toggleDataType(type.value)}
                  />
                  <span className="font-medium">{type.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {type.count} {type.count === 1 ? 'item' : 'items'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button 
          onClick={handleExport} 
          disabled={selectedData.length === 0 || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>Exporting...</>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export {selectedData.length} {selectedData.length === 1 ? 'dataset' : 'datasets'}
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );

  if (triggerButton) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {content}
    </Dialog>
  );
}
