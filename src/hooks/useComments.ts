import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Comment } from '../types/feed';

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);

  const generateMockComments = (postId: string): Comment[] => {
    const commentsKey = `comments_${postId}`;
    const saved = localStorage.getItem(commentsKey);
    
    if (saved) {
      return JSON.parse(saved);
    }

    const mockComments: Comment[] = [
      {
        id: `comment-${postId}-1`,
        post_id: postId,
        user_id: 'user-1',
        user: {
          id: 'user-1',
          username: 'audio_fan',
          display_name: 'Audio Fan',
          profile_img_url: 'https://picsum.photos/32/32?random=10',
          verified: false,
          follower_count: 245,
          created_at: new Date().toISOString()
        },
        content: 'This is amazing! The voice quality is incredible.',
        like_count: 12,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: `comment-${postId}-2`,
        post_id: postId,
        user_id: 'user-2',
        user: {
          id: 'user-2',
          username: 'tech_lover',
          display_name: 'Tech Lover',
          profile_img_url: 'https://picsum.photos/32/32?random=11',
          verified: true,
          follower_count: 1205,
          created_at: new Date().toISOString()
        },
        content: 'How did you achieve such natural sounding speech?',
        like_count: 8,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem(commentsKey, JSON.stringify(mockComments));
    return mockComments;
  };

  useEffect(() => {
    const mockComments = generateMockComments(postId);
    setComments(mockComments);
  }, [postId]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: `comment-${postId}-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      user: {
        id: user.id,
        username: user.user_metadata?.username || 'user',
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        profile_img_url: user.user_metadata?.avatar_url || `https://picsum.photos/32/32?random=${user.id}`,
        verified: false,
        follower_count: 0,
        created_at: user.created_at
      },
      content,
      parent_id: parentId,
      like_count: 0,
      created_at: new Date().toISOString()
    };
    
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    
    const commentsKey = `comments_${postId}`;
    localStorage.setItem(commentsKey, JSON.stringify(updatedComments));
  };

  return {
    comments,
    addComment
  };
};
