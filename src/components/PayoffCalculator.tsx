import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, TrendingDown, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Debt, calculatePayoffProjection, calculateTotalInterest, getMonthsToPayoff, getPayoffDate } from '@/lib/debtData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';

interface PayoffCalculatorProps {
  debt: Debt | null;
  onClose: () => void;
}

export function PayoffCalculator({ debt, onClose }: PayoffCalculatorProps) {
  const { formatAmount, symbol } = useFormattedCurrency();
  const [extraPayment, setExtraPayment] = useState(0);
  
  if (!debt) {
    return (
      <div className="wealth-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Payoff Calculator</h3>
            <p className="text-sm text-muted-foreground">Select a debt to view projections</p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Click "View Payoff Plan" on any debt to see projections</p>
        </div>
      </div>
    );
  }
  
  const currentProjection = calculatePayoffProjection(debt, 0);
  const extraProjection = calculatePayoffProjection(debt, extraPayment);
  
  const currentInterest = calculateTotalInterest(currentProjection);
  const extraInterest = calculateTotalInterest(extraProjection);
  const interestSaved = currentInterest - extraInterest;
  
  const currentMonths = getMonthsToPayoff(currentProjection);
  const extraMonths = getMonthsToPayoff(extraProjection);
  const monthsSaved = currentMonths - extraMonths;
  
  const currentPayoffDate = getPayoffDate(currentProjection);
  const extraPayoffDate = getPayoffDate(extraProjection);
  
  // Prepare chart data (show first 48 months or until paid off)
  const chartData = extraProjection.slice(0, Math.min(48, extraProjection.length)).map((proj, index) => ({
    month: proj.month,
    label: new Date(proj.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    balance: proj.balance,
    currentBalance: currentProjection[index]?.balance || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">Month {label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">
                  {entry.dataKey === 'balance' ? 'With Extra' : 'Current'}
                </span>
              </div>
              <span className="font-mono">{formatAmount(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{debt.name}</h3>
            <p className="text-sm text-muted-foreground">Payoff Calculator</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      {/* Extra Payment Slider */}
      <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium">Extra Monthly Payment</span>
          </div>
          <span className="font-mono font-bold text-primary">
            +{formatAmount(extraPayment)}
          </span>
        </div>
        <Slider
          value={[extraPayment]}
          min={0}
          max={5000}
          step={100}
          onValueChange={(value) => setExtraPayment(value[0])}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{symbol}0</span>
          <span>{symbol}5,000</span>
        </div>
      </div>
      
      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Plan</p>
          <p className="font-mono text-lg">{currentMonths} months</p>
          <p className="text-sm text-muted-foreground">
            Payoff: {currentPayoffDate ? new Date(currentPayoffDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
          </p>
          <p className="text-sm text-destructive mt-2">
            Interest: {formatAmount(currentInterest)}
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${extraPayment > 0 ? 'bg-wealth-positive/10 border border-wealth-positive/30' : 'bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">With Extra Payment</p>
          <p className="font-mono text-lg">{extraMonths} months</p>
          <p className="text-sm text-muted-foreground">
            Payoff: {extraPayoffDate ? new Date(extraPayoffDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
          </p>
          <p className="text-sm text-wealth-positive mt-2">
            Interest: {formatAmount(extraInterest)}
          </p>
        </div>
      </div>
      
      {/* Savings Summary */}
      {extraPayment > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-wealth-positive/10 border border-wealth-positive/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Time Saved</p>
            <p className="font-bold text-wealth-positive">{monthsSaved} months</p>
          </div>
          <div className="p-3 rounded-lg bg-wealth-positive/10 border border-wealth-positive/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Interest Saved</p>
            <p className="font-bold text-wealth-positive">{formatAmount(interestSaved)}</p>
          </div>
        </div>
      )}
      
      {/* Balance Chart */}
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            {extraPayment > 0 && (
              <Line 
                type="monotone" 
                dataKey="currentBalance" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#balanceGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
