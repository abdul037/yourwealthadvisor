import { LucideIcon, BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionPath?: string;
  onSecondaryAction?: () => void;
  variant?: 'card' | 'inline';
  className?: string;
  animated?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  secondaryActionLabel,
  secondaryActionPath,
  onSecondaryAction,
  variant = 'card',
  className,
  animated = true,
}: EmptyStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center text-center py-8 px-4", className)}>
      <div className={cn(
        "w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5",
        animated && "animate-pulse"
      )}>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Icon className={cn(
            "w-7 h-7 text-primary",
            animated && "animate-bounce"
          )} style={{ animationDuration: '2s' }} />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && (actionPath || onAction) && (
          actionPath ? (
            <Link to={actionPath}>
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button onClick={onAction} className="gap-2">
              <Sparkles className="w-4 h-4" />
              {actionLabel}
            </Button>
          )
        )}
        
        {secondaryActionLabel && (secondaryActionPath || onSecondaryAction) && (
          secondaryActionPath ? (
            <Link to={secondaryActionPath}>
              <Button variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={onSecondaryAction} className="gap-2">
              <BookOpen className="w-4 h-4" />
              {secondaryActionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
