import { Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  variant?: 'inline' | 'card' | 'banner';
  className?: string;
}

export function UpgradePrompt({ 
  feature, 
  description,
  variant = 'card',
  className 
}: UpgradePromptProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        <Crown className="w-4 h-4 text-amber-400" />
        <span className="text-muted-foreground">{feature}</span>
        <Link to="/membership">
          <Button variant="link" size="sm" className="p-0 h-auto text-amber-400">
            Upgrade
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 rounded-lg p-4',
        className
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium">{feature}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <Link to="/membership">
            <Button variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
              Upgrade <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-purple-500/10', className)}>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{feature}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Link to="/membership">
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
              Upgrade to Premium <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
