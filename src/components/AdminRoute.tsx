import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { AccessDenied } from './AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, loading } = useUserRole();

  if (loading) {
    return (
      <div className="container py-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
