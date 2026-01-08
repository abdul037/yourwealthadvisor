import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGuidedWorkflow } from '@/hooks/useGuidedWorkflow';
import { cn } from '@/lib/utils';

export function GuidedWorkflow() {
  const {
    isActive,
    activeWorkflow,
    currentStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    prevStep,
    skipWorkflow
  } = useGuidedWorkflow();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const findTarget = () => {
      const element = document.querySelector(currentStep.target!);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };

    findTarget();
    const interval = setInterval(findTarget, 500);
    
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget);
    };
  }, [currentStep]);

  if (!isActive || !activeWorkflow || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    // Try to position below the target
    let top = targetRect.bottom + padding;
    let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);

    // Adjust if off-screen
    if (top + tooltipHeight > window.innerHeight) {
      top = targetRect.top - tooltipHeight - padding;
    }
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    return { top: `${top}px`, left: `${left}px` };
  };

  const content = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Spotlight cutout */}
      {targetRect && (
        <div
          className="absolute rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-background transition-all duration-300"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className={cn(
          "fixed w-80 shadow-2xl border-primary/20 animate-in fade-in slide-in-from-bottom-4",
          "bg-background/95 backdrop-blur-sm"
        )}
        style={getTooltipStyle()}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {activeWorkflow.name}
              </p>
              <Progress value={progress} className="h-1.5 w-24" />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 -mr-2"
              onClick={skipWorkflow}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step Content */}
          <div className="space-y-2">
            <h4 className="font-semibold">{currentStep.title}</h4>
            <p className="text-sm text-muted-foreground">
              {currentStep.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevStep}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                size="sm"
                onClick={nextStep}
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Done
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return createPortal(content, document.body);
}

// WorkflowTrigger component to start workflows from anywhere
interface WorkflowTriggerProps {
  workflowId: string;
  children: React.ReactNode;
  className?: string;
}

export function WorkflowTrigger({ workflowId, children, className }: WorkflowTriggerProps) {
  const { startWorkflow, isWorkflowCompleted } = useGuidedWorkflow();
  
  const completed = isWorkflowCompleted(workflowId);

  return (
    <button
      onClick={() => startWorkflow(workflowId)}
      className={cn(
        "inline-flex items-center gap-1 text-primary hover:underline text-sm",
        completed && "text-muted-foreground",
        className
      )}
    >
      {children}
      {completed && <CheckCircle className="w-3 h-3" />}
    </button>
  );
}
