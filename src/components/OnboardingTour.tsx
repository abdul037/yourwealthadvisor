import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useOnboardingTour, TourStep } from '@/hooks/useOnboardingTour';
import { cn } from '@/lib/utils';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

function TourTooltip({ 
  step, 
  onNext, 
  onPrev, 
  onSkip, 
  currentIndex, 
  totalSteps 
}: { 
  step: TourStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalSteps: number;
}) {
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculatePosition = () => {
      const target = document.querySelector(step.target);
      if (!target || !tooltipRef.current) return;

      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const padding = 16;

      let top = 0;
      let left = 0;
      let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

      switch (step.position || 'bottom') {
        case 'top':
          top = targetRect.top - tooltipRect.height - padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrowPosition = 'bottom';
          break;
        case 'bottom':
          top = targetRect.bottom + padding;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrowPosition = 'top';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - padding;
          arrowPosition = 'right';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + padding;
          arrowPosition = 'left';
          break;
      }

      // Keep tooltip within viewport
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      setPosition({ top, left, arrowPosition });

      // Highlight target element
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Initial calculation
    const timer = setTimeout(calculatePosition, 100);
    
    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [step]);

  const isLastStep = currentIndex === totalSteps - 1;
  const isFirstStep = currentIndex === 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onSkip} />
      
      {/* Spotlight on target */}
      <TargetHighlight selector={step.target} />

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className={cn(
          "fixed z-[10000] w-[calc(100vw-2rem)] sm:w-80 max-w-sm shadow-2xl border-primary/20 bg-card",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        }
      >
        {/* Arrow */}
        {position && (
          <div
            className={cn(
              "absolute w-3 h-3 bg-card border rotate-45",
              position.arrowPosition === 'top' && "-top-1.5 left-1/2 -translate-x-1/2 border-l border-t",
              position.arrowPosition === 'bottom' && "-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b",
              position.arrowPosition === 'left' && "-left-1.5 top-1/2 -translate-y-1/2 border-l border-b",
              position.arrowPosition === 'right' && "-right-1.5 top-1/2 -translate-y-1/2 border-r border-t"
            )}
          />
        )}

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-primary">
              {step.title}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= currentIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">{step.description}</p>
        </CardContent>

        <CardFooter className="flex justify-between pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrev}
            disabled={isFirstStep}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          <span className="text-xs text-muted-foreground">
            {currentIndex + 1} / {totalSteps}
          </span>

          <Button
            size="sm"
            onClick={onNext}
            className="gap-1"
          >
            {isLastStep ? 'Finish' : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

function TargetHighlight({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const target = document.querySelector(selector);
      if (target) {
        setRect(target.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-[9999] rounded-lg ring-4 ring-primary/50 ring-offset-2 ring-offset-background pointer-events-none"
      style={{
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
      }}
    />
  );
}

export function OnboardingTour() {
  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  } = useOnboardingTour();

  const [targetExists, setTargetExists] = useState(false);

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setTargetExists(false);
      return;
    }

    // Check if target exists, with a small delay to allow DOM to render
    const checkTarget = () => {
      const target = document.querySelector(currentStepData.target);
      setTargetExists(!!target);
    };

    const timer = setTimeout(checkTarget, 100);
    return () => clearTimeout(timer);
  }, [isActive, currentStepData]);

  // Don't render anything if tour is not active or target doesn't exist
  // This prevents blocking the UI - user can restart tour later
  if (!isActive || !currentStepData || !targetExists) return null;

  return createPortal(
    <TourTooltip
      step={currentStepData}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      currentIndex={currentStep}
      totalSteps={totalSteps}
    />,
    document.body
  );
}

export function TourRestartButton() {
  const { resetTour } = useOnboardingTour();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={resetTour}
      className="text-muted-foreground w-9 h-9"
      title="Start guided tour"
    >
      <HelpCircle className="w-5 h-5" />
    </Button>
  );
}
