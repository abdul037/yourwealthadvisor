import { PageHeader } from '@/components/PageHeader';
import { AccessOverview } from '@/components/access/AccessOverview';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

export default function MyAccess() {
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
