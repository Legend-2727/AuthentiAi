export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface AudioPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string[];
  audio_url: string;
  script?: string;
  voice_id?: string;
  generation_type: 'ai' | 'upload';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AudioThread {
  id: string;
  audio_post_id: string;
  user_id: string;
  message: string;
  message_type: 'user_feedback' | 'regeneration_request' | 'system_response';
  created_at: string;
}

export interface AudioVersion {
  id: string;
  audio_post_id: string;
  version_number: number;
  audio_url: string;
  script?: string;
  voice_id?: string;
  changes_description?: string;
  created_at: string;
}