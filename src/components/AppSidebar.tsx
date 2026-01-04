import { 
  LayoutDashboard, 
  DollarSign, 
  Receipt, 
  Wallet, 
  TrendingDown, 
  LineChart, 
  Shield,
  TrendingUp,
  Download,
  Sparkles,
  Target
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
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

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/income', label: 'Income', icon: DollarSign },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/budget', label: 'Budget', icon: Wallet },
  { path: '/debt', label: 'Debt', icon: TrendingDown },
  { path: '/savings', label: 'Savings Goals', icon: Target },
  { path: '/trends', label: 'Trends', icon: LineChart },
  { path: '/ai-tools', label: 'AI Tools', icon: Sparkles },
];

const settingsNavItems = [
  { path: '/admin', label: 'Admin Portal', icon: Shield },
  { path: '/install', label: 'Install App', icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" data-tour="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight truncate">Tharwa Net</h1>
              <p className="text-[10px] text-muted-foreground">Your Personalized Wealth Manager</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
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
              Family of 4 in Dubai
            </p>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
