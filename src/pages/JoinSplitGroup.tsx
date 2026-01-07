import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from '@/hooks/use-toast';

interface GroupMember {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
}

export default function JoinSplitGroup() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading: authLoading } = useUserProfile();
  
  const [group, setGroup] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [existingMembers, setExistingMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [nameConflict, setNameConflict] = useState<GroupMember | null>(null);

  useEffect(() => {
    if (profile?.full_name) {
      setMemberName(profile.full_name);
    }
  }, [profile]);

  useEffect(() => {
    if (!inviteCode) return;
    
    const fetchGroup = async () => {
      setLoading(true);
      
      // Extract actual invite code - support formats:
      // New: "group-name-tharwanet-abc123" -> extract "abc123"
      // Legacy: "group-name-abc123" -> extract "abc123"
      // Old: "abc123" -> use as-is
      const actualCode = inviteCode.includes('-') 
        ? inviteCode.split('-').pop() 
        : inviteCode;
      
      const { data, error } = await supabase
        .from('expense_groups')
        .select('id, name, description')
        .eq('invite_code', actualCode)
        .maybeSingle();
      
      if (error || !data) {
        setError('Invalid or expired invite link');
        setLoading(false);
        return;
      }
      
      setGroup(data);

      // Fetch existing members
      const { data: members } = await supabase
        .from('expense_group_members')
        .select('id, name, email, user_id')
        .eq('group_id', data.id);
      
      setExistingMembers(members || []);
      setLoading(false);
    };

    fetchGroup();
  }, [inviteCode]);

  // Check for name conflicts as user types
  useEffect(() => {
    if (!memberName.trim() || existingMembers.length === 0) {
      setNameConflict(null);
      return;
    }

    const conflict = existingMembers.find(
      m => m.name.toLowerCase() === memberName.trim().toLowerCase() && !m.user_id
    );
    setNameConflict(conflict || null);
  }, [memberName, existingMembers]);

  const handleJoin = async () => {
    if (!group || !memberName.trim()) return;
    
    setJoining(true);
    try {
      // Check if user already has a linked member entry
      const existingByUserId = existingMembers.find(m => m.user_id === user?.id);
      if (existingByUserId) {
        toast({ title: 'Already a member', description: 'You are already part of this group' });
        navigate(`/split/${group.id}`);
        return;
      }

      // Check if there's an invited member entry with matching email that we can link
      const userEmail = user?.email;
      if (userEmail) {
        const existingByEmail = existingMembers.find(
          m => m.email?.toLowerCase() === userEmail.toLowerCase() && !m.user_id
        );

        if (existingByEmail) {
          const { error: updateError } = await supabase
            .from('expense_group_members')
            .update({ user_id: user?.id, name: memberName.trim() })
            .eq('id', existingByEmail.id);

          if (updateError) throw updateError;

          toast({ title: 'Joined successfully!', description: `You are now part of ${group.name}` });
          navigate(`/split/${group.id}`);
          return;
        }
      }

      // If there's a name conflict with an unlinked member, link to that member
      if (nameConflict) {
        const { error: updateError } = await supabase
          .from('expense_group_members')
          .update({ user_id: user?.id })
          .eq('id', nameConflict.id);

        if (updateError) throw updateError;

        toast({ title: 'Joined successfully!', description: `Linked to existing member "${nameConflict.name}"` });
        navigate(`/split/${group.id}`);
        return;
      }

      // Check if name already exists for a linked member (different person)
      const linkedMemberWithSameName = existingMembers.find(
        m => m.name.toLowerCase() === memberName.trim().toLowerCase() && m.user_id
      );
      if (linkedMemberWithSameName) {
        toast({ 
          title: 'Name already taken', 
          description: 'Someone else is using this name. Please choose a different name.',
          variant: 'destructive'
        });
        setJoining(false);
        return;
      }

      // Add as new member
      const { error } = await supabase
        .from('expense_group_members')
        .insert({
          group_id: group.id,
          name: memberName.trim(),
          user_id: user?.id,
          is_creator: false,
        });

      if (error) throw error;

      toast({ title: 'Joined successfully!', description: `You are now part of ${group.name}` });
      navigate(`/split/${group.id}`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Sign in to Join</CardTitle>
            <CardDescription>
              You need to sign in to join this expense group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate(`/auth?redirect=/split/join/${inviteCode}`)}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-2" />
            <CardTitle>Invalid Invite</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/split')}>
              Go to Split Expenses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
          <CardTitle>Join "{group.name}"</CardTitle>
          {group.description && (
            <CardDescription>{group.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This name will be shown to other group members</p>
          </div>

          {nameConflict && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A member named "{nameConflict.name}" already exists but hasn't joined yet. 
                Clicking "Join" will link your account to this existing member.
              </AlertDescription>
            </Alert>
          )}

          <Button 
            className="w-full" 
            onClick={handleJoin} 
            disabled={joining || !memberName.trim()}
          >
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : nameConflict ? (
              'Join as Existing Member'
            ) : (
              'Join Group'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
