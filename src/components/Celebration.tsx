import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/lib/achievementsData';
import { cn } from '@/lib/utils';

interface CelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function Celebration({ achievement, onClose }: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  if (!achievement) return null;

  const Icon = achievement.icon;

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md text-center overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  i % 5 === 0 && "bg-primary",
                  i % 5 === 1 && "bg-yellow-400",
                  i % 5 === 2 && "bg-green-400",
                  i % 5 === 3 && "bg-blue-400",
                  i % 5 === 4 && "bg-pink-400"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `confetti ${1 + Math.random() * 2}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10 py-6">
          {/* Achievement Icon */}
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto animate-pulse">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-primary/20 blur-xl animate-pulse" />
          </div>

          {/* Achievement Text */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-medium text-primary uppercase tracking-wider">
              Achievement Unlocked!
            </p>
            <h3 className="text-2xl font-bold">{achievement.name}</h3>
            <p className="text-muted-foreground">{achievement.description}</p>
          </div>

          {/* Points */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold mb-6">
            <span>+{achievement.points}</span>
            <span className="text-sm">points</span>
          </div>

          <Button onClick={onClose} className="w-full">
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
