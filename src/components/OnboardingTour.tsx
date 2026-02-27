import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useOnboardingTour, TourStep } from '@/hooks/useOnboardingTour';
import { NaylaMascot } from '@/components/NaylaMascot';
import { cn } from '@/lib/utils';

/** Glowing ring around the current tour target */
function TargetHighlight({ selector }: { selector: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(selector);
      if (el) setRect(el.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [selector]);

  if (!rect) return null;

  return (
    <div
      className="fixed z-[9999] rounded-xl ring-4 ring-primary/60 ring-offset-2 ring-offset-background pointer-events-none"
      style={{
        top:    rect.top    - 6,
        left:   rect.left   - 6,
        width:  rect.width  + 12,
        height: rect.height + 12,
      }}
    />
  );
}

/** Mascot + speech bubble rendered fixed at the bottom-left */
function MascotTooltip({
  step, onNext, onPrev, onSkip, currentIndex, totalSteps,
}: {
  step: TourStep;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalSteps: number;
}) {
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === totalSteps - 1;
  const [finishing, setFinishing] = useState(false);

  // Scroll the highlighted target into view
  useEffect(() => {
    const el = document.querySelector(step.target);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [step]);

  const handleNext = () => {
    if (isLast) {
      setFinishing(true);
      setTimeout(onNext, 1100); // brief celebrate before closing
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Dark overlay — click to dismiss */}
      <div className="fixed inset-0 bg-black/55 z-[9998]" onClick={onSkip} />

      {/* Target spotlight */}
      <TargetHighlight selector={step.target} />

      {/* Mascot + speech bubble — fixed bottom-left */}
      <div className="fixed bottom-5 left-4 z-[10000] flex items-end gap-3 animate-in slide-in-from-bottom-4 fade-in duration-300">

        {/* Animated coin mascot */}
        <NaylaMascot
          state={finishing ? 'celebrating' : 'talking'}
          size="md"
          className="flex-shrink-0 drop-shadow-lg"
        />

        {/* Speech bubble */}
        <div className="relative bg-card border border-border/80 rounded-2xl rounded-bl-none shadow-2xl p-4 w-64 sm:w-72">
          {/* Tail — points left toward mascot */}
          <div className="absolute -left-2 bottom-4 w-4 h-4 bg-card border-l border-b border-border/80 rotate-45" />

          {/* Close */}
          <button
            onClick={onSkip}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Step title */}
          <p className="text-sm font-semibold text-primary pr-5 mb-1 leading-snug">
            {step.title}
          </p>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            {step.description}
          </p>

          {/* Footer: dots + nav */}
          <div className="flex items-center justify-between gap-2">
            {/* Progress dots */}
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-300',
                    i === currentIndex ? 'bg-primary w-3' : 'bg-muted',
                  )}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-1.5">
              {!isFirst && (
                <Button
                  variant="ghost" size="sm"
                  onClick={onPrev}
                  className="h-7 px-2 text-xs gap-0.5"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="h-7 px-3 text-xs gap-0.5"
              >
                {isLast ? '🎉 Done!' : 'Next'}
                {!isLast && <ChevronRight className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
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
  } = useOnboardingTour();

  const [targetExists, setTargetExists] = useState(false);

  useEffect(() => {
    if (!isActive || !currentStepData) { setTargetExists(false); return; }
    const timer = setTimeout(() => {
      setTargetExists(!!document.querySelector(currentStepData.target));
    }, 100);
    return () => clearTimeout(timer);
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData || !targetExists) return null;

  return createPortal(
    <MascotTooltip
      step={currentStepData}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      currentIndex={currentStep}
      totalSteps={totalSteps}
    />,
    document.body,
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
