import { useState, useRef } from 'react';
import { Plus, Trash2, Upload, Download, RefreshCw, Palette, Building2, Users, Droplets, FileSpreadsheet, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Category, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, parseCSVData, BulkUploadRow } from '@/lib/categoryData';
import { toast } from '@/hooks/use-toast';
import { BankConnection } from '@/components/BankConnection';
import { ConnectedAccounts } from '@/components/ConnectedAccounts';
import { ImportedTransactions } from '@/components/ImportedTransactions';
import { PartnerManagement } from '@/components/PartnerManagement';
import { LiquiditySettings } from '@/components/LiquiditySettings';
import { ComprehensiveBulkUpload } from '@/components/ComprehensiveBulkUpload';
import { PageHeader } from '@/components/PageHeader';
import { DemoDataSeeder } from '@/components/DemoDataSeeder';
import { ClearDemoData } from '@/components/ClearDemoData';
import { BankAccount, BankTransaction, DEMO_TRANSACTIONS } from '@/lib/mockBankingData';
const AVAILABLE_ICONS = [
  'UtensilsCrossed', 'Car', 'Zap', 'Gamepad2', 'ShoppingBag', 'Heart', 'GraduationCap',
  'CreditCard', 'Home', 'Baby', 'Briefcase', 'Gift', 'Laptop', 'TrendingUp', 'Coins',
  'Store', 'Plane', 'Dumbbell', 'Music', 'Film', 'Book', 'Coffee', 'Smartphone', 'Wifi',
  'MoreHorizontal'
];

const AVAILABLE_COLORS = [
  'hsl(32, 95%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(45, 93%, 50%)', 'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)', 'hsl(0, 84%, 60%)', 'hsl(217, 91%, 60%)', 'hsl(262, 83%, 58%)',
  'hsl(160, 60%, 45%)', 'hsl(320, 70%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)',
  'hsl(173, 80%, 40%)', 'hsl(215, 20%, 55%)'
];

