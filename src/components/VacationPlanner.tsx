import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plane, 
  Hotel, 
  Utensils, 
  Camera, 
  Car, 
  Plus, 
  Trash2, 
  Calendar,
  PiggyBank,
  MapPin,
  Target,
  TrendingUp
} from 'lucide-react';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { format, differenceInDays, differenceInMonths } from 'date-fns';

interface VacationExpense {
  id: string;
  category: 'flights' | 'accommodation' | 'food' | 'activities' | 'transport' | 'other';
  description: string;
  estimatedCost: number;
}

interface Vacation {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  targetBudget: number;
  savedAmount: number;
  monthlySavings: number;
  expenses: VacationExpense[];
}

const categoryIcons = {
  flights: Plane,
  accommodation: Hotel,
  food: Utensils,
  activities: Camera,
  transport: Car,
  other: MapPin,
};

const categoryColors = {
  flights: 'bg-blue-500/20 text-blue-400',
  accommodation: 'bg-purple-500/20 text-purple-400',
  food: 'bg-orange-500/20 text-orange-400',
  activities: 'bg-green-500/20 text-green-400',
  transport: 'bg-yellow-500/20 text-yellow-400',
  other: 'bg-gray-500/20 text-gray-400',
};

const sampleVacations: Vacation[] = [
  {
    id: '1',
    destination: 'Maldives Family Getaway',
    startDate: '2025-06-15',
    endDate: '2025-06-22',
    targetBudget: 25000,
    savedAmount: 12500,
    monthlySavings: 2500,
    expenses: [
      { id: '1', category: 'flights', description: 'Emirates Return Flights (4 pax)', estimatedCost: 8000 },
      { id: '2', category: 'accommodation', description: 'Resort Villa (7 nights)', estimatedCost: 12000 },
      { id: '3', category: 'food', description: 'Meals & Dining', estimatedCost: 2500 },
      { id: '4', category: 'activities', description: 'Snorkeling, Spa, Tours', estimatedCost: 1500 },
      { id: '5', category: 'transport', description: 'Speedboat Transfers', estimatedCost: 1000 },
    ],
  },
  {
    id: '2',
    destination: 'Europe Summer Trip',
    startDate: '2025-08-01',
    endDate: '2025-08-15',
    targetBudget: 45000,
    savedAmount: 15000,
    monthlySavings: 4000,
    expenses: [
      { id: '1', category: 'flights', description: 'Flights to Paris (4 pax)', estimatedCost: 12000 },
      { id: '2', category: 'accommodation', description: 'Hotels (14 nights)', estimatedCost: 18000 },
      { id: '3', category: 'food', description: 'Meals & Dining', estimatedCost: 6000 },
      { id: '4', category: 'activities', description: 'Museums, Tours, Shows', estimatedCost: 5000 },
      { id: '5', category: 'transport', description: 'Train Passes & Transfers', estimatedCost: 4000 },
    ],
  },
];

