import logoIcon from '@/assets/logo-icon.png';

interface TharwaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 32, text: 'text-base' },
  lg: { icon: 40, text: 'text-xl' },
  xl: { icon: 64, text: 'text-2xl' },
};

export function TharwaLogo({ size = 'md', variant = 'full', className = '' }: TharwaLogoProps) {
  const { icon, text } = sizeMap[size];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoIcon} 
        alt="Tharwa Net Logo" 
        width={icon} 
        height={icon}
        className="object-contain"
      />
      {variant === 'full' && (
        <div className="min-w-0">
          <h1 className={`${text} font-bold tracking-tight truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Tharwa Net
          </h1>
          {size !== 'sm' && (
            <p className="text-[10px] text-muted-foreground">Your Personalized Wealth Manager</p>
          )}
        </div>
      )}
    </div>
  );
}
