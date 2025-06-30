// Tavus API integration for video generation
import { TavusVideoResponse } from '../types/video';

const TAVUS_API_BASE = 'https://tavusapi.com/v2';

// Types for Tavus API
export interface TavusReplica {
  replica_id: string;
  replica_name: string;
  thumbnail_video_url?: string;
  training_progress?: string;
  status: 'training' | 'completed' | 'error' | 'ready';
  created_at: string;
  updated_at: string;
  error_message?: string | null;
  replica_type: 'user' | 'system';
  description?: string;
  style?: string;
}

export interface CreateReplicaRequest {
  train_video_url: string;
  consent_video_url?: string;
  callback_url?: string;
  replica_name: string;
  model_name?: 'phoenix-2' | 'phoenix-3';
}

export interface CreateReplicaResponse {
  replica_id: string;
  status: string;
}

export interface VideoGenerationRequest {
  replica_id: string;
  script: string;
  video_name?: string;
  callback_url?: string;
  properties?: {
    voice_settings?: {
      stability?: number;
      similarity_boost?: number;
    };
  };
}

export interface VideoGenerationResponse {
  video_id: string;
  status: string;
  video_url?: string;
  download_url?: string;
}

// Tavus API client
class TavusAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${TAVUS_API_BASE}${endpoint}`;
    
    console.log(`Making Tavus API request to: ${url}`);
    console.log('Request options:', options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`Tavus API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tavus API Error Response:', errorText);
      throw new Error(`Tavus API Error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Tavus API response data:', responseData);
    return responseData;
  }

  // Replica management
  async createReplica(request: CreateReplicaRequest): Promise<CreateReplicaResponse> {
    return this.makeRequest<CreateReplicaResponse>('/replicas', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getReplica(replicaId: string, verbose = false): Promise<TavusReplica> {
    const params = verbose ? '?verbose=true' : '';
    return this.makeRequest<TavusReplica>(`/replicas/${replicaId}${params}`);
  }

  async listReplicas(options: {
    limit?: number;
    page?: number;
    verbose?: boolean;
    replica_type?: 'user' | 'system';
    replica_ids?: string[];
  } = {}): Promise<{ data: TavusReplica[]; total_count: number }> {
    const params = new URLSearchParams();
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.verbose) params.append('verbose', 'true');
    if (options.replica_type) params.append('replica_type', options.replica_type);
    if (options.replica_ids) params.append('replica_ids', options.replica_ids.join(','));

    const query = params.toString() ? `?${params.toString()}` : '';
    
    console.log(`Fetching replicas with params: ${query}`);
    
    const response = await this.makeRequest<{ data?: TavusReplica[]; replicas?: TavusReplica[]; total_count?: number } | TavusReplica[]>(`/replicas${query}`);
    
    // Handle different possible response formats
    if (Array.isArray(response)) {
      return { data: response, total_count: response.length };
    } else if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        return { 
          data: response.data, 
          total_count: response.total_count || response.data.length 
        };
      } else if ('replicas' in response && Array.isArray(response.replicas)) {
        return { 
          data: response.replicas, 
          total_count: response.replicas.length 
        };
      }
    }
    
    console.warn('Unexpected replicas response format:', response);
    return { data: [], total_count: 0 };
  }

  async deleteReplica(replicaId: string): Promise<void> {
    await this.makeRequest(`/replicas/${replicaId}`, {
      method: 'DELETE',
    });
  }

  async updateReplicaName(replicaId: string, name: string): Promise<void> {
    await this.makeRequest(`/replicas/${replicaId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ replica_name: name }),
    });
  }

  // Video generation (this might need actual endpoint verification)
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    return this.makeRequest<VideoGenerationResponse>('/videos', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getVideo(videoId: string): Promise<TavusVideoResponse> {
    return this.makeRequest<TavusVideoResponse>(`/videos/${videoId}`);
  }
}

// Initialize Tavus client
export const createTavusClient = (): TavusAPI | null => {
  const apiKey = import.meta.env.VITE_TAVUS_API_KEY;
  
  if (!apiKey) {
    console.warn('Tavus API key not found in environment variables');
    return null;
  }
  
  return new TavusAPI(apiKey);
};

// Stock replicas - Load real replicas from Tavus API instead of using fake ones
export const STOCK_REPLICAS: TavusReplica[] = [];
