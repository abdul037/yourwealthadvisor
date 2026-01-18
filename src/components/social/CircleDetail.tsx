import { useEffect, useState } from 'react';
import { Circle } from '@/hooks/useCircles';
import { usePosts, PostWithAuthor, useComments } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  MessageCircle,
  Lightbulb,
  HelpCircle,
  Trophy,
  Flag,
  Share2,
  Pin,
  ShieldAlert
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { trackSocialEvent } from '@/lib/socialAnalytics';

const postTypeConfig = {
  discussion: { icon: MessageCircle, label: 'Discussion', color: 'text-blue-500' },
  tip: { icon: Lightbulb, label: 'Tip', color: 'text-amber-500' },
  question: { icon: HelpCircle, label: 'Question', color: 'text-purple-500' },
  win: { icon: Trophy, label: 'Win', color: 'text-emerald-500' },
  milestone: { icon: Flag, label: 'Milestone', color: 'text-pink-500' },
};

interface CircleDetailProps {
  circle: Circle;
  onBack: () => void;
  isMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

export function CircleDetail({ circle, onBack, isMember, onJoin, onLeave }: CircleDetailProps) {
  const { posts, isLoading, createPost, toggleUpvote } = usePosts(circle.id);
  const [showPostForm, setShowPostForm] = useState(false);
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    post_type: 'discussion' as const,
    is_anonymous: false,
  });
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const inviteLink = `${baseUrl}/social?circle=${circle.slug}`;

  const handleSubmitPost = () => {
    if (!newPost.content.trim()) return;
    
    createPost.mutate({
      circle_id: circle.id,
      post_type: newPost.post_type,
      title: newPost.title || undefined,
      content: newPost.content,
      is_anonymous: newPost.is_anonymous,
    }, {
      onSuccess: () => {
        setNewPost({ title: '', content: '', post_type: 'discussion', is_anonymous: false });
        setShowPostForm(false);
      },
    });
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast({ title: 'Invite link copied', description: 'Share it with your circle.' });
      trackSocialEvent('circle_invite_copied', { circleId: circle.id });
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy the link manually.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    const key = `tharwa_circle_muted_${circle.id}`;
    const stored = window.localStorage.getItem(key);
    setIsMuted(stored === 'true');
  }, [circle.id]);

  const handleMuteChange = (value: boolean) => {
    const key = `tharwa_circle_muted_${circle.id}`;
    setIsMuted(value);
    window.localStorage.setItem(key, value ? 'true' : 'false');
    toast({ title: value ? 'Circle muted' : 'Circle unmuted' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{circle.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{circle.name}</h2>
              <p className="text-muted-foreground">{circle.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {circle.member_count} members
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              {circle.post_count} posts
            </span>
            <Button
              size="sm"
              variant={isMember ? 'outline' : 'default'}
              onClick={isMember ? onLeave : onJoin}
            >
              {isMember ? 'Leave Circle' : 'Join Circle'}
            </Button>
            <Button size="sm" variant="ghost" className="gap-2" onClick={handleCopyInvite}>
              <Share2 className="w-4 h-4" />
              Share invite
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id={`mute-${circle.id}`}
                checked={isMuted}
                onCheckedChange={handleMuteChange}
              />
              <Label htmlFor={`mute-${circle.id}`} className="text-sm text-muted-foreground">
                Mute
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Form */}
      {isMember && !isMuted && (
        <Card>
          {!showPostForm ? (
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowPostForm(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Share something with the community...
              </Button>
            </CardContent>
          ) : (
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Select 
                  value={newPost.post_type} 
                  onValueChange={(v) => setNewPost(p => ({ ...p, post_type: v as any }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(postTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <config.icon className={`w-4 h-4 ${config.color}`} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={newPost.is_anonymous}
                    onCheckedChange={(checked) => setNewPost(p => ({ ...p, is_anonymous: checked }))}
                  />
                  <Label htmlFor="anonymous" className="text-sm">Post anonymously</Label>
                </div>
              </div>
              <Input
                placeholder="Title (optional)"
                value={newPost.title}
                onChange={(e) => setNewPost(p => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost(p => ({ ...p, content: e.target.value }))}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowPostForm(false)}>Cancel</Button>
                <Button onClick={handleSubmitPost} disabled={createPost.isPending}>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <Card className="border-border/70 bg-muted/10">
        <CardContent className="p-4">
          <p className="text-sm font-medium">Community Guidelines</p>
          <ul className="mt-2 text-xs text-muted-foreground space-y-1">
            <li>Be respectful and keep discussions constructive.</li>
            <li>No spam, promotions, or off-topic posts.</li>
            <li>Share tips and wins that help others progress.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Posts */}
      {isMuted ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You muted this circle. Unmute to see new posts.
          </p>
          <div className="mt-3">
            <Button size="sm" variant="outline" onClick={() => handleMuteChange(false)}>
              Unmute circle
            </Button>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">
            {isMember ? 'Be the first to share something!' : 'Join this circle to start posting'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post}
              circleSlug={circle.slug}
              onUpvote={() => toggleUpvote.mutate({ postId: post.id, hasUpvoted: post.hasUpvoted })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, circleSlug, onUpvote }: { post: PostWithAuthor; circleSlug: string; onUpvote: () => void }) {
  const config = postTypeConfig[post.post_type] || postTypeConfig.discussion;
  const Icon = config.icon;
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const { comments, isLoading, createComment } = useComments(showComments ? post.id : undefined);
  const { toast } = useToast();

  const handleAddComment = () => {
    const commentValue = newComment.trim();
    if (!commentValue) return;
    createComment.mutate(
      { post_id: post.id, content: commentValue },
      {
        onSuccess: async () => {
          setNewComment('');
          try {
            const { error } = await supabase.functions.invoke('social-reply-notification', {
              body: {
                postId: post.id,
                commentContent: commentValue,
                circleSlug,
              },
            });
            if (error) throw error;
          } catch (error) {
            console.warn('Failed to send comment notification', error);
          }
        },
      }
    );
  };

  const handleReport = () => {
    setReportOpen(false);
    setReportNote('');
    toast({ title: 'Report submitted', description: 'Thanks for keeping the community safe.' });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {post.is_anonymous ? '?' : (post.author?.full_name?.[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {post.is_anonymous ? 'Anonymous' : (post.author?.full_name || 'User')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Icon className={`w-3 h-3 ${config.color}`} />
            {config.label}
          </Badge>
        </div>
        {post.is_pinned && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Pin className="w-3 h-3" />
            Pinned
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {post.title && <h4 className="font-semibold text-lg">{post.title}</h4>}
        <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={post.hasUpvoted ? 'text-primary' : ''}
            onClick={onUpvote}
          >
            <ThumbsUp className={`w-4 h-4 mr-1 ${post.hasUpvoted ? 'fill-current' : ''}`} />
            {post.upvote_count}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments((prev) => !prev)}>
            <MessageSquare className="w-4 h-4 mr-1" />
            {post.comment_count}
          </Button>
          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <ShieldAlert className="w-4 h-4 mr-1" />
                Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report this post</DialogTitle>
                <DialogDescription>
                  Let us know what’s wrong. We’ll review it promptly.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                placeholder="Tell us more (optional)"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setReportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReport}>Submit report</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {showComments && (
          <div className="space-y-3 border-t border-border/60 pt-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 bg-muted/60 rounded-md animate-pulse" />
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {comments.map(comment => (
                  <div key={comment.id} className="rounded-md bg-muted/20 p-2">
                    <p className="text-xs text-muted-foreground">
                      {comment.is_anonymous ? 'Anonymous' : (comment.author?.full_name || 'User')} •{' '}
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending}>
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