const AdminPortal = () => {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(DEFAULT_INCOME_CATEGORIES);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState<BulkUploadRow[]>([]);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Bank connection state
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  const [importedTransactions, setImportedTransactions] = useState<BankTransaction[]>([]);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'MoreHorizontal',
    color: 'hsl(215, 20%, 55%)',
  });

  const handleBankConnectionSuccess = (accounts: BankAccount[]) => {
    setConnectedAccounts(prev => [...prev, ...accounts]);
    // Import transactions for the connected accounts
    const newTransactions = DEMO_TRANSACTIONS.filter(t => 
      accounts.some(acc => acc.id === t.accountId || acc.id.includes('acc-'))
    );
    setImportedTransactions(prev => [...prev, ...newTransactions]);
  };

  const handleAccountRefresh = (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId 
          ? { ...acc, lastSynced: new Date().toISOString() }
          : acc
      )
    );
  };

  const handleAccountRemove = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
  };

  const handleTransactionsImported = (transactions: BankTransaction[]) => {
    setImportedTransactions(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const newTxns = transactions.filter(t => !existingIds.has(t.id));
      return [...prev, ...newTxns];
    });
  };

  const handleAddCategory = (type: 'income' | 'expense') => {
    const category: Category = {
      id: crypto.randomUUID(),
      name: newCategory.name,
      type,
      icon: newCategory.icon,
      color: newCategory.color,
      isDefault: false,
    };
    
    if (type === 'expense') {
      setExpenseCategories(prev => [...prev, category]);
    } else {
      setIncomeCategories(prev => [...prev, category]);
    }
    
    setNewCategory({ name: '', icon: 'MoreHorizontal', color: 'hsl(215, 20%, 55%)' });
    setAddDialogOpen(false);
    toast({ title: 'Category added', description: `${category.name} has been added to ${type} categories.` });
  };

  const handleDeleteCategory = (id: string, type: 'income' | 'expense') => {
    if (type === 'expense') {
      setExpenseCategories(prev => prev.filter(c => c.id !== id));
    } else {
      setIncomeCategories(prev => prev.filter(c => c.id !== id));
    }
    toast({ title: 'Category deleted', variant: 'destructive' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSVData(text);
      setBulkData(parsed);
      setUploadDialogOpen(true);
    };
    reader.readAsText(file);
  };

  const handleBulkImport = () => {
    // In a real app, this would save to database
    toast({ 
      title: 'Data imported', 
      description: `${bulkData.length} transactions have been imported.` 
    });
    setBulkData([]);
    setUploadDialogOpen(false);
  };

  const handleResetToDefaults = (type: 'income' | 'expense') => {
    if (type === 'expense') {
      setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
    } else {
      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    }
    toast({ title: 'Categories reset', description: `${type} categories have been reset to defaults.` });
  };

  const downloadTemplate = () => {
    const template = 'date,type,category,description,amount,currency\n2025-01-01,expense,Food & Dining,Grocery shopping,500,AED\n2025-01-02,income,Salary,Monthly salary,32000,AED';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tharwanet_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCategoryList = (categories: Category[], type: 'income' | 'expense') => (
    <div className="space-y-2">
      {categories.map(category => (
        <div 
          key={category.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
            </div>
            <div>
              <p className="font-medium text-sm">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                {category.isDefault ? 'Default' : 'Custom'} • {category.icon}
              </p>
            </div>
          </div>
          {!category.isDefault && (
            <Button 
              variant="ghost" 
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              onClick={() => handleDeleteCategory(category.id, type)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Page Header */}
        <PageHeader 
          title="Settings"
          description="Manage categories, bank connections, and customize your experience"
          breadcrumb={[{ label: 'Settings', path: '/admin' }]}
        />
        
        <Tabs defaultValue="partners" className="space-y-4 sm:space-y-6">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap">
            <TabsTrigger value="partners" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Partners</span>
              <span className="sm:hidden">Partners</span>
            </TabsTrigger>
            <TabsTrigger value="liquidity" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Liquidity</span>
              <span className="sm:hidden">Liquid</span>
            </TabsTrigger>
            <TabsTrigger value="banking" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Banking</span>
              <span className="sm:hidden">Bank</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm flex-shrink-0">Categories</TabsTrigger>
            <TabsTrigger value="import" className="text-xs sm:text-sm flex-shrink-0">Import</TabsTrigger>
            <TabsTrigger value="data" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Data</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="partners" className="space-y-6">
            <PartnerManagement />
          </TabsContent>
          
          <TabsContent value="liquidity" className="space-y-6">
            <LiquiditySettings />
          </TabsContent>
          
          <TabsContent value="banking" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Connected Banks */}
              <div className="wealth-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Connected Bank Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your bank for automatic transaction imports
                    </p>
                  </div>
                  <BankConnection 
                    onConnectionSuccess={handleBankConnectionSuccess}
                    connectedAccounts={connectedAccounts}
                  />
                </div>
                <ConnectedAccounts />
              </div>
              
              {/* Imported Transactions */}
              <div className="wealth-card">
                <div className="mb-4">
                  <h3 className="font-semibold">Imported Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    Transactions synced from your connected banks
                  </p>
                </div>
                <ImportedTransactions 
                  transactions={importedTransactions}
                />
              </div>
            </div>
            
            <Alert className="bg-primary/5 border-primary/20">
              <Building2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                <strong>Demo Mode Active:</strong> This is a simulated Open Banking integration. 
                Connect any bank and use any 6-digit OTP to test the flow. Real Lean Technologies 
                integration requires API credentials.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Categories */}
              <div className="wealth-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Expense Categories</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResetToDefaults('expense')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Dialog open={addDialogOpen && categoryType === 'expense'} onOpenChange={(open) => {
                      setAddDialogOpen(open);
                      if (open) setCategoryType('expense');
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Expense Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input 
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                              placeholder="e.g., Pet Supplies"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select 
                              value={newCategory.icon} 
                              onValueChange={(v) => setNewCategory({...newCategory, icon: v})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_ICONS.map(icon => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_COLORS.map((color, index) => (
                                <button
                                  key={index}
                                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                    newCategory.color === color ? 'border-white scale-110' : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setNewCategory({...newCategory, color})}
                                />
                              ))}
                            </div>
                          </div>
                          <Button onClick={() => handleAddCategory('expense')} className="w-full">
                            Add Category
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {renderCategoryList(expenseCategories, 'expense')}
                </div>
              </div>
              
              {/* Income Categories */}
              <div className="wealth-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Income Categories</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleResetToDefaults('income')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Dialog open={addDialogOpen && categoryType === 'income'} onOpenChange={(open) => {
                      setAddDialogOpen(open);
                      if (open) setCategoryType('income');
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Income Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category Name</Label>
                            <Input 
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                              placeholder="e.g., Consulting"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select 
                              value={newCategory.icon} 
                              onValueChange={(v) => setNewCategory({...newCategory, icon: v})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_ICONS.map(icon => (
                                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_COLORS.map((color, index) => (
                                <button
                                  key={index}
                                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                    newCategory.color === color ? 'border-white scale-110' : 'border-transparent'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setNewCategory({...newCategory, color})}
                                />
                              ))}
                            </div>
                          </div>
                          <Button onClick={() => handleAddCategory('income')} className="w-full">
                            Add Category
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {renderCategoryList(incomeCategories, 'income')}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="space-y-6">
            <ComprehensiveBulkUpload />
          </TabsContent>
          
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Load Demo Data */}
              <div className="wealth-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Demo Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Load sample data to explore all features
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  New to Tharwa Net? Load demo data to see how the app works with realistic income, expenses, budgets, assets, and savings goals.
                </p>
                <DemoDataSeeder />
              </div>
              
              {/* Clear All Data */}
              <div className="wealth-card border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Clear All Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Remove all financial data and start fresh
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to add your real finances? Clear all demo data and start tracking your actual income, expenses, and investments.
                </p>
                <ClearDemoData />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Admin Portal
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AdminPortal;
