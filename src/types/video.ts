// Video types for the application

export interface VideoRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  script: string;
  video_url: string | null;
  status: 'processing' | 'completed' | 'failed' | 'generating';
  replica_id?: string;
  replica_type?: 'user' | 'system';
  tavus_video_id?: string;
  tags?: string[];
  thumbnail_url?: string;
  duration?: number;
  generation_type: 'personal_replica' | 'stock_replica' | 'upload';
  created_at: string;
  updated_at: string;
}

export interface VideoCreationOptions {
  type: 'personal_replica' | 'stock_replica' | 'upload';
  replica_id?: string;
  training_video?: File;
  consent_video?: File;
}

export interface TavusVideoResponse {
  video_id: string;
  status: string;
  video_url?: string;
  download_url?: string;
  thumbnail_url?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}
