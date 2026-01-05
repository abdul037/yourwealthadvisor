import { useState } from 'react';
import { NetWorthChart } from '@/components/NetWorthChart';
import { MilestoneTracker } from '@/components/MilestoneTracker';
import { WealthStats } from '@/components/WealthStats';
import { IncomeSourcesChart } from '@/components/IncomeSourcesChart';
import { PageHeader } from '@/components/PageHeader';
import { generateNetWorthHistory, calculateProjection, sampleMilestones, Milestone } from '@/lib/categoryData';
import { sampleIncomeSources, getMonthlyIncomeData } from '@/lib/incomeData';
import { sampleExpenses, getMonthlySpending } from '@/lib/expenseData';
import { initialPortfolio } from '@/lib/portfolioData';

const Trends = () => {
  // Calculate current net worth from portfolio
  const currentNetWorth = initialPortfolio.reduce((sum, asset) => sum + asset.aedValue, 0);
  
  // Generate historical data
  const history = generateNetWorthHistory(currentNetWorth);
  
  // Calculate monthly savings
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyIncomeData = getMonthlyIncomeData(sampleIncomeSources);
  const currentMonthIncome = monthlyIncomeData[monthlyIncomeData.length - 1]?.total || 0;
  const currentMonthExpenses = getMonthlySpending(sampleExpenses, currentMonth, currentYear);
  const monthlySavings = currentMonthIncome - currentMonthExpenses;
  
  // Income sources selection for projections
  const [selectedSources, setSelectedSources] = useState<string[]>(['Salary', 'Bonus']);
  
  // Calculate projections based on selected income sources
  const projections = calculateProjection(currentNetWorth, monthlySavings, 24, 0.08);
  
  // Milestones state
  const [milestones, setMilestones] = useState<Milestone[]>(sampleMilestones);
  
  const handleAddMilestone = (milestone: Omit<Milestone, 'id'>) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: crypto.randomUUID(),
    };
    setMilestones(prev => [...prev, newMilestone]);
  };
  
  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };
  
  const handleToggleAchieved = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id 
        ? { ...m, achieved: !m.achieved, achievedDate: !m.achieved ? new Date().toISOString().split('T')[0] : undefined }
        : m
    ));
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
  const monthlyChange = ((currentNetWorth - previousMonthNetWorth) / previousMonthNetWorth) * 100;
  const yearAgoNetWorth = history[0]?.netWorth || currentNetWorth;
  const yearlyChange = ((currentNetWorth - yearAgoNetWorth) / yearAgoNetWorth) * 100;
  const projectedNetWorth = projections[11]?.netWorth || currentNetWorth;

  return (
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
            incomeSources={sampleIncomeSources}
            selectedSources={selectedSources}
            onToggleSource={handleToggleSource}
          />
        </div>
        
        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Net Worth Trends & Projections
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Trends;
