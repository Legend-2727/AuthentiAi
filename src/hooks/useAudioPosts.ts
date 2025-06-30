import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AudioPost, AudioThread } from '../types/audio';

export const useAudioPosts = () => {
  const { user } = useAuth();
  const [audioPosts, setAudioPosts] = useState<AudioPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudioPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('audio_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudioPosts(data || []);
    } catch (error) {
      console.error('Error fetching audio posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudioPosts();
  }, [user]);

  const ensureUserExists = async (userId: string, userEmail: string) => {
    try {
      // Check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingUser) {
        console.log('User already exists in users table');
        return;
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // User doesn't exist, create them
      console.log('Creating user record in users table');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userEmail,
          username: userEmail.split('@')[0], // Use email prefix as username
        });

      if (insertError) {
        throw insertError;
      }

      console.log('User record created successfully');
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      throw error;
    }
  };

  const createAudioPost = async (audioPost: Omit<AudioPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('Creating audio post with data:', audioPost);
      
      // Ensure user exists in users table before creating audio post
      await ensureUserExists(user.id, user.email || '');
      
      const insertData = {
        ...audioPost,
        user_id: user.id,
      };
      
      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('audio_posts')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Audio post created successfully:', data);
      await fetchAudioPosts();
      return data;
    } catch (error) {
      console.error('Error in createAudioPost:', error);
      throw error;
    }
  };

  const updateAudioPost = async (id: string, updates: Partial<AudioPost>) => {
    const { error } = await supabase
      .from('audio_posts')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await fetchAudioPosts();
  };

  const deleteAudioPost = async (id: string) => {
    const { error } = await supabase
      .from('audio_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchAudioPosts();
  };

  return {
    audioPosts,
    loading,
    createAudioPost,
    updateAudioPost,
    deleteAudioPost,
    refetch: fetchAudioPosts,
  };
};

export const useAudioThreads = (audioPostId: string) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<AudioThread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('audio_threads')
        .select('*')
        .eq('audio_post_id', audioPostId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (audioPostId) {
      fetchThreads();
    }
  }, [audioPostId]);

  const addThread = async (message: string, messageType: AudioThread['message_type'] = 'user_feedback') => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('audio_threads')
      .insert([
        {
          audio_post_id: audioPostId,
          user_id: user.id,
          message,
          message_type: messageType,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    await fetchThreads();
    return data;
  };

  return {
    threads,
    loading,
    addThread,
    refetch: fetchThreads,
  };
};
