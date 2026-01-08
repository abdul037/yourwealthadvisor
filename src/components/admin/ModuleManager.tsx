import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAppModules, AppModule } from '@/hooks/useAppModules';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, DollarSign, Receipt, Wallet, TrendingDown, 
  Target, LineChart, Users, Split, Handshake, Sparkles, Crown, 
  Shield, Download, Headphones, Box, Plus, Trash2, ChevronDown,
  History, AlertCircle
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

const ICON_OPTIONS = Object.keys(ICON_MAP);

const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Features',
  analytics: 'Analytics',
  social: 'Social',
  monetization: 'Monetization',
  ai: 'AI Features',
  settings: 'Settings',
  support: 'Support',
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS);

const TIER_OPTIONS = [
  { value: 'free', label: 'Free', color: 'bg-gray-500' },
  { value: 'plus', label: 'Plus', color: 'bg-blue-500' },
  { value: 'premium', label: 'Premium', color: 'bg-purple-500' },
];

interface AuditLogEntry {
  id: string;
  module_name: string;
  action: string;
  changes: Record<string, unknown> | null;
  performed_at: string;
}

export function ModuleManager() {
  const { modules, getModulesByCategory, updateModule, loading, refetch } = useAppModules();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsOpen, setAuditLogsOpen] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);
  
  // New module form state
  const [newModule, setNewModule] = useState({
    name: '',
    display_name: '',
    description: '',
    route: '',
    icon: 'Box',
    category: 'core',
    required_tier: 'free',
  });

  const handleToggleLive = async (module: AppModule) => {
    setUpdating(module.id);
    const result = await updateModule(module.id, { is_live: !module.is_live });
    
    if (result.success) {
      await logAuditEvent(module.id, module.name, 'updated', { 
        is_live: { from: module.is_live, to: !module.is_live } 
      });
      toast({
        title: module.is_live ? 'Module Unpublished' : 'Module Published',
        description: `${module.display_name} is now ${module.is_live ? 'unpublished' : 'published'}`,
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
      await logAuditEvent(module.id, module.name, 'updated', { 
        required_tier: { from: module.required_tier, to: tier } 
      });
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

  const logAuditEvent = async (
    moduleId: string | null, 
    moduleName: string, 
    action: string, 
    changes: Record<string, unknown>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const insertData = {
        module_id: moduleId,
        module_name: moduleName,
        action,
        changes: JSON.parse(JSON.stringify(changes)),
        performed_by: user?.id,
      };
      await (supabase.from('module_audit_log') as any).insert([insertData]);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  };

  const handleCreateModule = async () => {
    if (!newModule.name || !newModule.display_name) {
      toast({
        title: 'Missing Fields',
        description: 'Name and Display Name are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase.from('app_modules').insert({
        name: newModule.name.toLowerCase().replace(/\s+/g, '_'),
        display_name: newModule.display_name,
        description: newModule.description || null,
        route: newModule.route || null,
        icon: newModule.icon,
        category: newModule.category,
        required_tier: newModule.required_tier,
        is_live: false,
        display_order: modules.length + 1,
      }).select().single();

      if (error) throw error;

      await logAuditEvent(data?.id, newModule.name, 'created', newModule);
      
      toast({
        title: 'Module Created',
        description: `${newModule.display_name} has been created as Unpublished.`,
      });
      
      setCreateDialogOpen(false);
      setNewModule({
        name: '',
        display_name: '',
        description: '',
        route: '',
        icon: 'Box',
        category: 'core',
        required_tier: 'free',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create module. You may not have admin permissions.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteModule = async (module: AppModule) => {
    try {
      const { error } = await supabase.from('app_modules').delete().eq('id', module.id);
      
      if (error) throw error;

      await logAuditEvent(null, module.name, 'deleted', { module });
      
      toast({
        title: 'Module Deleted',
        description: `${module.display_name} has been removed.`,
      });
      
      setDeleteConfirmId(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete module.',
        variant: 'destructive',
      });
    }
  };

  const loadAuditLogs = async () => {
    if (auditLogs.length > 0) return;
    
    setLoadingAudit(true);
    try {
      const { data, error } = await supabase
        .from('module_audit_log')
        .select('*')
        .order('performed_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setAuditLogs((data as AuditLogEntry[]) || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoadingAudit(false);
    }
  };

  const categorizedModules = getModulesByCategory();

  const getIcon = (iconName: string | null) => {
    const IconComponent = ICON_MAP[iconName || 'Box'] || Box;
    return <IconComponent className="w-4 h-4" />;
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
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Module Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Control which features are visible and their access requirements
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new feature module to the application. It will be created as Unpublished.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Module Name (internal)</Label>
                <Input
                  id="name"
                  placeholder="e.g., analytics_dashboard"
                  value={newModule.name}
                  onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  placeholder="e.g., Analytics Dashboard"
                  value={newModule.display_name}
                  onChange={(e) => setNewModule({ ...newModule, display_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the module..."
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="route">Route (optional)</Label>
                <Input
                  id="route"
                  placeholder="e.g., /analytics"
                  value={newModule.route}
                  onChange={(e) => setNewModule({ ...newModule, route: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Icon</Label>
                  <Select value={newModule.icon} onValueChange={(v) => setNewModule({ ...newModule, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map((icon) => {
                        const IconComp = ICON_MAP[icon];
                        return (
                          <SelectItem key={icon} value={icon}>
                            <div className="flex items-center gap-2">
                              <IconComp className="w-4 h-4" />
                              {icon}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={newModule.category} onValueChange={(v) => setNewModule({ ...newModule, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Required Tier</Label>
                <Select value={newModule.required_tier} onValueChange={(v) => setNewModule({ ...newModule, required_tier: v })}>
                  <SelectTrigger>
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
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule}>
                Create Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Module Categories */}
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
                      {module.is_live ? 'Published' : 'Unpublished'}
                    </span>
                    <Switch
                      checked={module.is_live}
                      onCheckedChange={() => handleToggleLive(module)}
                      disabled={updating === module.id}
                    />
                  </div>

                  <Dialog open={deleteConfirmId === module.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirmId(module.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          Delete Module
                        </DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{module.display_name}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteModule(module)}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Audit Log Section */}
      <Collapsible open={auditLogsOpen} onOpenChange={setAuditLogsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  <CardTitle className="text-lg">Audit Log</CardTitle>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${auditLogsOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                View history of module changes
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {!auditLogsOpen ? null : loadingAudit ? (
                <p className="text-muted-foreground text-center py-4">Loading audit logs...</p>
              ) : auditLogs.length === 0 ? (
                <Button variant="outline" onClick={loadAuditLogs} className="w-full">
                  Load Audit Logs
                </Button>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm">
                      <div>
                        <span className="font-medium">{log.module_name}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <Badge variant="outline" className="text-xs">
                          {log.action}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.performed_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
