import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Upload, FileSpreadsheet, CheckCircle2, 
  ArrowRight, ArrowLeft, Users, Wallet, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';

interface SetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SetupPath = 'quick-start' | 'bulk-upload' | 'guided' | null;

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: User },
  { id: 'path', title: 'Choose Path', icon: FileSpreadsheet },
  { id: 'complete', title: 'All Set', icon: CheckCircle2 },
];

export function SetupWizard({ open, onOpenChange }: SetupWizardProps) {
  const navigate = useNavigate();
  const { profile, updateProfile, completeOnboarding, displayName } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [selectedPath, setSelectedPath] = useState<SetupPath>(null);

  const handleNext = async () => {
    if (currentStep === 0 && fullName.trim()) {
      await updateProfile({ full_name: fullName.trim() });
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
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
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

          {/* Step 1: Choose Setup Path */}
          {currentStep === 1 && (
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

          {/* Step 2: Complete */}
          {currentStep === 2 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-wealth-positive/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-wealth-positive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">You're all set, {fullName || displayName}!</h3>
                <p className="text-muted-foreground mt-1">
                  {selectedPath === 'quick-start' && "Your dashboard is ready. Start by adding your first income or expense."}
                  {selectedPath === 'bulk-upload' && "We'll take you to the import section to upload your data."}
                  {selectedPath === 'guided' && "Let's set up your partners and income sources."}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleComplete} className="w-full gap-2">
                  {selectedPath === 'quick-start' ? 'Go to Dashboard' : 'Continue Setup'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        {currentStep < 2 && (
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
              disabled={currentStep === 1 && !selectedPath}
              className="gap-1"
            >
              Next
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
