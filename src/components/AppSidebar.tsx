import { useMemo } from 'react';
import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  Wallet, 
  TrendingDown, 
  LineChart, 
  Shield,
  Download,
  Sparkles,
  Target,
  Split,
  Users,
  Handshake,
  Crown,
  Lock,
  Box
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Wallet,
  TrendingDown,
  Target,
  LineChart,
  Users,
  Split,
  Handshake,
  Sparkles,
  Crown,
  Shield,
  Download,
  Box,
};

// Fallback for modules not yet in database
const STATIC_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { path: '/income', label: 'Income', icon: DollarSign, module: 'income' },
  { path: '/expenses', label: 'Expenses', icon: Receipt, module: 'expenses' },
  { path: '/budget', label: 'Budget', icon: Wallet, module: 'budget' },
  { path: '/debt', label: 'Debt', icon: TrendingDown, module: 'debt' },
  { path: '/savings', label: 'Savings Goals', icon: Target, module: 'savings' },
  { path: '/social', label: 'Social', icon: Users, module: 'social' },
  { path: '/split', label: 'Split Expenses', icon: Split, module: 'split' },
  { path: '/partners', label: 'Partners', icon: Handshake, module: 'partners' },
  { path: '/membership', label: 'Membership', icon: Crown, module: 'membership' },
  { path: '/trends', label: 'Trends', icon: LineChart, module: 'trends' },
  { path: '/ai-tools', label: 'AI Tools', icon: Sparkles, module: 'ai_tools' },
];

const SETTINGS_NAV_ITEMS = [
  { path: '/users', label: 'User Access', icon: Users, module: 'users', adminOnly: true },
  { path: '/admin', label: 'Admin Portal', icon: Shield, module: 'admin' },
  { path: '/install', label: 'Install App', icon: Download, module: 'install' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';
  const { modules, isModuleLive, canAccessModule, loading } = useAppModules();
  const { isAdmin } = useUserRole();

  const isActive = (path: string) => location.pathname === path;

  // Build navigation items based on modules from DB
  const mainNavItems = useMemo(() => {
    return STATIC_NAV_ITEMS.map(item => {
      const dbModule = modules.find(m => m.name === item.module);
      const isLive = dbModule ? dbModule.is_live : true;
      const hasAccess = canAccessModule(item.module);
      const requiredTier = dbModule?.required_tier || 'free';
      
      return {
        ...item,
        isLive,
        hasAccess,
        requiredTier,
      };
    }).filter(item => item.isLive || isAdmin); // Admins see all, users see only live
  }, [modules, canAccessModule, isAdmin]);

  const settingsNavItems = useMemo(() => {
    return SETTINGS_NAV_ITEMS.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      return true;
    });
  }, [isAdmin]);

  const handleNavClick = (e: React.MouseEvent, item: typeof mainNavItems[0]) => {
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
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
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
                                DRAFT
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
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
