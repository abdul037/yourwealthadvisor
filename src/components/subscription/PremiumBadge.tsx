import { Crown, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
  tier: 'free' | 'plus' | 'premium' | 'family' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const tierConfig = {
  free: {
    icon: null,
    label: 'Free',
    className: '',
  },
  plus: {
    icon: Star,
    label: 'Plus',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  premium: {
    icon: Crown,
    label: 'Premium',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  family: {
    icon: Users,
    label: 'Family',
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
};

const sizeConfig = {
  sm: 'px-1.5 py-0.5 text-xs gap-1',
  md: 'px-2 py-1 text-sm gap-1.5',
  lg: 'px-3 py-1.5 text-base gap-2',
};

const iconSizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function PremiumBadge({ 
  tier, 
  size = 'sm', 
  showLabel = true,
  className 
}: PremiumBadgeProps) {
  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.free;
  
  // Don't show badge for free tier
  if (tier === 'free' || !config.icon) {
    return null;
  }

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeConfig[size],
        config.className,
        className
      )}
    >
      <Icon className={iconSizeConfig[size]} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}
