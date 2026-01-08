import { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useIncomes, IncomeSource as DBIncomeSource } from '@/hooks/useIncomes';
import { useExpenses, Transaction } from '@/hooks/useTransactions';
import { useMilestones, Milestone as DBMilestone } from '@/hooks/useMilestones';
import { NetWorthChart } from '@/components/NetWorthChart';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { WealthStats } from '@/components/WealthStats';
import { IncomeSourcesChart } from '@/components/IncomeSourcesChart';
import { PageHeader } from '@/components/PageHeader';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { Leaderboard } from '@/components/Leaderboard';
import { ModuleGate } from '@/components/ModuleGate';
import { generateNetWorthHistory, calculateProjection, Milestone } from '@/lib/categoryData';
import { IncomeSource } from '@/lib/incomeData';

// Adapter to convert DB income to component format
const adaptIncome = (dbIncome: DBIncomeSource): IncomeSource => ({
  id: dbIncome.id,
  partner: 'Partner 1' as IncomeSource['partner'],
  type: (dbIncome.source_type || 'other') as IncomeSource['type'],
  description: dbIncome.source_name,
  amount: dbIncome.amount,
  currency: (dbIncome.currency || 'AED') as IncomeSource['currency'],
  frequency: (dbIncome.frequency || 'monthly') as IncomeSource['frequency'],
  date: dbIncome.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
});

// Adapter to convert DB milestone to component format
const adaptMilestone = (dbMilestone: DBMilestone): Milestone => ({
  id: dbMilestone.id,
  name: dbMilestone.name,
  targetAmount: dbMilestone.target_amount,
  targetDate: dbMilestone.target_date || undefined,
  achieved: dbMilestone.is_achieved || false,
  achievedDate: dbMilestone.achieved_date || undefined,
  currency: 'AED',
});

const Trends = () => {
  const { totalNetWorth, isLoading: assetsLoading } = useAssets();
  const { incomes, totalMonthlyIncome, isLoading: incomesLoading } = useIncomes();
  const { transactions, isLoading: expensesLoading } = useExpenses();
  const { milestones: dbMilestones, isLoading: milestonesLoading, addMilestone, deleteMilestone, toggleAchieved } = useMilestones();
  
  const isLoading = assetsLoading || incomesLoading || expensesLoading || milestonesLoading;
  
  // Convert DB data to component format
  const incomeSources: IncomeSource[] = incomes.map(adaptIncome);
  const milestones: Milestone[] = dbMilestones.map(adaptMilestone);
  
  // Use real net worth or fallback
  const currentNetWorth = totalNetWorth || 0;
  
  // Generate historical data (simulated for now - would need historical snapshots table)
  const history = generateNetWorthHistory(currentNetWorth);
  
  // Calculate monthly expenses from transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.transaction_date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlySavings = (totalMonthlyIncome || 0) - currentMonthExpenses;
  
  // Income sources selection for projections
  const [selectedSources, setSelectedSources] = useState<string[]>(['salary', 'bonus']);
  
  // Calculate projections based on monthly savings
  const projections = calculateProjection(currentNetWorth, monthlySavings, 24, 0.08);
  
  const handleAddMilestone = async (milestone: Omit<Milestone, 'id'>) => {
    await addMilestone.mutateAsync({
      name: milestone.name,
      target_amount: milestone.targetAmount,
      target_date: milestone.targetDate || null,
    });
  };
  
  const handleDeleteMilestone = async (id: string) => {
    await deleteMilestone.mutateAsync(id);
  };
  
  const handleToggleAchieved = async (id: string) => {
    await toggleAchieved.mutateAsync(id);
  };
  
  const handleToggleSource = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };
  
  // Calculate stats
  const previousMonthNetWorth = history[history.length - 2]?.netWorth || currentNetWorth;
  const monthlyChange = previousMonthNetWorth > 0 
    ? ((currentNetWorth - previousMonthNetWorth) / previousMonthNetWorth) * 100 
    : 0;
  const yearAgoNetWorth = history[0]?.netWorth || currentNetWorth;
  const yearlyChange = yearAgoNetWorth > 0 
    ? ((currentNetWorth - yearAgoNetWorth) / yearAgoNetWorth) * 100 
    : 0;
  const projectedNetWorth = projections[11]?.netWorth || currentNetWorth;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          <PageHeader 
            title="Financial Trends"
            description="Visualize your wealth growth and track milestones"
            breadcrumb={[{ label: 'Trends', path: '/trends' }]}
          />
          <DashboardSkeleton variant="full" />
        </main>
      </div>
    );
  }

  return (
    <ModuleGate module="trends">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
        {/* Page Header */}
        <PageHeader 
          title="Financial Trends"
          description="Visualize your wealth growth and track milestones"
          breadcrumb={[{ label: 'Trends', path: '/trends' }]}
        />
        
        {/* Wealth Stats */}
        <div className="mb-6 sm:mb-8">
          <WealthStats 
            currentNetWorth={currentNetWorth}
            monthlyChange={monthlyChange}
            yearlyChange={yearlyChange}
            monthlySavings={monthlySavings}
            projectedNetWorth={projectedNetWorth}
          />
        </div>
        
        {/* Net Worth Chart */}
        <div className="mb-6 sm:mb-8">
          <NetWorthChart 
            history={history}
            projections={projections}
            milestones={milestones}
          />
        </div>
        
        {/* Milestones & Income Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MilestoneTracker 
            milestones={milestones}
            currentNetWorth={currentNetWorth}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onToggleAchieved={handleToggleAchieved}
          />
          <IncomeSourcesChart 
            incomeSources={incomeSources}
            selectedSources={selectedSources}
            onToggleSource={handleToggleSource}
          />
        </div>
        
        {/* Community Leaderboard */}
        <div className="mb-6 sm:mb-8">
          <Leaderboard />
        </div>
        
          {/* Footer */}
          <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Tharwa Net • Net Worth Trends & Projections
            </p>
          </footer>
        </main>
      </div>
    </ModuleGate>
  );
};

export default Trends;
