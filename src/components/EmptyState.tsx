import { LucideIcon } from 'lucide-react';
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
  variant?: 'card' | 'inline';
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  variant = 'card',
  className,
}: EmptyStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center text-center py-8 px-4", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {actionLabel && (actionPath || onAction) && (
        actionPath ? (
          <Link to={actionPath}>
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button onClick={onAction}>{actionLabel}</Button>
        )
      )}
    </div>
  );

  if (variant === 'inline') {
    return content;
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}