export interface Creator {
  id: string;
  username: string;
  display_name: string;
  profile_img_url: string;
  verified: boolean;
  follower_count: number;
  created_at: string;
}

export interface FeedPost {
  id: string;
  creator_id: string;
  creator: Creator;
  type: 'video' | 'audio';
  title: string;
  description?: string;
  content_url: string;
  thumbnail_url?: string;
  duration: number; // in seconds
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  type: '❤️' | '👏' | '🔥' | '🎵';
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user: Creator;
  content: string;
  parent_id?: string;
  replies?: Comment[];
  like_count: number;
  created_at: string;
}

export interface StarDonation {
  id: string;
  post_id: string;
  from_user_id: string;
  from_user: Creator;
  to_user_id: string;
  star_count: number;
  message?: string;
  created_at: string;
}

export interface PostStats {
  reaction_counts: {
    '❤️': number;
    '👏': number;
    '🔥': number;
    '🎵': number;
  };
  comment_count: number;
  star_count: number;
  star_value: number; // in dollars
  user_reaction?: '❤️' | '👏' | '🔥' | '🎵'; // The current user's reaction
}

export type SortOption = 'recent' | 'popular' | 'trending' | 'following';