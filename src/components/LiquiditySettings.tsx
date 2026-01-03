import { useState, useEffect } from 'react';
import { Droplets, Save, RotateCcw, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LIQUIDITY_LABELS } from '@/lib/portfolioData';

interface LiquiditySetting {
  id: string;
  category_name: string;
  category_type: 'income' | 'expense' | 'asset';
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
  liquidity_percentage: number;
  notes: string | null;
}

const LIQUIDITY_LEVELS: Array<'L1' | 'L2' | 'L3' | 'NL'> = ['L1', 'L2', 'L3', 'NL'];

const LIQUIDITY_COLORS: Record<string, string> = {
  'L1': 'bg-wealth-positive text-wealth-positive',
  'L2': 'bg-chart-2 text-chart-2',
  'L3': 'bg-accent text-accent',
  'NL': 'bg-muted-foreground text-muted-foreground',
};

const LIQUIDITY_BG: Record<string, string> = {
  'L1': 'bg-wealth-positive/20 border-wealth-positive/30',
  'L2': 'bg-chart-2/20 border-chart-2/30',
  'L3': 'bg-accent/20 border-accent/30',
  'NL': 'bg-muted-foreground/20 border-muted-foreground/30',
};

export function LiquiditySettings() {
  const [settings, setSettings] = useState<LiquiditySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('category_liquidity_settings')
      .select('*')
      .order('category_type')
      .order('category_name');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      setSettings(data as LiquiditySetting[]);
    }
    setLoading(false);
  };

  const handleUpdateSetting = (id: string, field: keyof LiquiditySetting, value: any) => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    
    for (const setting of settings) {
      const { error } = await supabase
        .from('category_liquidity_settings')
        .update({
          liquidity_level: setting.liquidity_level,
          liquidity_percentage: setting.liquidity_percentage,
        })
        .eq('id', setting.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
    }
    
    setSaving(false);
    setHasChanges(false);
    toast({ title: 'Settings saved', description: 'Liquidity settings have been updated.' });
  };

  const handleReset = () => {
    fetchSettings();
    setHasChanges(false);
  };

  const incomeSettings = settings.filter(s => s.category_type === 'income');
  const assetSettings = settings.filter(s => s.category_type === 'asset');

  const renderSettingsTable = (items: LiquiditySetting[]) => (
    <div className="space-y-3">
      {items.map(setting => (
        <div 
          key={setting.id} 
          className={`p-4 rounded-lg border ${LIQUIDITY_BG[setting.liquidity_level]} transition-all`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${LIQUIDITY_COLORS[setting.liquidity_level].split(' ')[0]}`} />
              <span className="font-medium">{setting.category_name}</span>
            </div>
            <Badge variant="outline" className={LIQUIDITY_BG[setting.liquidity_level]}>
              {setting.liquidity_level}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Liquidity Level</label>
              <Select
                value={setting.liquidity_level}
                onValueChange={(v) => handleUpdateSetting(setting.id, 'liquidity_level', v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIQUIDITY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${LIQUIDITY_COLORS[level].split(' ')[0]}`} />
                        <span>{level}</span>
                        <span className="text-muted-foreground text-xs">- {LIQUIDITY_LABELS[level]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Accessible %</label>
                <span className="text-sm font-mono font-medium">{setting.liquidity_percentage}%</span>
              </div>
              <Slider
                value={[setting.liquidity_percentage]}
                onValueChange={([v]) => handleUpdateSetting(setting.id, 'liquidity_percentage', v)}
                max={100}
                min={0}
                step={5}
                className="py-2"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold">Liquidity Level Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure how quickly each category can be converted to cash
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
            <Button size="sm" onClick={handleSaveAll} disabled={saving || !hasChanges}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2 p-4 rounded-lg bg-muted/30 mb-6">
          {LIQUIDITY_LEVELS.map(level => (
            <div key={level} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${LIQUIDITY_COLORS[level].split(' ')[0]}`} />
              <div>
                <p className="text-sm font-medium">{level}</p>
                <p className="text-xs text-muted-foreground">{LIQUIDITY_LABELS[level]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList>
          <TabsTrigger value="income" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Income Categories ({incomeSettings.length})
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Wallet className="w-4 h-4" />
            Asset Categories ({assetSettings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="wealth-card">
            <h4 className="font-medium mb-4">Income Liquidity Settings</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Set how accessible each income type is. Higher percentage means more of the income is immediately available.
            </p>
            {renderSettingsTable(incomeSettings)}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <div className="wealth-card">
            <h4 className="font-medium mb-4">Asset Liquidity Settings</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Define how quickly each asset type can be converted to cash. Land and real estate are typically non-liquid.
            </p>
            {renderSettingsTable(assetSettings)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
