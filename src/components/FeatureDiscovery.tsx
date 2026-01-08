import { X, Sparkles, Mic, Users, Bot, Repeat, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFeatureDiscovery } from '@/hooks/useFeatureDiscovery';
import { cn } from '@/lib/utils';

const iconMap = {
  sparkles: Sparkles,
  mic: Mic,
  users: Users,
  bot: Bot,
  repeat: Repeat,
  shield: Shield,
  trending: TrendingUp
};

export function FeatureDiscovery() {
  const { currentTip, isVisible, dismissTip, handleAction } = useFeatureDiscovery();

  if (!isVisible || !currentTip) return null;

  const Icon = iconMap[currentTip.icon] || Sparkles;

  return (
    <Card className={cn(
      "relative overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10",
      "animate-in slide-in-from-top-2 fade-in duration-300"
    )}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
      
      <div className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-1">{currentTip.title}</p>
          <p className="text-sm text-foreground/80">{currentTip.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={handleAction}
              className="h-8 gap-1"
            >
              {currentTip.actionLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={dismissTip}
              className="h-8 text-muted-foreground"
            >
              Got it
            </Button>
          </div>
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={dismissTip}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
