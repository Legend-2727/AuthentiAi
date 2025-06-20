import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FeedPost, Reaction, Comment, StarDonation, PostStats, SortOption } from '../types/feed';

export const useFeed = (sortBy: SortOption = 'recent') => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postStats, setPostStats] = useState<{ [postId: string]: PostStats }>({});

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('feed_posts')
        .select(`
          *,
          creator:creators(*)
        `);

      // Apply sorting
      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popular':
          query = query.order('view_count', { ascending: false });
          break;
        case 'trending':
          // For trending, we'll order by recent posts with high engagement
          query = query
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('view_count', { ascending: false });
          break;
        case 'following':
          // This would require a follows table in a real implementation
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setPosts(data || []);

      // Fetch stats for each post
      if (data) {
        const statsPromises = data.map(post => fetchPostStats(post.id));
        const stats = await Promise.all(statsPromises);
        const statsMap = data.reduce((acc, post, index) => {
          acc[post.id] = stats[index];
          return acc;
        }, {} as { [postId: string]: PostStats });
        setPostStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostStats = async (postId: string): Promise<PostStats> => {
    try {
      // Fetch reaction counts
      const { data: reactions } = await supabase
        .from('reactions')
        .select('type')
        .eq('post_id', postId);

      const reactionCounts = {
        '❤️': 0,
        '👏': 0,
        '🔥': 0,
        '🎵': 0,
      };

      reactions?.forEach(reaction => {
        reactionCounts[reaction.type as keyof typeof reactionCounts]++;
      });

      // Fetch comment count
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      // Fetch star donations
      const { data: donations } = await supabase
        .from('star_donations')
        .select('star_count')
        .eq('post_id', postId);

      const starCount = donations?.reduce((sum, donation) => sum + donation.star_count, 0) || 0;
      const starValue = starCount * 0.01; // $0.01 per star

      return {
        reaction_counts: reactionCounts,
        comment_count: commentCount || 0,
        star_count: starCount,
        star_value: starValue,
      };
    } catch (error) {
      console.error('Error fetching post stats:', error);
      return {
        reaction_counts: { '❤️': 0, '👏': 0, '🔥': 0, '🎵': 0 },
        comment_count: 0,
        star_count: 0,
        star_value: 0,
      };
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const addReaction = async (postId: string, reactionType: '❤️' | '👏' | '🔥' | '🎵') => {
    if (!user) return;

    try {
      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('reactions')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // Update existing reaction
        await supabase
          .from('reactions')
          .update({ type: reactionType })
          .eq('id', existingReaction.id);
      } else {
        // Create new reaction
        await supabase
          .from('reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: reactionType,
          });
      }

      // Refresh stats
      const newStats = await fetchPostStats(postId);
      setPostStats(prev => ({ ...prev, [postId]: newStats }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const sendStarDonation = async (postId: string, starCount: number, message?: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      await supabase
        .from('star_donations')
        .insert({
          post_id: postId,
          from_user_id: user.id,
          to_user_id: post.creator_id,
          star_count: starCount,
          message,
        });

      // Refresh stats
      const newStats = await fetchPostStats(postId);
      setPostStats(prev => ({ ...prev, [postId]: newStats }));
    } catch (error) {
      console.error('Error sending star donation:', error);
    }
  };

  return {
    posts,
    postStats,
    loading,
    addReaction,
    sendStarDonation,
    refetch: fetchPosts,
  };
};

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:creators(*)
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              user:creators(*)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || [],
          };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user) return;

    try {
      await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId,
        });

      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments,
  };
};