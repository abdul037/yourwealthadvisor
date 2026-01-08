import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Upload, FileSpreadsheet, CheckCircle2, 
  ArrowRight, ArrowLeft, Users, Wallet, LayoutDashboard, Link2,
  Target, PiggyBank, CreditCard, TrendingUp, Receipt, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';
import { SetupWizardBankConnection } from '@/components/SetupWizardBankConnection';
import { BankAccount } from '@/lib/mockBankingData';
import { supabase } from '@/integrations/supabase/client';

interface SetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountsConnected?: (accounts: BankAccount[]) => void;
}

type SetupPath = 'quick-start' | 'bulk-upload' | 'guided' | null;

interface UserPreferences {
  goals: string[];
  household_type: string;
  preferred_currency: string;
  location: {
    country: string;
    city: string;
  };
}

const GOAL_OPTIONS = [
  { id: 'track_spending', label: 'Track daily spending', icon: Receipt },
  { id: 'emergency_fund', label: 'Build an emergency fund', icon: PiggyBank },
  { id: 'pay_debt', label: 'Pay off debt faster', icon: CreditCard },
  { id: 'save_purchase', label: 'Save for a big purchase', icon: Target },
  { id: 'split_expenses', label: 'Split expenses with others', icon: Users },
  { id: 'grow_investments', label: 'Grow investments', icon: TrendingUp },
];

const HOUSEHOLD_OPTIONS = [
  { id: 'single', label: 'Just me' },
  { id: 'couple', label: 'Couple' },
  { id: 'family', label: 'Family with kids' },
];

const CURRENCY_OPTIONS = [
  { id: 'AED', label: 'AED - UAE Dirham' },
  { id: 'USD', label: 'USD - US Dollar' },
  { id: 'EUR', label: 'EUR - Euro' },
  { id: 'GBP', label: 'GBP - British Pound' },
  { id: 'INR', label: 'INR - Indian Rupee' },
  { id: 'SAR', label: 'SAR - Saudi Riyal' },
];

const COUNTRY_OPTIONS = [
  'United Arab Emirates', 'United States', 'United Kingdom', 'India', 
  'Saudi Arabia', 'Canada', 'Australia', 'Germany', 'France', 'Other'
];

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: User },
  { id: 'preferences', title: 'Your Goals', icon: Target },
  { id: 'path', title: 'Choose Path', icon: FileSpreadsheet },
  { id: 'connect', title: 'Connect Accounts', icon: Link2 },
  { id: 'complete', title: 'All Set', icon: CheckCircle2 },
];

