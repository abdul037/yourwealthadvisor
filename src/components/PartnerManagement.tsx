import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, DollarSign, Droplets, Save, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, LIQUIDITY_LABELS } from '@/lib/portfolioData';
import { useUserProfile } from '@/hooks/useUserProfile';

interface Partner {
  id: string;
  name: string;
  role: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
}

interface IncomeSource {
  id: string;
  partner_id: string;
  source_name: string;
  source_type: string;
  amount: number;
  currency: string;
  frequency: string;
  liquidity_level: 'L1' | 'L2' | 'L3' | 'NL';
  is_active: boolean;
  notes: string | null;
}

const INCOME_TYPES = ['Salary', 'Freelance', 'Rental', 'Investment', 'Business', 'Bonus', 'Commission', 'Other'];
const FREQUENCIES = ['monthly', 'weekly', 'bi-weekly', 'quarterly', 'annually', 'one-time'];
const LIQUIDITY_LEVELS: Array<'L1' | 'L2' | 'L3' | 'NL'> = ['L1', 'L2', 'L3', 'NL'];

const LIQUIDITY_COLORS: Record<string, string> = {
  'L1': 'bg-wealth-positive/20 text-wealth-positive border-wealth-positive/30',
  'L2': 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  'L3': 'bg-accent/20 text-accent border-accent/30',
  'NL': 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
};

