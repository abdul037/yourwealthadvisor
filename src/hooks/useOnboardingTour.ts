import { useState, useEffect, useCallback } from 'react';

export interface TourStep {
  id: string;
  target: string; // CSS selector
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    description: 'Access all main sections: Dashboard, Income, Expenses, Budget, Debt tracking, and Trends analysis.',
    position: 'right',
  },
  {
    id: 'currency',
    target: '[data-tour="currency"]',
    title: 'Currency Settings',
    description: 'Switch between currencies and convert amounts. Your preferred currency is saved automatically.',
    position: 'bottom',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    description: 'View alerts about budget limits, upcoming bills, and important financial updates.',
    position: 'bottom',
  },
  {
    id: 'net-worth',
    target: '[data-tour="net-worth"]',
    title: 'Net Worth Overview',
    description: 'See your total net worth at a glance, combining all assets and liabilities.',
    position: 'bottom',
  },
  {
    id: 'quick-nav',
    target: '[data-tour="quick-nav"]',
    title: 'Quick Actions',
    description: 'Jump directly to Income, Expenses, Budget, or Debt sections with one click.',
    position: 'top',
  },
  {
    id: 'add-transaction',
    target: '[data-tour="add-transaction"]',
    title: 'Add Transactions',
    description: 'Quickly log new income or expenses. Keep your finances up to date!',
    position: 'top',
  },
];

const STORAGE_KEY = 'wealth-tracker-tour-completed';

export function useOnboardingTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === 'true') {
      setHasCompleted(true);
    } else {
      // Auto-start tour for new users after a short delay
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
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
  }, [currentStep]);

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

  const completeTour = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasCompleted(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasCompleted(false);
    setCurrentStep(0);
  }, []);

  return {
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
}
