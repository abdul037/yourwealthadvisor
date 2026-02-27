import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Target, PiggyBank,
  CreditCard, TrendingUp, Receipt, Users,
  Link2, Check,
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TharwaLogo } from '@/components/TharwaLogo';
import { NaylaMascot } from '@/components/NaylaMascot';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { SetupWizardBankConnection } from '@/components/SetupWizardBankConnection';
import { BankAccount } from '@/lib/mockBankingData';

// ─── Data ──────────────────────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { id: 'track_spending',   label: 'Track spending',   icon: Receipt   },
  { id: 'emergency_fund',   label: 'Emergency fund',   icon: PiggyBank },
  { id: 'pay_debt',         label: 'Pay off debt',     icon: CreditCard },
  { id: 'save_purchase',    label: 'Save for a goal',  icon: Target    },
  { id: 'split_expenses',   label: 'Split expenses',   icon: Users     },
  { id: 'grow_investments', label: 'Grow investments', icon: TrendingUp },
];

const CURRENCY_OPTIONS = [
  { id: 'AED', name: 'UAE Dirham',    symbol: 'د.إ' },
  { id: 'USD', name: 'US Dollar',     symbol: '$'   },
  { id: 'EUR', name: 'Euro',          symbol: '€'   },
  { id: 'GBP', name: 'British Pound', symbol: '£'   },
  { id: 'INR', name: 'Indian Rupee',  symbol: '₹'   },
  { id: 'SAR', name: 'Saudi Riyal',   symbol: 'ر.س' },
];

const INCOME_RANGES = [
  { id: 'starter',     label: 'Just starting out',  sub: 'Building my first budget'      },
  { id: 'building',    label: 'Building up',         sub: 'Growing a steady income'       },
  { id: 'established', label: 'Well established',    sub: 'Optimising and saving more'    },
  { id: 'high',        label: 'High earner',         sub: 'Complex portfolio management'  },
];


// ─── Steps rail ────────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Your Goals',       sub: 'Preferences & income range' },
  { label: 'Connect Accounts', sub: 'Banks, investments & more'  },
];

