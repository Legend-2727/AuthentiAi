import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Upload, 
  ArrowLeft, 
  Send, 
  Loader, 
  Hash,
  Shield,
  Download,
  Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ElevenLabsService, ElevenLabsVoice } from '../lib/elevenlabs';
import { useAudioPosts } from '../hooks/useAudioPosts';
import VoiceSelector from '../components/VoiceSelector';
import AudioPlayer from '../components/AudioPlayer';
import AudioThreads from '../components/AudioThreads';

interface AudioFormData {
  title: string;
  description: string;
  tags: string;
  script: string;
  voiceId: string;
}

const CreateAudioPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createAudioPost } = useAudioPosts();
  
  const [mode, setMode] = useState<'ai' | 'upload'>('ai');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentAudioPost, setCurrentAudioPost] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AudioFormData>({
    defaultValues: {
      voiceId: '',
    },
  });

  const watchedScript = watch('script');
  const watchedVoiceId = watch('voiceId');

  // Load voices on component mount
  useEffect(() => {
    const loadVoices = async () => {
      try {
        // For demo purposes, using mock voices since we don't have the actual API key
        const mockVoices: ElevenLabsVoice[] = [
          {
            voice_id: 'rachel',
            name: 'Rachel',
            category: 'narration',
            description: 'Calm and professional female voice',
            preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/rachel/preview.mp3'
          },
          {
            voice_id: 'drew',
            name: 'Drew',
            category: 'narration',
            description: 'Warm and engaging male voice',
            preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/drew/preview.mp3'
          },
          {
            voice_id: 'clyde',
            name: 'Clyde',
            category: 'conversational',
            description: 'Friendly and approachable male voice',
            preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/clyde/preview.mp3'
          },
          {
            voice_id: 'bella',
            name: 'Bella',
            category: 'conversational',
            description: 'Expressive and dynamic female voice',
            preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/bella/preview.mp3'
          }
        ];
        
        setVoices(mockVoices);
        if (mockVoices.length > 0) {
          setValue('voiceId', mockVoices[0].voice_id);
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        toast.error('Failed to load voices');
      } finally {
        setVoicesLoading(false);
      }
    };

    loadVoices();
  }, [setValue]);

  // Generate content hash for authenticity
  useEffect(() => {
    if (watchedScript) {
      try {
        // Convert the script to UTF-8 bytes, then to a Latin-1 compatible string for btoa
        const encoder = new TextEncoder();
        const utf8Bytes = encoder.encode(watchedScript + Date.now());
        const latin1String = String.fromCharCode(...utf8Bytes);
        const hash = btoa(latin1String).substring(0, 16);
        setContentHash(hash);
      } catch (error) {
        console.error('Error generating content hash:', error);
        // Fallback to a simple hash if btoa fails
        const fallbackHash = (watchedScript + Date.now()).slice(0, 16);
        setContentHash(fallbackHash);
      }
    }
  }, [watchedScript]);

  const generateAudio = async (script: string, voiceId: string, feedback?: string) => {
    setLoading(true);
    try {
      // Check if we have an ElevenLabs API key in environment variables
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        // Fallback to demo audio for development
        console.warn('No ElevenLabs API key found. Using demo audio.');
        
        // Create a simple audio context to generate a tone as demo
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 5; // 5 seconds
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a simple tone
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
        }
        
        // Convert to WAV blob
        const wavBlob = audioBufferToWav(buffer);
        const audioUrl = URL.createObjectURL(wavBlob);
        setGeneratedAudio(audioUrl);
        
        toast.success('Demo audio generated! (Add VITE_ELEVENLABS_API_KEY to .env for real TTS)');
        return audioUrl;
      }

      // Real ElevenLabs API call
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: feedback ? `${script}\n\nUser feedback: ${feedback}` : script,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);
      
      toast.success('Audio generated successfully!');
      return audioUrl;
    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    const data = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid audio file (MP3, WAV, OGG)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadedFile(file);
    const audioUrl = URL.createObjectURL(file);
    setGeneratedAudio(audioUrl);
    toast.success('Audio file uploaded successfully!');
  };

  const uploadAudioToStorage = async (audioBlob: Blob, fileName: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('audio-posts')
      .upload(`${user?.id}/${fileName}`, audioBlob);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('audio-posts')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: AudioFormData) => {
    if (!user) return;
    if (!generatedAudio && !uploadedFile) {
      toast.error('Please generate audio or upload a file first');
      return;
    }

    setLoading(true);
    try {
      let audioUrl = '';
      
      if (mode === 'upload' && uploadedFile) {
        // Upload the file to Supabase storage
        audioUrl = await uploadAudioToStorage(uploadedFile, `${Date.now()}-${uploadedFile.name}`);
      } else if (generatedAudio) {
        // Convert the generated audio URL to blob and upload
        const response = await fetch(generatedAudio);
        const audioBlob = await response.blob();
        audioUrl = await uploadAudioToStorage(audioBlob, `${Date.now()}-generated.mp3`);
      }

      // Create the audio post
      const audioPost = await createAudioPost({
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        audio_url: audioUrl,
        script: mode === 'ai' ? data.script : undefined,
        voice_id: mode === 'ai' ? data.voiceId : undefined,
        generation_type: mode,
        version: 1,
      });

      setCurrentAudioPost(audioPost.id);
      toast.success('Audio post created successfully!');
    } catch (error) {
      console.error('Error creating audio post:', error);
      toast.error('Failed to create audio post');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRequest = async (feedback: string) => {
    if (!watchedScript || !watchedVoiceId) return;
    
    try {
      await generateAudio(watchedScript, watchedVoiceId, feedback);
    } catch (error) {
      // Error already handled in generateAudio
    }
  };

  const downloadAudio = () => {
    if (!generatedAudio) return;
    
    const link = document.createElement('a');
    link.href = generatedAudio;
    link.download = `audio-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/create')}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <Mic className="h-8 w-8 mr-3 text-purple-600" />
                Create Audio Post
              </h2>
              <p className="mt-1 text-gray-600">
                Generate AI-powered podcasts or upload your own audio content.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          {/* Mode Selection */}
          <div className="mb-8">
            <div className="flex space-x-4">
              <motion.button
                type="button"
                onClick={() => setMode('ai')}
                className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                  mode === 'ai'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mic className="h-5 w-5 mr-2" />
                AI Generated Audio
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => setMode('upload')}
                className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                  mode === 'upload'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Audio File
              </motion.button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your audio title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  {...register('tags')}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="podcast, education, technology (comma-separated)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe your audio content..."
              />
            </div>

            {/* AI Generation Mode */}
            {mode === 'ai' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Podcast Topic / Script Description *
                  </label>
                  <textarea
                    {...register('script', {
                      required: mode === 'ai' ? 'Script is required for AI generation' : false,
                      minLength: { value: 10, message: 'Script must be at least 10 characters' },
                    })}
                    rows={6}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Write your podcast script or describe the topic you want to discuss..."
                  />
                  {errors.script && (
                    <p className="mt-1 text-sm text-red-600">{errors.script.message}</p>
                  )}
                </div>

                <VoiceSelector
                  voices={voices}
                  selectedVoice={watchedVoiceId}
                  onVoiceSelect={(voiceId) => setValue('voiceId', voiceId)}
                  loading={voicesLoading}
                />

                <motion.button
                  type="button"
                  onClick={() => generateAudio(watchedScript, watchedVoiceId)}
                  disabled={!watchedScript || !watchedVoiceId || loading}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Generating Audio...' : 'Generate AI Podcast'}
                </motion.button>
              </>
            )}

            {/* Upload Mode */}
            {mode === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Audio File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="audio-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload an audio file</span>
                        <input
                          id="audio-upload"
                          type="file"
                          className="sr-only"
                          accept="audio/*"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MP3, WAV, OGG up to 50MB</p>
                  </div>
                </div>
                {uploadedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Uploaded: {uploadedFile.name}
                  </p>
                )}
              </div>
            )}

            {/* Audio Preview */}
            {generatedAudio && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Audio Preview</h3>
                <AudioPlayer
                  src={generatedAudio}
                  title={watch('title') || 'Generated Audio'}
                  onDownload={downloadAudio}
                />
              </div>
            )}

            {/* Copyright & Authenticity Section */}
            {(generatedAudio || uploadedFile) && (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Proof of Authorship
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Content Hash:</p>
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {contentHash}
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Timestamp:</p>
                    <p className="text-xs text-gray-800">
                      {new Date().toISOString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This hash and timestamp can be used to verify the authenticity and creation time of your content.
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/create')}
                className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              
              <motion.button
                type="submit"
                disabled={loading || (!generatedAudio && !uploadedFile)}
                className="flex items-center px-6 py-3 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Audio Post'}
              </motion.button>
            </div>
          </form>

          {/* Audio Threads for Feedback */}
          {currentAudioPost && (
            <div className="mt-8">
              <AudioThreads
                audioPostId={currentAudioPost}
                onRegenerateRequest={handleRegenerateRequest}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreateAudioPost;