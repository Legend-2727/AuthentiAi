import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AudioPostReaction {
  id: string;
  audio_post_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  created_at: string;
}

export interface AudioPostComment {
  id: string;
  audio_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    name: string | null;
  };
}

export interface AudioPostStats {
  reactions: Record<string, number>;
  totalReactions: number;
  commentsCount: number;
  userReaction?: string;
}

export const useAudioPostInteractions = (audioPostId: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AudioPostStats>({
    reactions: {},
    totalReactions: 0,
    commentsCount: 0
  });
  const [comments, setComments] = useState<AudioPostComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Try to fetch real data first
      const { data: reactions, error: reactionsError } = await supabase
        .from('audio_post_reactions')
        .select('reaction_type, user_id')
        .eq('audio_post_id', audioPostId);

      if (reactionsError && reactionsError.code === 'PGRST116') {
        // Table doesn't exist, use mock data with persistent storage
        console.log('Reactions table not found, using persistent mock data');
        
        // Get mock data from localStorage or create new
        const mockKey = `mockInteractions_${audioPostId}`;
        const storedMock = localStorage.getItem(mockKey);
        
        let mockStats;
        if (storedMock) {
          mockStats = JSON.parse(storedMock);
        } else {
          // Create new mock data and save it
          mockStats = {
            reactions: { like: 5, love: 2, laugh: 1 },
            totalReactions: 8,
            commentsCount: 3,
            userReaction: undefined as string | undefined
          };
          localStorage.setItem(mockKey, JSON.stringify(mockStats));
        }
        
        setStats(mockStats);
        
        // Create mock comments
        const mockComments = [
          {
            id: 'mock-1',
            audio_post_id: audioPostId,
            user_id: 'mock-user-1',
            content: 'Great content! Really enjoyed listening to this.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { username: 'demo_user', name: 'Demo User' }
          },
          {
            id: 'mock-2',
            audio_post_id: audioPostId,
            user_id: 'mock-user-2',
            content: 'Amazing quality! How did you generate this?',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { username: 'ai_enthusiast', name: 'AI Enthusiast' }
          },
          {
            id: 'mock-3',
            audio_post_id: audioPostId,
            user_id: 'mock-user-3',
            content: 'Very impressive! Looking forward to more content.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { username: 'content_lover', name: 'Content Lover' }
          }
        ];
        setComments(mockComments);
        return;
      }

      // Process real reactions data
      const reactionCounts: Record<string, number> = {};
      let userReaction: string | undefined;
      
      reactions?.forEach(reaction => {
        reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
        if (user && reaction.user_id === user.id) {
          userReaction = reaction.reaction_type;
        }
      });

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('audio_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('audio_post_id', audioPostId);

      if (commentsError) {
        console.log('Comments table not found:', commentsError);
      }

      setStats({
        reactions: reactionCounts,
        totalReactions: reactions?.length || 0,
        commentsCount: commentsCount || 0,
        userReaction
      });

      // Uncomment this when database migration is applied:
      /*
      // Fetch reactions
      const { data: reactions, error: reactionsError } = await supabase
        .from('audio_post_reactions')
        .select('reaction_type, user_id')
        .eq('audio_post_id', audioPostId);

      if (reactionsError) throw reactionsError;

      // Process reactions
      const reactionCounts: Record<string, number> = {};
      let userReaction: string | undefined;
      
      reactions?.forEach(reaction => {
        reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
        if (user && reaction.user_id === user.id) {
          userReaction = reaction.reaction_type;
        }
      });

      // Fetch comments count
      const { count: commentsCount, error: commentsError } = await supabase
        .from('audio_post_comments')
        .select('*', { count: 'exact', head: true })
        .eq('audio_post_id', audioPostId);

      if (commentsError) throw commentsError;

      setStats({
        reactions: reactionCounts,
        totalReactions: reactions?.length || 0,
        commentsCount: commentsCount || 0,
        userReaction
      });
      */
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [audioPostId, user]);

  const fetchComments = useCallback(async () => {
    try {
      const { data: comments, error } = await supabase
        .from('audio_post_comments')
        .select(`
          *,
          user:users(username, name)
        `)
        .eq('audio_post_id', audioPostId)
        .order('created_at', { ascending: true });

      if (error) {
        console.log('Comments table not found, using mock data:', error);
        // Fallback to mock data if tables don't exist yet
        const mockComments = [
          {
            id: '1',
            audio_post_id: audioPostId,
            user_id: 'mock-user-1',
            content: 'Great audio content! Really enjoyed listening to this.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: { username: 'audioLover', name: 'Audio Lover' }
          },
          {
            id: '2',
            audio_post_id: audioPostId,
            user_id: 'mock-user-2',
            content: 'Very informative podcast. Looking forward to more!',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            user: { username: 'podcastFan', name: 'Podcast Fan' }
          }
        ];
        setComments(mockComments);
        return;
      }

      setComments(comments || []);

      // Uncomment this when database migration is applied:
      /*
      const { data: comments, error } = await supabase
        .from('audio_post_comments')
        .select(`
          *,
          user:users(username, name)
        `)
        .eq('audio_post_id', audioPostId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(comments || []);
      */
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [audioPostId]);

  const addReaction = async (reactionType: AudioPostReaction['reaction_type']) => {
    if (!user) return;

    try {
      // Check if user already has a reaction
      const { data: existingReaction, error: checkError } = await supabase
        .from('audio_post_reactions')
        .select('*')
        .eq('audio_post_id', audioPostId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Reactions table not found, using mock implementation:', checkError);
        // Fallback to mock implementation if tables don't exist yet
        console.log('Mock: Adding reaction:', reactionType);
        // Update stats optimistically
        setStats(prev => {
          const newReactions = { ...prev.reactions };
          if (prev.userReaction === reactionType) {
            // Remove reaction if same
            newReactions[reactionType] = (newReactions[reactionType] || 1) - 1;
            if (newReactions[reactionType] <= 0) {
              delete newReactions[reactionType];
            }
            return {
              ...prev,
              reactions: newReactions,
              totalReactions: Math.max(0, prev.totalReactions - 1),
              userReaction: undefined
            };
          } else {
            // Add or change reaction
            if (prev.userReaction) {
              // Remove old reaction
              newReactions[prev.userReaction] = (newReactions[prev.userReaction] || 1) - 1;
              if (newReactions[prev.userReaction] <= 0) {
                delete newReactions[prev.userReaction];
              }
            }
            // Add new reaction
            newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;
            return {
              ...prev,
              reactions: newReactions,
              totalReactions: prev.userReaction ? prev.totalReactions : prev.totalReactions + 1,
              userReaction: reactionType
            };
          }
        });
        return;
      }

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if it's the same
          await supabase
            .from('audio_post_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction if it's different
          await supabase
            .from('audio_post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('audio_post_reactions')
          .insert({
            audio_post_id: audioPostId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      await fetchStats();

      // Uncomment this when database migration is applied:
      /*
      // Check if user already has a reaction
      const { data: existingReaction } = await supabase
        .from('audio_post_reactions')
        .select('*')
        .eq('audio_post_id', audioPostId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if it's the same
          await supabase
            .from('audio_post_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Update reaction if it's different
          await supabase
            .from('audio_post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase
          .from('audio_post_reactions')
          .insert({
            audio_post_id: audioPostId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      await fetchStats();
      */
    } catch (error) {
      console.error('Error managing reaction:', error);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return;

    try {
      // Mock implementation for demo purposes
      console.log('Mock: Adding comment:', content);
      const newComment = {
        id: Date.now().toString(),
        audio_post_id: audioPostId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: { username: user.user_metadata?.username || 'You', name: user.user_metadata?.name || 'You' }
      };

      setComments(prev => [...prev, newComment]);
      setStats(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));

      // Uncomment this when database migration is applied:
      /*
      const { error } = await supabase
        .from('audio_post_comments')
        .insert({
          audio_post_id: audioPostId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      await fetchComments();
      await fetchStats();
      */
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('audio_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchComments();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchComments()]);
      setLoading(false);
    };

    if (audioPostId) {
      loadData();
    }
  }, [audioPostId, fetchStats, fetchComments]);

  return {
    stats,
    comments,
    loading,
    addReaction,
    addComment,
    deleteComment,
    refreshData: () => Promise.all([fetchStats(), fetchComments()])
  };
};
