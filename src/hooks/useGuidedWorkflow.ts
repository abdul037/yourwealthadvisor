import { useState, useCallback, useEffect } from 'react';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector to highlight
  action?: 'click' | 'input' | 'select';
  validation?: () => boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

const WORKFLOWS: Record<string, Workflow> = {
  'first-budget': {
    id: 'first-budget',
    name: 'Create Your First Budget',
    description: 'Learn how to set up a budget to track your spending',
    steps: [
      {
        id: 'budget-intro',
        title: 'Welcome to Budgeting!',
        description: 'Budgets help you control spending. Let\'s create your first one.',
      },
      {
        id: 'open-dialog',
        title: 'Open Budget Form',
        description: 'Click the "Add Budget" button to start.',
        target: '[data-tour="add-budget"]',
        action: 'click'
      },
      {
        id: 'select-category',
        title: 'Choose a Category',
        description: 'Select a spending category like Food & Dining or Transportation.',
        target: '[data-tour="budget-category"]',
        action: 'select'
      },
      {
        id: 'set-amount',
        title: 'Set Your Budget',
        description: 'Enter how much you want to spend this month. Tip: Check your past spending first!',
        target: '[data-tour="budget-amount"]',
        action: 'input'
      },
      {
        id: 'save-budget',
        title: 'Save & Track',
        description: 'Click Save. We\'ll now track your spending and alert you when you\'re close to the limit.',
        target: '[data-tour="budget-save"]',
        action: 'click'
      }
    ]
  },
  'first-split-group': {
    id: 'first-split-group',
    name: 'Create a Split Group',
    description: 'Learn how to split expenses with friends and family',
    steps: [
      {
        id: 'split-intro',
        title: 'Splitting Made Easy',
        description: 'Split groups let you share expenses fairly. Perfect for trips, roommates, or dinners!',
      },
      {
        id: 'create-group',
        title: 'Create Your Group',
        description: 'Give your group a name - like "Roommates" or "Beach Trip".',
        target: '[data-tour="create-group"]',
        action: 'click'
      },
      {
        id: 'add-members',
        title: 'Add Members',
        description: 'Add everyone who will be splitting costs. You can invite them via link or email.',
        target: '[data-tour="add-members"]',
        action: 'click'
      },
      {
        id: 'add-expense',
        title: 'Log an Expense',
        description: 'When someone pays for something, log it here. Select who paid and how to split.',
        target: '[data-tour="add-expense"]',
        action: 'click'
      },
      {
        id: 'view-balances',
        title: 'Check Balances',
        description: 'See who owes whom. When ready, settle up to clear all debts!',
        target: '[data-tour="balances"]',
        action: 'click'
      }
    ]
  },
  'first-goal': {
    id: 'first-goal',
    name: 'Set a Savings Goal',
    description: 'Learn how to set and track savings goals',
    steps: [
      {
        id: 'goal-intro',
        title: 'Goal-Based Saving',
        description: 'Goals give your savings purpose. What are you saving for?',
      },
      {
        id: 'add-goal',
        title: 'Add a Goal',
        description: 'Click to create your first savings goal.',
        target: '[data-tour="add-goal"]',
        action: 'click'
      },
      {
        id: 'name-goal',
        title: 'Name Your Goal',
        description: 'Give it a clear name - "Emergency Fund", "New Car", or "Vacation".',
        target: '[data-tour="goal-name"]',
        action: 'input'
      },
      {
        id: 'set-target',
        title: 'Set Target Amount',
        description: 'How much do you need to save? Enter your target.',
        target: '[data-tour="goal-amount"]',
        action: 'input'
      },
      {
        id: 'set-deadline',
        title: 'Choose a Deadline',
        description: 'When do you want to reach this goal? We\'ll calculate monthly savings needed.',
        target: '[data-tour="goal-date"]',
        action: 'input'
      }
    ]
  }
};

const STORAGE_KEY = 'tharwa_completed_workflows';

export function useGuidedWorkflow() {
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedWorkflows, setCompletedWorkflows] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedWorkflows(JSON.parse(stored));
      }
    } catch {
      // Ignore
    }
  }, []);

  const startWorkflow = useCallback((workflowId: string) => {
    if (WORKFLOWS[workflowId]) {
      setActiveWorkflowId(workflowId);
      setCurrentStepIndex(0);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!activeWorkflowId) return;
    
    const workflow = WORKFLOWS[activeWorkflowId];
    if (currentStepIndex < workflow.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeWorkflow();
    }
  }, [activeWorkflowId, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const completeWorkflow = useCallback(() => {
    if (activeWorkflowId && !completedWorkflows.includes(activeWorkflowId)) {
      const updated = [...completedWorkflows, activeWorkflowId];
      setCompletedWorkflows(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setActiveWorkflowId(null);
    setCurrentStepIndex(0);
  }, [activeWorkflowId, completedWorkflows]);

  const skipWorkflow = useCallback(() => {
    setActiveWorkflowId(null);
    setCurrentStepIndex(0);
  }, []);

  const resetWorkflows = useCallback(() => {
    setCompletedWorkflows([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isActive = activeWorkflowId !== null;
  const activeWorkflow = activeWorkflowId ? WORKFLOWS[activeWorkflowId] : null;
  const currentStep = activeWorkflow?.steps[currentStepIndex] || null;

  return {
    isActive,
    activeWorkflow,
    currentStep,
    currentStepIndex,
    totalSteps: activeWorkflow?.steps.length || 0,
    startWorkflow,
    nextStep,
    prevStep,
    skipWorkflow,
    completeWorkflow,
    resetWorkflows,
    completedWorkflows,
    availableWorkflows: Object.values(WORKFLOWS),
    isWorkflowCompleted: (workflowId: string) => completedWorkflows.includes(workflowId)
  };
}
