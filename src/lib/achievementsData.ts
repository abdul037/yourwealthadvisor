import { 
  Trophy, 
  Target, 
  Flame, 
  Sparkles, 
  Users, 
  Shield, 
  Zap,
  Star,
  Crown,
  Rocket,
  Heart,
  Award
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  points: number;
  category: 'getting_started' | 'consistency' | 'milestones' | 'mastery';
  condition: {
    type: 'transaction_count' | 'budget_created' | 'goal_created' | 'streak' | 'debt_paid' | 'emergency_fund' | 'ai_used' | 'split_settled' | 'first_transaction' | 'first_budget' | 'first_goal';
    value?: number;
  };
}

export const achievements: Achievement[] = [
  // Getting Started
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Add your first transaction',
    icon: Rocket,
    points: 10,
    category: 'getting_started',
    condition: { type: 'first_transaction' }
  },
  {
    id: 'budget_beginner',
    name: 'Budget Beginner',
    description: 'Create your first budget',
    icon: Target,
    points: 20,
    category: 'getting_started',
    condition: { type: 'first_budget' }
  },
  {
    id: 'goal_getter',
    name: 'Goal Getter',
    description: 'Set your first savings goal',
    icon: Star,
    points: 20,
    category: 'getting_started',
    condition: { type: 'first_goal' }
  },
  {
    id: 'ai_explorer',
    name: 'AI Explorer',
    description: 'Use AI to categorize a transaction',
    icon: Sparkles,
    points: 15,
    category: 'getting_started',
    condition: { type: 'ai_used' }
  },
  
  // Consistency
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day activity streak',
    icon: Flame,
    points: 50,
    category: 'consistency',
    condition: { type: 'streak', value: 7 }
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Maintain a 30-day activity streak',
    icon: Crown,
    points: 150,
    category: 'consistency',
    condition: { type: 'streak', value: 30 }
  },
  
  // Milestones
  {
    id: 'ten_tracker',
    name: 'Ten Tracker',
    description: 'Log 10 transactions',
    icon: Zap,
    points: 25,
    category: 'milestones',
    condition: { type: 'transaction_count', value: 10 }
  },
  {
    id: 'fifty_fanatic',
    name: 'Fifty Fanatic',
    description: 'Log 50 transactions',
    icon: Trophy,
    points: 75,
    category: 'milestones',
    condition: { type: 'transaction_count', value: 50 }
  },
  {
    id: 'century_champion',
    name: 'Century Champion',
    description: 'Log 100 transactions',
    icon: Award,
    points: 150,
    category: 'milestones',
    condition: { type: 'transaction_count', value: 100 }
  },
  
  // Mastery
  {
    id: 'split_master',
    name: 'Split Master',
    description: 'Complete your first split settlement',
    icon: Users,
    points: 30,
    category: 'mastery',
    condition: { type: 'split_settled' }
  },
  {
    id: 'emergency_ready',
    name: 'Emergency Ready',
    description: 'Reach 100% of your emergency fund goal',
    icon: Shield,
    points: 100,
    category: 'mastery',
    condition: { type: 'emergency_fund' }
  },
  {
    id: 'debt_crusher',
    name: 'Debt Crusher',
    description: 'Pay off a debt completely',
    icon: Heart,
    points: 75,
    category: 'mastery',
    condition: { type: 'debt_paid' }
  }
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: Achievement['category']): Achievement[] => {
  return achievements.filter(a => a.category === category);
};

export const calculateLevel = (points: number): { level: number; title: string; nextLevelPoints: number } => {
  const levels = [
    { min: 0, level: 1, title: 'Beginner' },
    { min: 50, level: 2, title: 'Explorer' },
    { min: 150, level: 3, title: 'Tracker' },
    { min: 300, level: 4, title: 'Planner' },
    { min: 500, level: 5, title: 'Saver' },
    { min: 750, level: 6, title: 'Expert' },
    { min: 1000, level: 7, title: 'Master' },
    { min: 1500, level: 8, title: 'Champion' },
    { min: 2000, level: 9, title: 'Legend' },
    { min: 3000, level: 10, title: 'Tharwa Elite' }
  ];
  
  let currentLevel = levels[0];
  let nextLevel = levels[1];
  
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].min) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
    }
  }
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints: nextLevel.min
  };
};
