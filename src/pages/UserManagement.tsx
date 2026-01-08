import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { UserList } from '@/components/admin/UserList';
import { ModuleManager } from '@/components/admin/ModuleManager';
import { AccessOverview } from '@/components/access/AccessOverview';
import { Shield, Users, Box, Eye, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserManagement() {
  const { isAdmin, isModerator, loading, roles } = useUserRole();

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  // Admin view
  if (isAdmin) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="User Management" 
            description="Manage users, roles, and application modules"
          />
          <Badge variant="destructive" className="gap-1">
            <Shield className="w-3 h-3" />
            Admin
          </Badge>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Box className="w-4 h-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="my-access" className="gap-2">
              <Eye className="w-4 h-4" />
              My Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserList />
          </TabsContent>

          <TabsContent value="modules">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="w-5 h-5" />
                  Module Configuration
                </CardTitle>
                <CardDescription>
                  Control which features are live and their required subscription tiers
                </CardDescription>
              </CardHeader>
            </Card>
            <ModuleManager />
          </TabsContent>

          <TabsContent value="my-access">
            <AccessOverview />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Moderator view (limited admin access)
  if (isModerator) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="User Access" 
            description="View your access level and available features"
          />
          <Badge variant="secondary" className="gap-1">
            <Shield className="w-3 h-3" />
            Moderator
          </Badge>
        </div>

        <Tabs defaultValue="my-access" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-access" className="gap-2">
              <Eye className="w-4 h-4" />
              My Access
            </TabsTrigger>
            <TabsTrigger value="modules" className="gap-2">
              <Box className="w-4 h-4" />
              Modules (View Only)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-access">
            <AccessOverview />
          </TabsContent>

          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle>Module Overview</CardTitle>
                <CardDescription>
                  View all application modules (read-only for moderators)
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="mt-4 opacity-75 pointer-events-none">
              <ModuleManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Regular user view
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="My Access" 
          description="View your subscription features and access level"
        />
        <Badge variant="outline" className="gap-1">
          <Crown className="w-3 h-3" />
          Member
        </Badge>
      </div>

      <AccessOverview />
    </div>
  );
}
