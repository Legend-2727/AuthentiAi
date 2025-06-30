export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description?: string;
  preview_url?: string;
}

export interface GenerateAudioRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async testApiKey(): Promise<{ valid: boolean; permissions: string[]; error?: string }> {
    try {
      // Test basic API access with user endpoint
      const userResponse = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (userResponse.status === 401) {
        const errorData = await userResponse.json();
        return {
          valid: false,
          permissions: [],
          error: errorData.detail?.message || 'Unauthorized - Invalid API key'
        };
      }

      // Test voices endpoint
      const voicesResponse = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      const permissions = [];
      if (userResponse.ok) permissions.push('user_read');
      if (voicesResponse.ok) permissions.push('voices_read');

      return {
        valid: permissions.length > 0,
        permissions,
        error: permissions.length === 0 ? 'API key lacks necessary permissions' : undefined
      };
    } catch (error) {
      return {
        valid: false,
        permissions: [],
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          throw new Error(`API key lacks permissions: ${errorData.detail?.message || 'Unauthorized'}`);
        }
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  async generateAudio(request: GenerateAudioRequest): Promise<Blob> {
    try {
      // Use the non-streaming endpoint for better compatibility
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${request.voice_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: request.text,
            model_id: request.model_id || 'eleven_multilingual_v2',
            voice_settings: request.voice_settings || {
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.0,
              use_speaker_boost: true
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          const errorData = await response.json();
          throw new Error(`API key lacks permissions: ${errorData.detail?.message || 'Unauthorized'}`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Bad request: ${errorData.detail?.message || 'Invalid parameters'}`);
        }
        throw new Error(`Failed to generate audio: ${response.status} ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  // Method to get default voices when API access is limited
  static getDefaultVoices(): ElevenLabsVoice[] {
    return [
      {
        voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam
        name: 'Adam',
        category: 'premade',
        description: 'Deep, authoritative male voice'
      },
      {
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella
        name: 'Bella',
        category: 'premade',
        description: 'Warm, friendly female voice'
      },
      {
        voice_id: 'VR6AewLTigWG4xSOukaG', // Arnold
        name: 'Arnold',
        category: 'premade',
        description: 'Strong, confident male voice'
      },
      {
        voice_id: 'MF3mGyEYCl7XYWbV9V6O', // Elli
        name: 'Elli',
        category: 'premade',
        description: 'Young, energetic female voice'
      },
      {
        voice_id: 'TxGEqnHWrfWFTfGW9XjX', // Josh
        name: 'Josh',
        category: 'premade',
        description: 'Clear, professional male voice'
      }
    ];
  }
}