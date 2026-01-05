import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, ArrowRight, Utensils, Plane, PartyPopper, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { AppLayout } from '@/components/AppLayout';
import { useExpenseGroups } from '@/hooks/useExpenseGroups';
import { format } from 'date-fns';

const categoryIcons: Record<string, React.ElementType> = {
  trip: Plane,
  food: Utensils,
  party: PartyPopper,
  shopping: ShoppingBag,
  other: Users,
};

const categoryColors: Record<string, string> = {
  trip: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  food: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  party: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  shopping: 'bg-green-500/10 text-green-500 border-green-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function SplitExpenses() {
  const { groups, isLoading, createGroup } = useExpenseGroups();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    category: 'other',
    currency: 'AED',
  });

  const handleCreate = async () => {
    if (!newGroup.name.trim()) return;
    await createGroup.mutateAsync(newGroup);
    setIsCreateOpen(false);
    setNewGroup({ name: '', description: '', category: 'other', currency: 'AED' });
  };

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader 
            title="Split Expenses" 
            description="Split bills with friends for trips, dinners, and outings"
          />
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Split Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Dubai Trip, Team Lunch"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this group for?"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newGroup.category} onValueChange={(v) => setNewGroup({ ...newGroup, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trip">🛫 Trip</SelectItem>
                        <SelectItem value="food">🍽️ Food & Dining</SelectItem>
                        <SelectItem value="party">🎉 Party</SelectItem>
                        <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                        <SelectItem value="other">📋 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={newGroup.currency} onValueChange={(v) => setNewGroup({ ...newGroup, currency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="PKR">PKR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={!newGroup.name.trim() || createGroup.isPending}
                >
                  {createGroup.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No split groups yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create a group to start splitting expenses with friends
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => {
              const Icon = categoryIcons[group.category] || Users;
              return (
                <Link key={group.id} to={`/split/${group.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${categoryColors[group.category]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        {group.is_settled && (
                          <Badge variant="secondary">Settled</Badge>
                        )}
                      </div>
                      <CardTitle className="mt-3">{group.name}</CardTitle>
                      {group.description && (
                        <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(group.created_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1 text-primary">
                          View <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
