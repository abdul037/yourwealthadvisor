import { SavingsGoalsDashboard } from '@/components/SavingsGoalsDashboard';

const SavingsGoals = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Savings Goals</h1>
          <p className="text-muted-foreground">
            Track your savings goals and monitor your progress toward financial milestones.
          </p>
        </div>

        {/* Dashboard */}
        <SavingsGoalsDashboard />

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            WealthTrack • Savings Goals Tracker
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SavingsGoals;