export function VacationPlanner() {
  const { formatAmount } = useFormattedCurrency();
  const [vacations, setVacations] = useState<Vacation[]>(sampleVacations);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVacation, setNewVacation] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    targetBudget: 0,
    monthlySavings: 0,
  });
  const [newExpense, setNewExpense] = useState({
    vacationId: '',
    category: 'other' as VacationExpense['category'],
    description: '',
    estimatedCost: 0,
  });

  const handleAddVacation = () => {
    if (!newVacation.destination || !newVacation.startDate || !newVacation.targetBudget) return;
    
    const vacation: Vacation = {
      id: crypto.randomUUID(),
      ...newVacation,
      savedAmount: 0,
      expenses: [],
    };
    
    setVacations(prev => [...prev, vacation]);
    setNewVacation({ destination: '', startDate: '', endDate: '', targetBudget: 0, monthlySavings: 0 });
    setShowAddForm(false);
  };

  const handleAddExpense = (vacationId: string) => {
    if (!newExpense.description || !newExpense.estimatedCost) return;
    
    const expense: VacationExpense = {
      id: crypto.randomUUID(),
      category: newExpense.category,
      description: newExpense.description,
      estimatedCost: newExpense.estimatedCost,
    };
    
    setVacations(prev => prev.map(v => 
      v.id === vacationId 
        ? { ...v, expenses: [...v.expenses, expense] }
        : v
    ));
    setNewExpense({ vacationId: '', category: 'other', description: '', estimatedCost: 0 });
  };

  const handleDeleteVacation = (id: string) => {
    setVacations(prev => prev.filter(v => v.id !== id));
  };

  const handleDeleteExpense = (vacationId: string, expenseId: string) => {
    setVacations(prev => prev.map(v => 
      v.id === vacationId 
        ? { ...v, expenses: v.expenses.filter(e => e.id !== expenseId) }
        : v
    ));
  };

  const getTotalExpenses = (expenses: VacationExpense[]) => 
    expenses.reduce((sum, e) => sum + e.estimatedCost, 0);

  const getProgress = (saved: number, target: number) => 
    Math.min((saved / target) * 100, 100);

  const getMonthsToGoal = (vacation: Vacation) => {
    const remaining = vacation.targetBudget - vacation.savedAmount;
    if (remaining <= 0 || vacation.monthlySavings <= 0) return 0;
    return Math.ceil(remaining / vacation.monthlySavings);
  };

  const getDaysUntilTrip = (startDate: string) => {
    const days = differenceInDays(new Date(startDate), new Date());
    return days > 0 ? days : 0;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Vacation Planner</CardTitle>
              <CardDescription>Plan trips, track savings & manage expenses</CardDescription>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)} 
            size="sm"
            variant={showAddForm ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-1" />
            {showAddForm ? 'Cancel' : 'Add Trip'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Vacation Form */}
        {showAddForm && (
          <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              New Vacation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., Maldives Family Trip"
                  value={newVacation.destination}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="targetBudget">Target Budget</Label>
                <Input
                  id="targetBudget"
                  type="number"
                  placeholder="25000"
                  value={newVacation.targetBudget || ''}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, targetBudget: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newVacation.startDate}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newVacation.endDate}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="monthlySavings">Monthly Savings</Label>
                <Input
                  id="monthlySavings"
                  type="number"
                  placeholder="2500"
                  value={newVacation.monthlySavings || ''}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, monthlySavings: Number(e.target.value) }))}
                />
              </div>
            </div>
            <Button onClick={handleAddVacation} className="w-full sm:w-auto">
              Create Vacation Plan
            </Button>
          </div>
        )}

        {/* Vacation List */}
        <Tabs defaultValue={vacations[0]?.id || 'empty'} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {vacations.map(vacation => (
              <TabsTrigger 
                key={vacation.id} 
                value={vacation.id}
                className="flex-1 min-w-[120px] text-xs sm:text-sm"
              >
                {vacation.destination.split(' ').slice(0, 2).join(' ')}
              </TabsTrigger>
            ))}
          </TabsList>

          {vacations.map(vacation => {
            const totalExpenses = getTotalExpenses(vacation.expenses);
            const progress = getProgress(vacation.savedAmount, vacation.targetBudget);
            const monthsToGoal = getMonthsToGoal(vacation);
            const daysUntil = getDaysUntilTrip(vacation.startDate);
            const budgetDiff = vacation.targetBudget - totalExpenses;

            return (
              <TabsContent key={vacation.id} value={vacation.id} className="mt-4 space-y-4">
                {/* Trip Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Calendar className="w-3 h-3" />
                      Days Until
                    </div>
                    <p className="text-lg font-bold">{daysUntil}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <Target className="w-3 h-3" />
                      Target
                    </div>
                    <p className="text-lg font-bold">{formatAmount(vacation.targetBudget)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <PiggyBank className="w-3 h-3" />
                      Saved
                    </div>
                    <p className="text-lg font-bold text-primary">{formatAmount(vacation.savedAmount)}</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <TrendingUp className="w-3 h-3" />
                      {monthsToGoal > 0 ? 'Months Left' : 'Goal Met!'}
                    </div>
                    <p className="text-lg font-bold">{monthsToGoal > 0 ? monthsToGoal : '✓'}</p>
                  </div>
                </div>

                {/* Savings Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Savings Progress</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {formatAmount(vacation.targetBudget - vacation.savedAmount)} remaining • 
                    {vacation.monthlySavings > 0 && ` Saving ${formatAmount(vacation.monthlySavings)}/month`}
                  </p>
                </div>

                {/* Expense Breakdown */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Expense Breakdown</h4>
                    <Badge variant={budgetDiff >= 0 ? 'default' : 'destructive'} className="text-xs">
                      {budgetDiff >= 0 ? `${formatAmount(budgetDiff)} under budget` : `${formatAmount(Math.abs(budgetDiff))} over budget`}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {vacation.expenses.map(expense => {
                      const Icon = categoryIcons[expense.category];
                      return (
                        <div 
                          key={expense.id} 
                          className="flex items-center justify-between p-2 bg-muted/20 rounded-lg group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[expense.category]}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{expense.description}</p>
                              <p className="text-xs text-muted-foreground capitalize">{expense.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatAmount(expense.estimatedCost)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteExpense(vacation.id, expense.id)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="font-medium">Total Estimated</span>
                    <span className="font-bold text-lg">{formatAmount(totalExpenses)}</span>
                  </div>
                </div>

                {/* Add Expense Form */}
                <div className="p-3 bg-muted/20 rounded-lg space-y-3">
                  <h5 className="text-sm font-medium">Add Expense</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <select
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense(prev => ({ 
                        ...prev, 
                        category: e.target.value as VacationExpense['category'] 
                      }))}
                    >
                      <option value="flights">Flights</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="food">Food & Dining</option>
                      <option value="activities">Activities</option>
                      <option value="transport">Transport</option>
                      <option value="other">Other</option>
                    </select>
                    <Input
                      placeholder="Description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      className="sm:col-span-2"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Cost"
                        value={newExpense.estimatedCost || ''}
                        onChange={(e) => setNewExpense(prev => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                      />
                      <Button 
                        size="icon" 
                        onClick={() => handleAddExpense(vacation.id)}
                        disabled={!newExpense.description || !newExpense.estimatedCost}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Delete Trip Button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteVacation(vacation.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Trip
                  </Button>
                </div>
              </TabsContent>
            );
          })}

          {vacations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No vacation plans yet</p>
              <p className="text-sm">Click "Add Trip" to start planning!</p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
