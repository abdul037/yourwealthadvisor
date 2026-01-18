import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { trackSocialEvent } from '@/lib/socialAnalytics';

export interface Post {
  id: string;
  circle_id: string;
  author_id: string;
  post_type: 'discussion' | 'tip' | 'question' | 'win' | 'milestone';
  title: string | null;
  content: string;
  is_anonymous: boolean;
  upvote_count: number;
  comment_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostWithAuthor extends Post {
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  hasUpvoted: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  upvote_count: number;
  parent_comment_id: string | null;
  created_at: string;
}

export interface CommentWithAuthor extends Comment {
  author: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function usePosts(circleId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts for a circle
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', circleId],
    queryFn: async () => {
      if (!circleId) return [];

      const { data: { user } } = await supabase.auth.getUser();

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('circle_id', circleId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      // Fetch user's upvotes
      let userUpvotes: string[] = [];
      if (user) {
        const { data: upvotes } = await supabase
          .from('upvotes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsData.map(p => p.id));
        
        userUpvotes = upvotes?.map(u => u.post_id).filter(Boolean) as string[] || [];
      }

      return postsData.map(post => ({
        ...post,
        author: post.is_anonymous ? null : profiles?.find(p => p.id === post.author_id) || null,
        hasUpvoted: userUpvotes.includes(post.id),
      })) as PostWithAuthor[];
    },
    enabled: !!circleId,
  });

  // Create a new post
  const createPost = useMutation({
    mutationFn: async (newPost: {
      circle_id: string;
      post_type: Post['post_type'];
      title?: string;
      content: string;
      is_anonymous?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('posts')
        .insert({
          ...newPost,
          author_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', circleId] });
      trackSocialEvent('post_created', { circleId: variables.circle_id });
      toast({ title: 'Post created!' });
    },
    onError: () => {
      toast({ title: 'Error creating post', variant: 'destructive' });
    },
  });

  // Toggle upvote on a post
  const toggleUpvote = useMutation({
    mutationFn: async ({ postId, hasUpvoted }: { postId: string; hasUpvoted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (hasUpvoted) {
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('upvotes')
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', circleId] });
    },
    onError: () => {
      toast({ title: 'Error updating vote', variant: 'destructive' });
    },
  });

  return {
    posts,
    isLoading,
    createPost,
    toggleUpvote,
  };
}

export function useComments(postId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data.map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', authorIds);

      return data.map(comment => ({
        ...comment,
        author: comment.is_anonymous ? null : profiles?.find(p => p.id === comment.author_id) || null,
      })) as CommentWithAuthor[];
    },
    enabled: !!postId,
  });

  const createComment = useMutation({
    mutationFn: async (newComment: {
      post_id: string;
      content: string;
      is_anonymous?: boolean;
      parent_comment_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('comments')
        .insert({
          ...newComment,
          author_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      trackSocialEvent('comment_created', { postId: variables.post_id });
      toast({ title: 'Comment added!' });
    },
    onError: () => {
      toast({ title: 'Error adding comment', variant: 'destructive' });
    },
  });

  return {
    comments,
    isLoading,
    createComment,
  };
}
