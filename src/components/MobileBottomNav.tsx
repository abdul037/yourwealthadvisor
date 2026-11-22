import { Fragment, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { useAppModules } from '@/hooks/useAppModules';
import { HOME_ITEM, NAV_GROUPS, SETTINGS_NAV_ITEMS, MOBILE_TAB_PATHS, NavItem } from '@/lib/navigation';
import { isNativeApp } from '@/lib/native';

/**
 * Phone navigation: Home + three pinned tabs, and a "More" menu that mirrors
 * the desktop sidebar's sections so every destination is reachable.
 */
export function MobileBottomNav() {
  const location = useLocation();
  const { isAdmin } = useUserRole();
  const { modules } = useAppModules();

  const isActive = (path: string) => location.pathname === path;

  const { tabs, moreGroups } = useMemo(() => {
    // Same rule as the sidebar: hide modules that are not live, except for admins.
    const isVisible = (item: NavItem) => {
      const dbModule = modules.find(m => m.name === item.module);
      return (dbModule ? dbModule.is_live : true) || isAdmin;
    };

    const allItems = NAV_GROUPS.flatMap(group => group.items);
    const pinned = MOBILE_TAB_PATHS
      .map(path => allItems.find(item => item.path === path))
      .filter((item): item is NavItem => !!item && isVisible(item));

    const groups = NAV_GROUPS
      .map(group => ({
        label: group.label,
        items: group.items.filter(item => !MOBILE_TAB_PATHS.includes(item.path) && isVisible(item)),
      }))
      .filter(group => group.items.length > 0);

    const settings = SETTINGS_NAV_ITEMS.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.webOnly && isNativeApp()) return false;
      return true;
    });

    return {
      tabs: [HOME_ITEM, ...pinned],
      moreGroups: [...groups, { label: 'Settings', items: settings as NavItem[] }],
    };
  }, [modules, isAdmin]);

  const isMoreActive = moreGroups.some(group => group.items.some(item => isActive(item.path)));

  const tabClass = (active: boolean) =>
    cn(
      'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
      active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((item) => (
          <Link key={item.path} to={item.path} className={tabClass(isActive(item.path))}>
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={tabClass(isMoreActive)} aria-label="More destinations">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            className="w-56 mb-2 bg-card border-border max-h-[70vh] overflow-y-auto"
          >
            {moreGroups.map((group, index) => (
              <Fragment key={group.label}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  {group.label}
                </DropdownMenuLabel>
                {group.items.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 cursor-pointer',
                        isActive(item.path) && 'text-primary font-medium'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
