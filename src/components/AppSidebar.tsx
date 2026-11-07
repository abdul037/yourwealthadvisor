import { useMemo, useState } from 'react';
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
  Lock,
  ChevronRight,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { TharwaLogo } from '@/components/TharwaLogo';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppModules } from '@/hooks/useAppModules';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

type NavItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
};

// The single primary destination, always visible at the top.
const HOME_ITEM: NavItem = { path: '/', label: 'Home', icon: LayoutDashboard, module: 'dashboard' };

// The long flat list is collapsed into a few clear sections so the sidebar
// shows ~5 entries by default instead of 13.
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
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

const SETTINGS_NAV_ITEMS = [
  { path: '/my-access', label: 'My Access', icon: Eye, module: 'my_access', adminOnly: false },
  { path: '/users', label: 'User Management', icon: Users, module: 'users', adminOnly: true },
  { path: '/admin', label: 'Settings', icon: Settings, module: 'admin', adminOnly: false },
  { path: '/install', label: 'Install App', icon: Download, module: 'install', adminOnly: false },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';
  const { modules, isModuleLive, canAccessModule, loading } = useAppModules();
  const { isAdmin } = useUserRole();

  const isActive = (path: string) => location.pathname === path;

  // Enrich a nav item with its live/access/tier state from the module config.
  const enrich = (item: NavItem) => {
    const dbModule = modules.find(m => m.name === item.module);
    const isLive = dbModule ? dbModule.is_live : true;
    const hasAccess = canAccessModule(item.module);
    const requiredTier = dbModule?.required_tier || 'free';
    return { ...item, isLive, hasAccess, requiredTier };
  };

  type EnrichedItem = ReturnType<typeof enrich>;

  // Only keep items that are live (admins see everything).
  const groups = useMemo(() => {
    return NAV_GROUPS
      .map(group => ({
        label: group.label,
        items: group.items.map(enrich).filter(item => item.isLive || isAdmin),
      }))
      .filter(group => group.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, canAccessModule, isAdmin]);

  const homeItem = useMemo(() => enrich(HOME_ITEM), [modules, canAccessModule, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  const settingsNavItems = useMemo(() => {
    return SETTINGS_NAV_ITEMS.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      return true;
    });
  }, [isAdmin]);

  // Open the group that contains the active route by default; keep the rest closed.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach(group => {
      initial[group.label] = group.items.some(item => item.path === location.pathname);
    });
    return initial;
  });

  const handleNavClick = (e: React.MouseEvent, item: EnrichedItem) => {
    if (!item.hasAccess && !isAdmin) {
      e.preventDefault();
      navigate('/membership');
    }
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'free') return null;
    return (
      <Badge
        variant="outline"
        className={`text-[10px] px-1 py-0 ${
          tier === 'premium' ? 'border-purple-500/50 text-purple-400' : 'border-blue-500/50 text-blue-400'
        }`}
      >
        {tier === 'premium' ? 'PRO' : 'PLUS'}
      </Badge>
    );
  };

  const renderNavItem = (item: EnrichedItem) => {
    const showLock = !item.hasAccess && !isAdmin;
    const IconComponent = item.icon;

    return (
      <SidebarMenuItem key={item.path}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarMenuButton
              asChild
              isActive={isActive(item.path)}
              tooltip={item.label}
              className={showLock ? 'opacity-60' : ''}
            >
              <NavLink
                to={item.path}
                className="flex items-center gap-3"
                activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                onClick={(e) => handleNavClick(e, item)}
              >
                <div className="relative">
                  <IconComponent className="w-4 h-4" />
                  {showLock && (
                    <Lock className="w-2.5 h-2.5 absolute -top-1 -right-1 text-muted-foreground" />
                  )}
                </div>
                <span className="flex-1">{item.label}</span>
                {!collapsed && getTierBadge(item.requiredTier)}
                {!item.isLive && isAdmin && !collapsed && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-500/50 text-amber-400">
                    UNPUBLISHED
                  </Badge>
                )}
              </NavLink>
            </SidebarMenuButton>
          </TooltipTrigger>
          {showLock && (
            <TooltipContent side="right">
              <p>Requires {item.requiredTier} tier</p>
            </TooltipContent>
          )}
        </Tooltip>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" data-tour="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="px-2 py-2">
          <TharwaLogo
            size={collapsed ? 'sm' : 'md'}
            variant={collapsed ? 'icon-only' : 'full'}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary: Home */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItem(homeItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapsible sections */}
        {groups.map(group => {
          // In icon-rail mode, always show the items (no labels to click).
          const open = collapsed ? true : (openGroups[group.label] ?? false);
          return (
            <Collapsible
              key={group.label}
              open={open}
              onOpenChange={(o) => setOpenGroups(prev => ({ ...prev, [group.label]: o }))}
            >
              <SidebarGroup>
                {!collapsed && (
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label cursor-pointer hover:text-sidebar-accent-foreground">
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map(renderNavItem)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.label}
                  >
                    <NavLink
                      to={item.path}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      data-tour={item.path === '/admin' ? 'admin-portal' : undefined}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-2">
          {!collapsed && (
            <p className="text-[10px] text-muted-foreground text-center">
              © 2026 Tharwa Net
            </p>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
