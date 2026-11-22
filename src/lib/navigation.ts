import type { ComponentType } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Eye,
  Wallet,
  TrendingDown,
  TrendingUp,
  LineChart,
  Settings,
  Download,
  Sparkles,
  Target,
  Split,
  Users,
  Handshake,
  Crown,
} from 'lucide-react';

/**
 * Single source of truth for app navigation.
 * Both the desktop sidebar and the mobile bottom nav read from here, so the
 * two can no longer drift apart.
 */

export type NavItem = {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Name of the matching row in `app_modules` (live / tier gating). */
  module: string;
};

export type SettingsNavItem = NavItem & {
  adminOnly: boolean;
  /** Hidden inside the installed iOS/Android app (e.g. PWA install help). */
  webOnly?: boolean;
};

/** The single primary destination, always visible. */
export const HOME_ITEM: NavItem = { path: '/', label: 'Home', icon: LayoutDashboard, module: 'dashboard' };

/** Everything else, grouped into a few clear sections. */
export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Money',
    items: [
      { path: '/income', label: 'Income', icon: DollarSign, module: 'income' },
      { path: '/expenses', label: 'Expenses', icon: Receipt, module: 'expenses' },
      { path: '/budget', label: 'Budget', icon: Wallet, module: 'budget' },
      { path: '/debt', label: 'Debt', icon: TrendingDown, module: 'debt' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { path: '/savings', label: 'Savings Goals', icon: Target, module: 'savings' },
      { path: '/investments', label: 'Investments', icon: TrendingUp, module: 'investments' },
      { path: '/trends', label: 'Trends', icon: LineChart, module: 'trends' },
    ],
  },
  {
    label: 'Community',
    items: [
      { path: '/social', label: 'Social', icon: Users, module: 'social' },
      { path: '/split', label: 'Split Expenses', icon: Split, module: 'split' },
      { path: '/partners', label: 'Partners', icon: Handshake, module: 'partners' },
    ],
  },
  {
    label: 'More',
    items: [
      { path: '/ai-tools', label: 'AI Tools', icon: Sparkles, module: 'ai_tools' },
      { path: '/membership', label: 'Membership', icon: Crown, module: 'membership' },
    ],
  },
];

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { path: '/my-access', label: 'My Access', icon: Eye, module: 'my_access', adminOnly: false },
  { path: '/users', label: 'User Management', icon: Users, module: 'users', adminOnly: true },
  { path: '/admin', label: 'Settings', icon: Settings, module: 'admin', adminOnly: false },
  { path: '/install', label: 'Install App', icon: Download, module: 'install', adminOnly: false, webOnly: true },
];

/**
 * Paths pinned as tabs in the mobile bottom bar (besides Home).
 * Everything else appears, grouped, in the bar's "More" menu.
 */
export const MOBILE_TAB_PATHS = ['/income', '/expenses', '/social'];
