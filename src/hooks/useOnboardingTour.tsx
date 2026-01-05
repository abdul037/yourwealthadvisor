import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    path: string;
  };
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: '[data-tour="welcome"]',
    title: 'Welcome to Tharwa Net! 👋',
    description: "Let's get you set up in just 2 minutes. We'll walk you through adding your first income, expense, and budget.",
    position: 'bottom',
  },
  {
    id: 'add-transaction',
    target: '[data-tour="add-transaction"]',
    title: 'Step 1: Add Your First Transaction',
    description: 'Start by logging an income or expense. Click the + button to record your first transaction!',
    position: 'top',
  },
  {
    id: 'quick-nav',
    target: '[data-tour="quick-nav"]',
    title: 'Step 2: Explore Key Sections',
    description: 'Jump to Income, Expenses, Budget, or Debt tracking. Try adding data to each section!',
    position: 'top',
    action: { label: 'Go to Income', path: '/income' },
  },
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Step 3: Full Navigation',
    description: 'Access all sections including Trends analysis, Savings Goals, and AI Tools from the sidebar.',
    position: 'right',
  },
  {
    id: 'net-worth',
    target: '[data-tour="net-worth"]',
    title: 'Track Your Progress',
    description: 'Your net worth updates automatically as you add assets, income, and debts. Watch it grow!',
    position: 'bottom',
  },
  {
    id: 'admin-portal',
    target: '[data-tour="admin-portal"]',
    title: 'Advanced Setup (Optional)',
    description: 'Configure partners, bulk import data, and customize categories in the Admin Portal.',
    position: 'right',
    action: { label: 'Open Admin Portal', path: '/admin' },
  },
];

const STORAGE_KEY = 'wealth-tracker-tour-completed';

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TourStep | undefined;
  steps: TourStep[];
  hasCompleted: boolean;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === 'true') {
      setHasCompleted(true);
      return;
    }
    
    setHasCompleted(false);
    
    // Auto-start tour for first-time users after page is fully loaded
    const startTourWhenReady = () => {
      // Wait for first tour target to exist before starting
      const checkAndStart = () => {
        const firstTarget = document.querySelector(TOUR_STEPS[0].target);
        if (firstTarget) {
          setIsActive(true);
        } else {
          // Retry after a short delay if target not yet rendered
          setTimeout(checkAndStart, 500);
        }
      };
      
      // Start checking after initial render
      setTimeout(checkAndStart, 1000);
    };
    
    if (document.readyState === 'complete') {
      startTourWhenReady();
    } else {
      window.addEventListener('load', startTourWhenReady);
      return () => window.removeEventListener('load', startTourWhenReady);
    }
  }, []);

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep, completeTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCompleted(false);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const value: TourContextType = {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    currentStepData: TOUR_STEPS[currentStep],
    steps: TOUR_STEPS,
    hasCompleted,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    resetTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useOnboardingTour() {
  const context = useContext(TourContext);
  if (!context) {
    // Return a safe default when used outside provider
    return {
      isActive: false,
      currentStep: 0,
      totalSteps: TOUR_STEPS.length,
      currentStepData: TOUR_STEPS[0],
      steps: TOUR_STEPS,
      hasCompleted: true,
      startTour: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipTour: () => {},
      completeTour: () => {},
      resetTour: () => {},
    };
  }
  return context;
}
