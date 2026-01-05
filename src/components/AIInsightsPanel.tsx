import { useState } from 'react';
import { 
  Lightbulb, AlertTriangle, CheckCircle, Info, 
  TrendingUp, Loader2, RefreshCw, Sparkles,
  PiggyBank, CreditCard, Target, Wallet, ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIncomes } from '@/hooks/useIncomes';
import { useExpenses } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useDebts } from '@/hooks/useDebts';
import { useAssets } from '@/hooks/useAssets';

interface Insight {
  type: 'warning' | 'success' | 'tip' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'spending' | 'saving' | 'budget' | 'debt' | 'investment' | 'lifestyle';
}

interface InsightsResponse {
  insights: Insight[];
  summary: string;
  savingsOpportunity: string;
  generatedAt: string;
  dataSnapshot: {
    income: number;
    expenses: number;
    savingsRate: number;
  };
}

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  warning: <AlertTriangle className="w-4 h-4" />,
  success: <CheckCircle className="w-4 h-4" />,
  tip: <Lightbulb className="w-4 h-4" />,
  alert: <Info className="w-4 h-4" />,
};

const INSIGHT_COLORS: Record<string, string> = {
  warning: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
  success: 'bg-wealth-positive/20 text-wealth-positive border-wealth-positive/30',
  tip: 'bg-primary/20 text-primary border-primary/30',
  alert: 'bg-destructive/20 text-destructive border-destructive/30',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  spending: <ShoppingBag className="w-3 h-3" />,
  saving: <PiggyBank className="w-3 h-3" />,
  budget: <Wallet className="w-3 h-3" />,
  debt: <CreditCard className="w-3 h-3" />,
  investment: <TrendingUp className="w-3 h-3" />,
  lifestyle: <Target className="w-3 h-3" />,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-destructive text-destructive-foreground',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Use real data from hooks
  const { totalMonthlyIncome } = useIncomes();
  const { transactions: expenses } = useExpenses();
  const { budgets } = useBudgets();
  const { debts } = useDebts();
  const { assets } = useAssets();

  const generateInsights = async () => {
    setIsLoading(true);
    setProgress(10);

    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Use real income data
      const totalIncome = totalMonthlyIncome || 0;
      
      setProgress(30);
      
      // Calculate expenses by category from real data
      const expensesByCategory: Record<string, number> = {};
      const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.transaction_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      
      currentMonthExpenses.forEach(e => {
        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
      });
      
      const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
      
      setProgress(50);
      
      // Get top spending categories
      const topSpendingCategories = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cat]) => cat);
      
      // Calculate budget utilization from real budgets
      const budgetUtilization: Record<string, number> = {};
      budgets.forEach(b => {
        const spent = expensesByCategory[b.category] || 0;
        budgetUtilization[b.category] = b.allocated_amount > 0 ? (spent / b.allocated_amount) * 100 : 0;
      });
      
      // Calculate real net worth from assets
      const netWorth = assets.reduce((sum, a) => sum + a.amount, 0);
      
      // Calculate real debt total
      const debtTotal = debts.reduce((sum, d) => sum + d.current_balance, 0);
      
      setProgress(70);
      
      const financialData = {
        totalIncome,
        totalExpenses,
        expensesByCategory,
        savingsRate,
        topSpendingCategories,
        monthOverMonthChange: 0,
        budgetUtilization,
        upcomingBills: 0,
        netWorth,
        debtTotal,
      };

      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: { financialData },
      });

      setProgress(90);

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setInsights(data as InsightsResponse);
      setProgress(100);
      
      toast({
        title: 'Insights Generated',
        description: `${data.insights?.length || 0} personalized insights ready`,
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Financial Insights
              </CardTitle>
              <CardDescription className="mt-1">
                Get personalized recommendations based on your spending patterns and financial goals
              </CardDescription>
            </div>
            <Button 
              onClick={generateInsights} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {isLoading && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analyzing your finances...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {insights && (
        <>
          {/* Summary */}
          <Card className="border-accent/50 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="font-medium mb-1">Financial Health Summary</p>
                  <p className="text-sm text-muted-foreground">{insights.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Income: </span>
                      <span className="font-mono font-medium text-wealth-positive">
                        AED {insights.dataSnapshot.income.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expenses: </span>
                      <span className="font-mono font-medium text-wealth-negative">
                        AED {insights.dataSnapshot.expenses.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings Rate: </span>
                      <span className={`font-mono font-medium ${insights.dataSnapshot.savingsRate >= 20 ? 'text-wealth-positive' : 'text-accent'}`}>
                        {insights.dataSnapshot.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                {insights.savingsOpportunity && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Potential Savings</p>
                    <p className="text-lg font-bold text-wealth-positive font-mono">
                      +AED {parseInt(insights.savingsOpportunity).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">per month</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Insights Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {insights.insights.map((insight, index) => (
              <Card 
                key={index} 
                className={`border ${INSIGHT_COLORS[insight.type]}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${INSIGHT_COLORS[insight.type]}`}>
                      {INSIGHT_ICONS[insight.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{insight.title}</h4>
                        <Badge className={`text-xs ${PRIORITY_COLORS[insight.priority]}`}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {CATEGORY_ICONS[insight.category]}
                        <span className="capitalize">{insight.category}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground text-center">
            Insights generated on {new Date(insights.generatedAt).toLocaleString()}
          </p>
        </>
      )}

      {/* Empty State */}
      {!insights && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No insights generated yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Generate Insights" to get AI-powered analysis of your finances
            </p>
            <Button onClick={generateInsights} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