// ─── Demo seeder ───────────────────────────────────────────────────────────────
async function runDemoSeed(userId: string) {
  const { data: partner, error: partnerErr } = await supabase
    .from('partners').insert({ name: 'Primary Earner', role: 'Primary', user_id: userId }).select().single();
  if (partnerErr || !partner) return;

  await supabase.from('income_sources').insert([
    { source_name: 'Monthly Salary',     source_type: 'salary',    amount: 25000, currency: 'AED', frequency: 'monthly', liquidity_level: 'L1', user_id: userId, partner_id: partner.id, is_active: true },
    { source_name: 'Freelance Projects', source_type: 'freelance', amount: 5000,  currency: 'AED', frequency: 'monthly', liquidity_level: 'L1', user_id: userId, partner_id: partner.id, is_active: true },
  ]);

  const expenses = [
    { category: 'Food & Dining', description: 'Grocery shopping', amount: 1200 },
    { category: 'Transport',     description: 'Fuel',             amount: 400  },
    { category: 'Utilities',     description: 'DEWA bill',        amount: 850  },
    { category: 'Entertainment', description: 'Netflix',          amount: 55   },
    { category: 'Shopping',      description: 'Clothing',         amount: 600  },
  ];
  await supabase.from('transactions').insert(
    expenses.flatMap((e, i) =>
      [0, 1].map(month => ({
        ...e, type: 'expense', currency: 'AED', user_id: userId,
        transaction_date: format(subDays(subMonths(new Date(), month), i * 5), 'yyyy-MM-dd'),
      }))
    )
  );

  await supabase.from('budgets').insert([
    { category: 'Food & Dining', allocated_amount: 2000, period: 'monthly', currency: 'AED', user_id: userId, is_active: true },
    { category: 'Transport',     allocated_amount: 1000, period: 'monthly', currency: 'AED', user_id: userId, is_active: true },
    { category: 'Utilities',     allocated_amount: 1200, period: 'monthly', currency: 'AED', user_id: userId, is_active: true },
  ]);

  await supabase.from('assets').insert([
    { name: 'Emergency Savings',   category: 'Cash',   amount: 50000, currency: 'AED', liquidity_level: 'L1', user_id: userId, is_active: true },
    { name: 'UAE Stock Portfolio', category: 'Stocks', amount: 75000, currency: 'AED', liquidity_level: 'L2', user_id: userId, is_active: true },
  ]);

  await supabase.from('milestones').insert([
    { name: 'Emergency Fund', target_amount: 100000, current_amount: 50000, category: 'Emergency Fund', priority: 'high', user_id: userId, is_achieved: false, target_date: format(subMonths(new Date(), -12), 'yyyy-MM-dd') },
  ]);

  await supabase.from('profiles').update({
    onboarding_progress: { income_added: true, expense_added: true, budget_created: true, goal_created: true, bank_connected: false },
  }).eq('id', userId);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const { user, displayName, completeOnboarding } = useUserProfile();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [preferences, setPreferences] = useState({
    goals: [] as string[],
    preferred_currency: 'AED',
    income_range: 'building',
  });

  const [useDemo, setUseDemo] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  const [mascotMessage, setMascotMessage] = useState("Hi! Let's get your setup started.");

  const toggleGoal = (id: string) =>
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(id) ? prev.goals.filter(g => g !== id) : [...prev.goals, id],
    }));

  const handleStep1Next = async () => {
    if (user) {
      await supabase.from('profiles').update({ preferences: preferences as any }).eq('id', user.id);
    }
    setStep(1);
  };

  const handleAccountsConnected = (accounts: BankAccount[]) =>
    setConnectedAccounts(prev => [...prev, ...accounts]);

  const handleComplete = async (skip = false) => {
    if (!user) return;
    setIsSubmitting(true);
    setCompleting(true);
    try {
      if (!skip) {
        await supabase.from('profiles').update({
          onboarding_progress: {
            income_added: false, expense_added: false,
            budget_created: false, goal_created: false,
            bank_connected: connectedAccounts.length > 0,
          },
        }).eq('id', user.id);
      }
      if (useDemo) await runDemoSeed(user.id);
      await completeOnboarding();
    } catch (err) {
      console.error('Onboarding completion error:', err);
    } finally {
      setIsSubmitting(false);
    }
    // Outside try — always navigates. Full reload avoids ProtectedRoute race condition.
    // Signal AppLayout to auto-start the tour once the dashboard mounts.
    localStorage.setItem('wealth-tracker-tour-pending', 'true');
    window.location.href = '/';
  };

  // ── Reactive mascot helpers ─────────────────────────────────────────────────
  const getFallbackMascotMessage = useCallback((): string => {
    if (completing)
      return `You're all set${displayName ? `, ${displayName}` : ''}! Taking you to your dashboard 🎉`;
    if (step === 0) {
      if (preferences.goals.length === 0)
        return `Hi${displayName ? ` ${displayName}` : ''}! I'm Nayla 👋 What brings you here today? Select everything that applies.`;
      if (preferences.goals.length === 1)
        return `Nice choice! Any other goals on your list? You can always change these later.`;
      if (preferences.goals.length < 4)
        return `Love it! Now tell me where you are financially — it helps me tailor your dashboard.`;
      return `You've got big ambitions! I love it. Let's get your dashboard ready.`;
    }
    if (connectedAccounts.length === 0)
      return `Link a bank for automatic real-time insights, or skip and add data manually — both work great!`;
    if (connectedAccounts.length === 1)
      return `${connectedAccounts[0].bankName} connected! Add more accounts or jump straight in.`;
    return `${connectedAccounts.length} accounts linked — you're set up for live insights!`;
  }, [completing, connectedAccounts, displayName, preferences.goals.length, step]);

  const mascotState =
    completing                                 ? 'celebrating' as const :
    step === 1 && connectedAccounts.length > 0 ? 'celebrating' as const :
    step === 1                                 ? 'talking'     as const :
    preferences.goals.length > 0              ? 'talking'     as const :
                                               'waving'       as const;

  useEffect(() => {
    setMascotMessage(getFallbackMascotMessage());
  }, [getFallbackMascotMessage]);

  useEffect(() => {
    if (!user?.id) return;

    const fallback = getFallbackMascotMessage();
    let cancelled = false;

    const timer = setTimeout(async () => {
      const goals = preferences.goals.length ? preferences.goals.join(', ') : 'none';
      const stepLabel = step === 0 ? 'goals and preferences' : 'account connection';

      const prompt = [
        'Generate one short onboarding helper reply as Nayla for this user state.',
        `User name: ${displayName ?? 'friend'}`,
        `Step: ${stepLabel}`,
        `Goals selected: ${goals}`,
        `Preferred currency: ${preferences.preferred_currency}`,
        `Income range: ${preferences.income_range}`,
        `Connected accounts count: ${connectedAccounts.length}`,
        `Completion state: ${completing ? 'finishing now' : 'in progress'}`,
        'Rules: 1-2 short sentences, warm and confident, no markdown, no NAVIGATE line.',
      ].join('\n');

      try {
        const { data, error } = await supabase.functions.invoke('mascot-chat', {
          body: {
            messages: [{ role: 'user', content: prompt }],
            page: '/onboarding',
            financialContext: null,
          },
        });

        if (error) throw error;

        const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
        const isSetupError = /ANTHROPIC_API_KEY|not fully set up|invalid.*api key/i.test(reply);

        if (!cancelled) {
          setMascotMessage(reply && !isSetupError ? reply : fallback);
        }
      } catch {
        if (!cancelled) {
          setMascotMessage(fallback);
        }
      }
    }, 380);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    completing,
    connectedAccounts.length,
    displayName,
    getFallbackMascotMessage,
    preferences.goals,
    preferences.income_range,
    preferences.preferred_currency,
    step,
    user?.id,
  ]);

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left sidebar (desktop only) ───────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col justify-between border-r border-border/50 bg-muted/20 p-8">
        <div className="space-y-10">
          <TharwaLogo size="md" />

          {/* Steps rail */}
          <nav className="space-y-1">
            {STEPS.map((s, i) => {
              const isDone   = i < step;
              const isActive = i === step;
              return (
                <div key={i} className={cn('flex items-start gap-3 rounded-lg px-3 py-2.5', isActive && 'bg-primary/10')}>
                  <div className={cn(
                    'mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ring-2',
                    isDone   ? 'bg-primary ring-primary text-primary-foreground'
                    : isActive ? 'ring-primary text-primary bg-background'
                    :            'ring-border text-muted-foreground bg-background',
                  )}>
                    {isDone ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', isActive ? 'text-foreground' : isDone ? 'text-foreground/70' : 'text-muted-foreground')}>{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Mascot with speech bubble */}
        <div className="space-y-4">
          {/* Demo data toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-border/50 bg-background/50 cursor-pointer hover:bg-muted/30 transition-colors">
            <div
              onClick={() => setUseDemo(v => !v)}
              className={cn(
                'w-9 h-5 rounded-full transition-colors flex-shrink-0',
                useDemo ? 'bg-primary' : 'bg-muted',
              )}
            >
              <div className={cn('w-4 h-4 rounded-full bg-white shadow-sm mt-0.5 transition-transform', useDemo ? 'translate-x-4' : 'translate-x-0.5')} />
            </div>
            <span className="text-xs text-muted-foreground leading-tight">
              Load demo data on start
            </span>
          </label>

          {/* Mascot + bubble — vertical layout */}
          <div className="flex flex-col items-center gap-2">
            {/* Speech bubble above mascot */}
            <div className="relative w-full bg-muted/40 rounded-2xl px-3 py-2.5">
              <p key={mascotMessage} className="text-xs text-muted-foreground leading-relaxed text-center animate-fade-in">
                {mascotMessage}
              </p>
              {/* Tail pointing down toward mascot */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '7px solid hsl(var(--muted) / 0.4)' }} />
            </div>
            <div className="pt-2 flex flex-col items-center gap-1">
              <NaylaMascot state={mascotState} size="lg" />
              <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">Nayla</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Takes about 1 minute &middot; Skip anything
          </p>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-5 pt-5 pb-3">
          <TharwaLogo size="sm" />
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </header>

        {/* Mobile progress bar */}
        <div className="lg:hidden h-1 bg-muted mx-5 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Mobile Nayla guide strip */}
        <div className="lg:hidden mx-5 mb-4 flex items-end gap-3 rounded-2xl border border-border/40 bg-muted/20 px-4 py-3">
          <NaylaMascot state={mascotState} size="sm" className="flex-shrink-0" />
          <p key={mascotMessage} className="text-xs text-muted-foreground leading-relaxed animate-fade-in">
            {mascotMessage}
          </p>
        </div>

        <main className="flex-1 flex items-start justify-center px-5 py-8 lg:px-12 lg:py-12 overflow-y-auto">
          <div className="w-full max-w-xl space-y-8">

            {/* ── Step 1: Goals, Currency & Income ─────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Tell us about yourself{displayName ? `, ${displayName}` : ''}
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Personalise your dashboard in 3 quick questions.
                  </p>
                </div>

                {/* Goals */}
                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <Label className="text-sm font-semibold">What are you here for?</Label>
                    <span className="text-xs text-muted-foreground">Select all that apply</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_OPTIONS.map(goal => {
                      const Icon     = goal.icon;
                      const selected = preferences.goals.includes(goal.id);
                      return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all',
                            selected
                              ? 'border-primary bg-primary/8 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50',
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0',
                            selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                          )}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={cn('text-xs font-medium leading-tight', selected && 'text-foreground')}>
                            {goal.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Primary currency</Label>
                  <Select
                    value={preferences.preferred_currency}
                    onValueChange={v => setPreferences(p => ({ ...p, preferred_currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="font-mono font-semibold text-primary mr-1.5">{c.symbol}</span>
                          {c.id} — {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Income range */}
                <div className="space-y-2.5">
                  <Label className="text-sm font-semibold">Where are you financially?</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INCOME_RANGES.map(range => {
                      const selected = preferences.income_range === range.id;
                      return (
                        <button
                          key={range.id}
                          onClick={() => setPreferences(p => ({ ...p, income_range: range.id }))}
                          className={cn(
                            'flex flex-col items-start gap-0.5 px-3 py-3 rounded-lg border-2 text-left transition-all',
                            selected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40',
                          )}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xs font-semibold flex-1">{range.label}</span>
                            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                          </div>
                          <span className="text-[11px] text-muted-foreground leading-tight">{range.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleStep1Next} className="w-full gap-2" size="lg">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* ── Step 2: Connect Accounts ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Connect your accounts</h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Link banks, investments, crypto, or utility bills. Demo mode — connect real accounts later.
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-5">
                  <SetupWizardBankConnection
                    connectedAccounts={connectedAccounts}
                    onConnectionSuccess={handleAccountsConnected}
                  />
                </div>

                {/* Trust note */}
                <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Link2 className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Read-only access.</span>{' '}
                    We only read balances and transaction history. We never store credentials or make transactions on your behalf.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)} className="gap-1" disabled={isSubmitting}>
                    <ArrowLeft className="w-4 h-4" />Back
                  </Button>
                  <Button
                    onClick={() => handleComplete(false)}
                    className="flex-1 gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Setting up...'
                      : connectedAccounts.length > 0
                        ? `Go to Dashboard (${connectedAccounts.length} connected)`
                        : 'Go to Dashboard'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <button
                  onClick={() => handleComplete(true)}
                  disabled={isSubmitting}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  Skip for now →
                </button>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
