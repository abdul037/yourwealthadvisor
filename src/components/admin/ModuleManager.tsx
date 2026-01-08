import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppModules, AppModule } from '@/hooks/useAppModules';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, DollarSign, Receipt, Wallet, TrendingDown, 
  Target, LineChart, Users, Split, Handshake, Sparkles, Crown, 
  Shield, Download, Headphones, Box
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Wallet,
  TrendingDown,
  Target,
  LineChart,
  Users,
  Split,
  Handshake,
  Sparkles,
  Crown,
  Shield,
  Download,
  Headphones,
  Box,
};

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Features',
  analytics: 'Analytics',
  social: 'Social',
  monetization: 'Monetization',
  ai: 'AI Features',
  settings: 'Settings',
  support: 'Support',
};

const TIER_OPTIONS = [
  { value: 'free', label: 'Free', color: 'bg-gray-500' },
  { value: 'plus', label: 'Plus', color: 'bg-blue-500' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500' },
];

export function ModuleManager() {
  const { modules, getModulesByCategory, updateModule, loading } = useAppModules();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleLive = async (module: AppModule) => {
    setUpdating(module.id);
    const result = await updateModule(module.id, { is_live: !module.is_live });
    
    if (result.success) {
      toast({
        title: module.is_live ? 'Module Disabled' : 'Module Enabled',
        description: `${module.display_name} is now ${module.is_live ? 'not live' : 'live'}`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update module. You may not have admin permissions.',
        variant: 'destructive',
      });
    }
    setUpdating(null);
  };

  const handleTierChange = async (module: AppModule, tier: string) => {
    setUpdating(module.id);
    const result = await updateModule(module.id, { required_tier: tier });
    
    if (result.success) {
      toast({
        title: 'Tier Updated',
        description: `${module.display_name} now requires ${tier} tier`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update tier. You may not have admin permissions.',
        variant: 'destructive',
      });
    }
    setUpdating(null);
  };

  const categorizedModules = getModulesByCategory();

  const getIcon = (iconName: string | null) => {
    const IconComponent = ICON_MAP[iconName || 'Box'] || Box;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'plus': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading modules...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(categorizedModules).map(([category, categoryModules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{CATEGORY_LABELS[category] || category}</CardTitle>
            <CardDescription>
              {categoryModules.length} module{categoryModules.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryModules.map((module) => (
              <div 
                key={module.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  module.is_live ? 'bg-card' : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    module.is_live ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getIcon(module.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{module.display_name}</p>
                      {module.route && (
                        <Badge variant="outline" className="text-xs">
                          {module.route}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select 
                    value={module.required_tier} 
                    onValueChange={(v) => handleTierChange(module, v)}
                    disabled={updating === module.id}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIER_OPTIONS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tier.color}`} />
                            {tier.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {module.is_live ? 'Live' : 'Draft'}
                    </span>
                    <Switch
                      checked={module.is_live}
                      onCheckedChange={() => handleToggleLive(module)}
                      disabled={updating === module.id}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
