import { useState, useEffect } from 'react';
import { Droplets, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { LIQUIDITY_LABELS } from '@/lib/portfolioData';
import { useFormattedCurrency } from '@/components/FormattedCurrency';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface IncomeSource {
  id: string;
  partner_id: string;
  source_name: string;
  source_type: string;
  amount: number;
  currency: string;
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
}

interface Partner {
  id: string;
  name: string;
}

interface LiquiditySetting {
  category_name: string;
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
  liquidity_percentage: number;
}

const LIQUIDITY_COLORS: Record<string, string> = {
  'L1': 'hsl(142, 71%, 45%)',
  'L2': 'hsl(217, 91%, 60%)',
  'L3': 'hsl(38, 92%, 50%)',
  'NL': 'hsl(215, 20%, 55%)',
};

const USD_TO_AED = 3.67;

export function IncomeLiquidityChart() {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [liquiditySettings, setLiquiditySettings] = useState<LiquiditySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatAmount } = useFormattedCurrency();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [incomeRes, partnersRes, settingsRes] = await Promise.all([
      supabase.from('income_sources').select('*').eq('is_active', true),
      supabase.from('partners').select('id, name').eq('is_active', true),
      supabase.from('category_liquidity_settings').select('category_name, liquidity_level, liquidity_percentage').eq('category_type', 'income'),
    ]);

    if (incomeRes.data) setIncomeSources(incomeRes.data as IncomeSource[]);
    if (partnersRes.data) setPartners(partnersRes.data);
    if (settingsRes.data) setLiquiditySettings(settingsRes.data as LiquiditySetting[]);
    setLoading(false);
  };

  // Calculate totals by liquidity level
  const calculateLiquidityTotals = () => {
    const totals: Record<string, number> = { L1: 0, L2: 0, L3: 0, NL: 0 };
    
    incomeSources.forEach(source => {
      const amountAED = source.currency === 'USD' ? source.amount * USD_TO_AED : source.amount;
      totals[source.liquidity_level] += amountAED;
    });
    
    return totals;
  };

  // Calculate effective liquid income based on percentages
  const calculateEffectiveLiquidity = () => {
    let totalIncome = 0;
    let liquidIncome = 0;
    
    incomeSources.forEach(source => {
      const amountAED = source.currency === 'USD' ? source.amount * USD_TO_AED : source.amount;
      totalIncome += amountAED;
      
      const setting = liquiditySettings.find(s => s.category_name === source.source_type);
      const percentage = setting?.liquidity_percentage ?? 80;
      
      liquidIncome += amountAED * (percentage / 100);
    });
    
    return { totalIncome, liquidIncome, percentage: totalIncome > 0 ? (liquidIncome / totalIncome) * 100 : 0 };
  };

  const liquidityTotals = calculateLiquidityTotals();
  const effectiveLiquidity = calculateEffectiveLiquidity();
  const totalIncome = Object.values(liquidityTotals).reduce((sum, val) => sum + val, 0);

  // Pie chart data
  const pieData = Object.entries(liquidityTotals)
    .filter(([_, value]) => value > 0)
    .map(([level, value]) => ({
      name: level,
      value,
      label: LIQUIDITY_LABELS[level as keyof typeof LIQUIDITY_LABELS],
      percentage: ((value / totalIncome) * 100).toFixed(1),
    }));

  // Partner breakdown
  const partnerBreakdown = partners.map(partner => {
    const partnerIncome = incomeSources.filter(s => s.partner_id === partner.id);
    const breakdown: Record<string, number> = { L1: 0, L2: 0, L3: 0, NL: 0 };
    
    partnerIncome.forEach(source => {
      const amountAED = source.currency === 'USD' ? source.amount * USD_TO_AED : source.amount;
      breakdown[source.liquidity_level] += amountAED;
    });
    
    return {
      name: partner.name.split(' ')[0],
      ...breakdown,
      total: Object.values(breakdown).reduce((sum, val) => sum + val, 0),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name} - {data.label}</p>
          <p className="text-sm font-mono">{formatAmount(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.percentage}% of income</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="wealth-card animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  if (incomeSources.length === 0) {
    return (
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold">Income Liquidity</h3>
              <p className="text-sm text-muted-foreground">No income sources configured</p>
            </div>
          </div>
          <Link to="/income">
            <Button variant="outline" size="sm" className="gap-1">
              Add Income <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <p className="text-center text-muted-foreground py-8">
          Add income sources in Admin Portal to see liquidity analysis
        </p>
      </div>
    );
  }

  return (
    <div className="wealth-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-chart-2" />
          </div>
          <div>
            <h3 className="font-semibold">Income Liquidity Analysis</h3>
            <p className="text-sm text-muted-foreground">How accessible is your household income</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Effective Liquidity</p>
            <p className="text-2xl font-bold font-mono text-primary">
              {effectiveLiquidity.percentage.toFixed(1)}%
            </p>
          </div>
          <Link to="/income">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={LIQUIDITY_COLORS[entry.name]} 
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: LIQUIDITY_COLORS[item.name] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{item.name} - {item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-wealth-positive/10 border border-wealth-positive/20">
              <div className="flex items-center gap-1 mb-1">
                <CheckCircle2 className="w-3 h-3 text-wealth-positive" />
                <span className="text-xs text-muted-foreground">Instantly Available</span>
              </div>
              <p className="text-sm font-bold font-mono">{formatAmount(liquidityTotals.L1)}</p>
            </div>
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="w-3 h-3 text-accent" />
                <span className="text-xs text-muted-foreground">Delayed Access</span>
              </div>
              <p className="text-sm font-bold font-mono">
                {formatAmount(liquidityTotals.L3 + liquidityTotals.NL)}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">Total Monthly</span>
              <span className="text-xs font-mono">{formatAmount(effectiveLiquidity.totalIncome)}</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">Effective Liquid</span>
              <span className="text-xs font-mono text-primary">{formatAmount(effectiveLiquidity.liquidIncome)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${effectiveLiquidity.percentage}%` }}
              />
            </div>
          </div>

          {partnerBreakdown.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">By Partner</p>
              {partnerBreakdown.map(partner => (
                <div key={partner.name} className="flex items-center gap-2">
                  <span className="text-xs w-14 truncate">{partner.name}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden flex bg-muted">
                    {(['L1', 'L2', 'L3', 'NL'] as const).map(level => {
                      const width = partner.total > 0 ? (partner[level] / partner.total) * 100 : 0;
                      if (width === 0) return null;
                      return (
                        <div 
                          key={level}
                          className="h-full"
                          style={{ width: `${width}%`, backgroundColor: LIQUIDITY_COLORS[level] }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono w-16 text-right">{formatAmount(partner.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