export function PartnerManagement() {
  const { user, isAuthenticated } = useUserProfile();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPartnerOpen, setAddPartnerOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);

  const [newPartner, setNewPartner] = useState({ name: '', role: '', email: '' });
  const [newIncome, setNewIncome] = useState({
    partner_id: '',
    source_name: '',
    source_type: 'Salary',
    amount: '',
    currency: 'AED',
    frequency: 'monthly',
    liquidity_level: 'L1' as 'L1' | 'L2' | 'L3' | 'NL',
    notes: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    const [partnersRes, incomeRes] = await Promise.all([
      supabase.from('partners').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('income_sources').select('*').eq('user_id', user.id).order('created_at'),
    ]);

    if (partnersRes.data) setPartners(partnersRes.data);
    if (incomeRes.data) setIncomeSources(incomeRes.data as IncomeSource[]);
    setLoading(false);
  };

  const handleAddPartner = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to add partners', variant: 'destructive' });
      return;
    }
    
    if (!newPartner.name.trim()) {
      toast({ title: 'Error', description: 'Partner name is required', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('partners')
      .insert({
        name: newPartner.name.trim(),
        role: newPartner.role.trim() || null,
        email: newPartner.email.trim() || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setPartners(prev => [...prev, data]);
    setNewPartner({ name: '', role: '', email: '' });
    setAddPartnerOpen(false);
    toast({ title: 'Partner added', description: `${data.name} has been added successfully.` });
  };

  const handleDeletePartner = async (id: string) => {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setPartners(prev => prev.filter(p => p.id !== id));
    setIncomeSources(prev => prev.filter(i => i.partner_id !== id));
    toast({ title: 'Partner deleted', variant: 'destructive' });
  };

  const handleAddIncome = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to add income', variant: 'destructive' });
      return;
    }
    
    if (!newIncome.partner_id || !newIncome.source_name.trim() || !newIncome.amount) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const { data, error } = await supabase
      .from('income_sources')
      .insert({
        partner_id: newIncome.partner_id,
        source_name: newIncome.source_name.trim(),
        source_type: newIncome.source_type,
        amount: parseFloat(newIncome.amount),
        currency: newIncome.currency,
        frequency: newIncome.frequency,
        liquidity_level: newIncome.liquidity_level,
        notes: newIncome.notes.trim() || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setIncomeSources(prev => [...prev, data as IncomeSource]);
    setNewIncome({
      partner_id: '',
      source_name: '',
      source_type: 'Salary',
      amount: '',
      currency: 'AED',
      frequency: 'monthly',
      liquidity_level: 'L1',
      notes: '',
    });
    setAddIncomeOpen(false);
    toast({ title: 'Income source added', description: `${data.source_name} has been added.` });
  };

  const handleUpdateIncome = async () => {
    if (!editingIncome) return;

    const { error } = await supabase
      .from('income_sources')
      .update({
        source_name: editingIncome.source_name,
        source_type: editingIncome.source_type,
        amount: editingIncome.amount,
        currency: editingIncome.currency,
        frequency: editingIncome.frequency,
        liquidity_level: editingIncome.liquidity_level,
        notes: editingIncome.notes,
      })
      .eq('id', editingIncome.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    setIncomeSources(prev => prev.map(i => i.id === editingIncome.id ? editingIncome : i));
    setEditingIncome(null);
    toast({ title: 'Income updated' });
  };

  const handleDeleteIncome = async (id: string) => {
    const { error } = await supabase.from('income_sources').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setIncomeSources(prev => prev.filter(i => i.id !== id));
    toast({ title: 'Income source deleted', variant: 'destructive' });
  };

  const getPartnerIncome = (partnerId: string) => {
    return incomeSources.filter(i => i.partner_id === partnerId);
  };

  const getTotalIncome = (partnerId: string) => {
    return getPartnerIncome(partnerId).reduce((sum, i) => sum + Number(i.amount), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Partners Section */}
      <div className="wealth-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Income Bearers / Partners</h3>
              <p className="text-sm text-muted-foreground">Manage household income sources</p>
            </div>
          </div>
          <Dialog open={addPartnerOpen} onOpenChange={setAddPartnerOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Income Bearer / Partner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                    placeholder="e.g., Ahmed Al Maktoum"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role / Position</Label>
                  <Input
                    value={newPartner.role}
                    onChange={(e) => setNewPartner({ ...newPartner, role: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    placeholder="e.g., ahmed@example.com"
                    maxLength={255}
                  />
                </div>
                <Button onClick={handleAddPartner} className="w-full">
                  Add Partner
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {partners.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No partners added yet</p>
          ) : (
            partners.map(partner => (
              <div key={partner.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-semibold text-primary-foreground">
                      {partner.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{partner.name}</h4>
                      {partner.role && <p className="text-sm text-muted-foreground">{partner.role}</p>}
                      {partner.email && <p className="text-xs text-muted-foreground">{partner.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold font-mono text-wealth-positive">
                      {formatCurrency(getTotalIncome(partner.id))}
                      <span className="text-xs text-muted-foreground font-normal">/mo</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeletePartner(partner.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Income Sources for this partner */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Income Sources</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewIncome({ ...newIncome, partner_id: partner.id });
                        setAddIncomeOpen(true);
                      }}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Income
                    </Button>
                  </div>

                  {getPartnerIncome(partner.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No income sources</p>
                  ) : (
                    <div className="space-y-2">
                      {getPartnerIncome(partner.id).map(income => (
                        <div
                          key={income.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                        >
                          {editingIncome?.id === income.id ? (
                            <div className="flex-1 grid grid-cols-4 gap-2 items-center">
                              <Input
                                value={editingIncome.source_name}
                                onChange={(e) => setEditingIncome({ ...editingIncome, source_name: e.target.value })}
                                className="h-8"
                              />
                              <Input
                                type="number"
                                value={editingIncome.amount}
                                onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) || 0 })}
                                className="h-8"
                              />
                              <Select
                                value={editingIncome.liquidity_level}
                                onValueChange={(v) => setEditingIncome({ ...editingIncome, liquidity_level: v as 'L1' | 'L2' | 'L3' | 'NL' })}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {LIQUIDITY_LEVELS.map(level => (
                                    <SelectItem key={level} value={level}>
                                      {level} - {LIQUIDITY_LABELS[level]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateIncome}>
                                  <Save className="w-4 h-4 text-primary" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingIncome(null)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <DollarSign className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{income.source_name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{income.source_type}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground capitalize">{income.frequency}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className={LIQUIDITY_COLORS[income.liquidity_level]}>
                                  <Droplets className="w-3 h-3 mr-1" />
                                  {income.liquidity_level}
                                </Badge>
                                <p className="text-sm font-mono font-medium">
                                  {formatCurrency(Number(income.amount), income.currency as 'AED' | 'USD' | 'INR')}
                                </p>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingIncome(income)}>
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteIncome(income.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Income Dialog */}
      <Dialog open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Income Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Partner *</Label>
              <Select
                value={newIncome.partner_id}
                onValueChange={(v) => setNewIncome({ ...newIncome, partner_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Name *</Label>
                <Input
                  value={newIncome.source_name}
                  onChange={(e) => setNewIncome({ ...newIncome, source_name: e.target.value })}
                  placeholder="e.g., Main Salary"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Income Type</Label>
                <Select
                  value={newIncome.source_type}
                  onValueChange={(v) => setNewIncome({ ...newIncome, source_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOME_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                  placeholder="32000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={newIncome.currency}
                  onValueChange={(v) => setNewIncome({ ...newIncome, currency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={newIncome.frequency}
                  onValueChange={(v) => setNewIncome({ ...newIncome, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map(f => (
                      <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Liquidity Level</Label>
              <Select
                value={newIncome.liquidity_level}
                onValueChange={(v) => setNewIncome({ ...newIncome, liquidity_level: v as 'L1' | 'L2' | 'L3' | 'NL' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIQUIDITY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={LIQUIDITY_COLORS[level]}>
                          {level}
                        </Badge>
                        <span>{LIQUIDITY_LABELS[level]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                L1 = Instant access, L2 = 1-7 days, L3 = 7-30 days, NL = Non-liquid
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={newIncome.notes}
                onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                placeholder="Optional notes..."
                maxLength={500}
              />
            </div>

            <Button onClick={handleAddIncome} className="w-full">
              Add Income Source
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
