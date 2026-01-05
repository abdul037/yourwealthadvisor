import { SavingsGoalsDashboard } from '@/components/SavingsGoalsDashboard';
import { PageHeader } from '@/components/PageHeader';

const SavingsGoals = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Page Header */}
        <PageHeader 
          title="Savings Goals"
          description="Track your savings goals and monitor your progress toward financial milestones"
          breadcrumb={[{ label: 'Savings Goals', path: '/savings-goals' }]}
        />

        {/* Dashboard */}
        <SavingsGoalsDashboard />

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Tharwa Net • Savings Goals Tracker
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SavingsGoals;