export function SetupWizard({ open, onOpenChange, onAccountsConnected }: SetupWizardProps) {
  const navigate = useNavigate();
  const { user, profile, updateProfile, completeOnboarding, displayName } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [selectedPath, setSelectedPath] = useState<SetupPath>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([]);
  
  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    goals: [],
    household_type: 'single',
    preferred_currency: 'AED',
    location: { country: 'United Arab Emirates', city: '' }
  });

  const handleAccountsConnected = (accounts: BankAccount[]) => {
    setConnectedAccounts(prev => [...prev, ...accounts]);
  };

  const toggleGoal = (goalId: string) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleNext = async () => {
    if (currentStep === 0 && fullName.trim()) {
      await updateProfile({ full_name: fullName.trim() });
    }
    
    // Save preferences when leaving step 1
    if (currentStep === 1 && user) {
      await supabase
        .from('profiles')
        .update({ preferences: preferences as any })
        .eq('id', user.id);
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    
    // Pass connected accounts to parent
    if (connectedAccounts.length > 0 && onAccountsConnected) {
      onAccountsConnected(connectedAccounts);
    }
    
    onOpenChange(false);
    
    // Navigate based on selected path
    if (selectedPath === 'bulk-upload') {
      navigate('/admin?tab=import');
    } else if (selectedPath === 'guided') {
      navigate('/admin?tab=partners');
    }
    // For quick-start, stay on dashboard
  };

  const handleSkip = async () => {
    await completeOnboarding();
    onOpenChange(false);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(() => {
              const IconComponent = STEPS[currentStep].icon;
              return IconComponent ? <IconComponent className="w-5 h-5 text-primary" /> : null;
            })()}
            {STEPS[currentStep].title}
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {STEPS.length}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1" />

        <div className="py-4">
          {/* Step 0: Welcome & Name */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Welcome to Tharwa Net! Let's personalize your wealth management experience.
              </p>
              
              {/* App Preview */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="aspect-video rounded-md bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <LayoutDashboard className="w-12 h-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Your personalized dashboard awaits</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">What should we call you?</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us personalize your dashboard greeting
                </p>
              </div>
            </div>
          )}

          {/* Step 1: User Preferences */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {/* Goals Selection */}
              <div className="space-y-3">
                <Label className="text-base">What brings you to Tharwa Net?</Label>
                <p className="text-xs text-muted-foreground">Select all that apply</p>
                <div className="grid gap-2">
                  {GOAL_OPTIONS.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = preferences.goals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{goal.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Household Type */}
              <div className="space-y-2">
                <Label>Household type</Label>
                <div className="flex gap-2">
                  {HOUSEHOLD_OPTIONS.map(opt => (
                    <Button
                      key={opt.id}
                      variant={preferences.household_type === opt.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreferences(prev => ({ ...prev, household_type: opt.id }))}
                      className="flex-1"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Currency & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Preferred currency</Label>
                  <Select 
                    value={preferences.preferred_currency} 
                    onValueChange={(v) => setPreferences(prev => ({ ...prev, preferred_currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select 
                    value={preferences.location.country} 
                    onValueChange={(v) => setPreferences(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, country: v } 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRY_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City (optional)</Label>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="city"
                    value={preferences.location.city}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      location: { ...prev.location, city: e.target.value } 
                    }))}
                    placeholder="Enter your city for local insights"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for community leaderboards and local comparisons
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Choose Setup Path */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                How would you like to get started?
              </p>
              <div className="grid gap-3">
                <SetupPathCard
                  icon={Wallet}
                  title="Quick Start"
                  description="Start fresh and add transactions as you go"
                  selected={selectedPath === 'quick-start'}
                  onClick={() => setSelectedPath('quick-start')}
                />
                <SetupPathCard
                  icon={Upload}
                  title="Bulk Upload"
                  description="Import existing data from CSV files"
                  selected={selectedPath === 'bulk-upload'}
                  onClick={() => setSelectedPath('bulk-upload')}
                />
                <SetupPathCard
                  icon={Users}
                  title="Guided Setup"
                  description="Step-by-step: partners, income, expenses"
                  selected={selectedPath === 'guided'}
                  onClick={() => setSelectedPath('guided')}
                />
              </div>
            </div>
          )}

          {/* Step 3: Connect Accounts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Connect your bank accounts, investments, and utilities for automatic tracking.
              </p>
              <SetupWizardBankConnection 
                connectedAccounts={connectedAccounts}
                onConnectionSuccess={handleAccountsConnected}
              />
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-wealth-positive/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-wealth-positive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">You're all set, {fullName || displayName}!</h3>
                <p className="text-muted-foreground mt-1">
                  {connectedAccounts.length > 0 
                    ? `${connectedAccounts.length} account${connectedAccounts.length > 1 ? 's' : ''} connected. Data syncing automatically.`
                    : selectedPath === 'quick-start' 
                      ? "Your dashboard is ready. Start by adding your first income or expense."
                      : selectedPath === 'bulk-upload' 
                        ? "We'll take you to the import section to upload your data."
                        : "Let's set up your partners and income sources."
                  }
                </p>
                {preferences.goals.length > 0 && (
                  <p className="text-sm text-primary mt-2">
                    Dashboard personalized for: {preferences.goals.slice(0, 2).map(g => 
                      GOAL_OPTIONS.find(o => o.id === g)?.label.split(' ').slice(0, 2).join(' ')
                    ).join(', ')}
                    {preferences.goals.length > 2 && ` +${preferences.goals.length - 2} more`}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleComplete} className="w-full gap-2">
                  {selectedPath === 'quick-start' || connectedAccounts.length > 0 ? 'Go to Dashboard' : 'Continue Setup'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between pt-2">
            <Button 
              variant="ghost" 
              onClick={currentStep === 0 ? handleSkip : handleBack}
              className="gap-1"
            >
              {currentStep === 0 ? (
                'Skip for now'
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </>
              )}
            </Button>
            <Button 
              onClick={handleNext}
              disabled={currentStep === 2 && !selectedPath}
              className="gap-1"
            >
              {currentStep === 3 ? (
                connectedAccounts.length > 0 ? 'Continue' : 'Skip for now'
              ) : (
                'Next'
              )}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SetupPathCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function SetupPathCard({ icon: Icon, title, description, selected, onClick }: SetupPathCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all",
        selected 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center",
        selected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {selected && (
        <CheckCircle2 className="w-5 h-5 text-primary" />
      )}
    </button>
  );
}
