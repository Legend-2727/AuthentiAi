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
  Save,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ElevenLabsService, ElevenLabsVoice } from '../lib/elevenlabs';
import { useAudioPosts } from '../hooks/useAudioPosts';
import { useBlockchainProof } from '../hooks/useBlockchainProof';
import VoiceSelector from '../components/VoiceSelector';
import AudioPlayer from '../components/AudioPlayer';
import AudioThreads from '../components/AudioThreads';
import ElevenLabsPoweredBy from '../components/ElevenLabsPoweredBy';

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
  const { registerProof } = useBlockchainProof(); // Add blockchain proof functionality
  
  const [mode, setMode] = useState<'ai' | 'upload'>('ai');
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentAudioPost, setCurrentAudioPost] = useState<string | null>(null);
  const [contentHash, setContentHash] = useState<string>('');
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [blockchainTxnId, setBlockchainTxnId] = useState<string>(''); // Track blockchain transaction ID

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
        const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
        
        if (!apiKey) {
          console.warn('No ElevenLabs API key found. Using default voices.');
          setIsApiAvailable(false);
          const defaultVoices = ElevenLabsService.getDefaultVoices();
          setVoices(defaultVoices);
          if (defaultVoices.length > 0) {
            setValue('voiceId', defaultVoices[0].voice_id);
          }
          toast.warning('No API key found. Using default voices. Add VITE_ELEVENLABS_API_KEY to .env for full functionality.');
          return;
        }

        // Initialize the ElevenLabs service
        const elevenLabsService = new ElevenLabsService(apiKey);
        
        // Test API key first
        const keyTest = await elevenLabsService.testApiKey();
        
        if (!keyTest.valid) {
          console.error('API key test failed:', keyTest.error);
          setIsApiAvailable(false);
          const defaultVoices = ElevenLabsService.getDefaultVoices();
          setVoices(defaultVoices);
          if (defaultVoices.length > 0) {
            setValue('voiceId', defaultVoices[0].voice_id);
          }
          toast.error(`API key error: ${keyTest.error}. Using default voices.`);
          return;
        }

        console.log('API key valid with permissions:', keyTest.permissions);

        // Try to fetch voices from ElevenLabs
        try {
          const voiceList = await elevenLabsService.getVoices();
          setVoices(voiceList);
          setIsApiAvailable(true);
          
          if (voiceList.length > 0) {
            setValue('voiceId', voiceList[0].voice_id);
          }
          
          console.log(`Loaded ${voiceList.length} voices from ElevenLabs`);
          toast.success(`Connected to ElevenLabs! Loaded ${voiceList.length} voices.`);
        } catch (voiceError) {
          console.warn('Could not fetch voices, but API key is valid. Using default voices:', voiceError);
          setIsApiAvailable(true);
          const defaultVoices = ElevenLabsService.getDefaultVoices();
          setVoices(defaultVoices);
          if (defaultVoices.length > 0) {
            setValue('voiceId', defaultVoices[0].voice_id);
          }
          toast.warning('Using default voices. Voice list may not be complete.');
        }
        
      } catch (error) {
        console.error('Error during voice loading:', error);
        setIsApiAvailable(false);
        
        // Fallback to default voices
        const defaultVoices = ElevenLabsService.getDefaultVoices();
        setVoices(defaultVoices);
        if (defaultVoices.length > 0) {
          setValue('voiceId', defaultVoices[0].voice_id);
        }
        
        toast.error('Failed to connect to ElevenLabs. Using default voices.');
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
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      // If API is not available, generate demo audio
      if (!isApiAvailable || !apiKey) {
        console.log('Generating demo audio (API not available)');
        
        // Create a simple audio context to generate a tone as demo
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 5; // 5 seconds
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate a simple tone sequence
        for (let i = 0; i < data.length; i++) {
          const time = i / sampleRate;
          // Create a simple melody with different frequencies
          const frequency = 440 + Math.sin(time * 2) * 100;
          data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.1 * Math.exp(-time * 0.5);
        }
        
        // Convert to WAV blob
        const wavBlob = audioBufferToWav(buffer);
        const audioUrl = URL.createObjectURL(wavBlob);
        setGeneratedAudio(audioUrl);
        
        toast.success('Demo audio generated! Add a valid ElevenLabs API key for real TTS.');
        return audioUrl;
      }

      // Use ElevenLabsService for real audio generation
      const elevenLabsService = new ElevenLabsService(apiKey);
      
      // Prepare the text for generation
      const textToGenerate = feedback ? `${script}\n\nUser feedback: ${feedback}` : script;
      
      console.log('Generating audio with ElevenLabs API...');
      console.log('Voice ID:', voiceId);
      console.log('Text length:', textToGenerate.length);

      // Generate audio using the service
      const audioBlob = await elevenLabsService.generateAudio({
        text: textToGenerate,
        voice_id: voiceId,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      console.log('Audio generated successfully. Blob size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);
      
      toast.success('Audio generated successfully with ElevenLabs!');
      return audioUrl;
    } catch (error) {
      console.error('Error generating audio:', error);
      
      // Always fall back to demo audio on any error
      try {
        console.log('Falling back to demo audio due to error');
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const duration = 5;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
          const time = i / sampleRate;
          const frequency = 440 + Math.sin(time * 2) * 100;
          data[i] = Math.sin(2 * Math.PI * frequency * time) * 0.1 * Math.exp(-time * 0.5);
        }
        
        const wavBlob = audioBufferToWav(buffer);
        const audioUrl = URL.createObjectURL(wavBlob);
        setGeneratedAudio(audioUrl);
        
        toast.warning('Error occurred. Generated demo audio instead.');
        return audioUrl;
      } catch (fallbackError) {
        console.error('Even demo audio generation failed:', fallbackError);
        toast.error('Failed to generate any audio. Please try again.');
        throw fallbackError;
      }
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
    try {
      console.log('Uploading to storage:', fileName, 'Size:', audioBlob.size, 'Type:', audioBlob.type);
      
      const { data, error } = await supabase.storage
        .from('audio-posts')
        .upload(`${user?.id}/${fileName}`, audioBlob);

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful, data:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('audio-posts')
        .getPublicUrl(data.path);

      console.log('Public URL generated:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadAudioToStorage:', error);
      throw error;
    }
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
      
      console.log('Starting audio upload process...');
      console.log('Mode:', mode, 'Generated audio:', !!generatedAudio, 'Uploaded file:', !!uploadedFile);
      
      if (mode === 'upload' && uploadedFile) {
        // Upload the file to Supabase storage
        console.log('Uploading file to storage...');
        audioUrl = await uploadAudioToStorage(uploadedFile, `${Date.now()}-${uploadedFile.name}`);
      } else if (generatedAudio) {
        // Convert the generated audio URL to blob and upload
        console.log('Converting generated audio to blob...');
        const response = await fetch(generatedAudio);
        const audioBlob = await response.blob();
        console.log('Audio blob size:', audioBlob.size, 'Type:', audioBlob.type);
        audioUrl = await uploadAudioToStorage(audioBlob, `${Date.now()}-generated.mp3`);
      }

      console.log('Audio uploaded successfully, URL:', audioUrl);

      // Create the audio post
      console.log('Creating audio post in database...');
      const audioPostData = {
        title: data.title,
        description: data.description,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        audio_url: audioUrl,
        script: mode === 'ai' ? data.script : undefined,
        voice_id: mode === 'ai' ? data.voiceId : undefined,
        generation_type: mode,
        version: 1,
      };
      console.log('Audio post data:', audioPostData);
      
      const audioPost = await createAudioPost(audioPostData);
      console.log('Audio post created successfully:', audioPost);

      // Register audio content on blockchain for content protection
      try {
        console.log('Registering audio content on blockchain...');
        let audioFile: File | null = null;
        
        if (mode === 'upload' && uploadedFile) {
          // Use the uploaded file
          audioFile = uploadedFile;
        } else if (generatedAudio) {
          // Convert generated audio to File for blockchain registration
          const response = await fetch(generatedAudio);
          const audioBlob = await response.blob();
          audioFile = new File([audioBlob], `${data.title || 'audio'}.mp3`, {
            type: 'audio/mp3'
          });
        }
        
        if (audioFile) {
          const txnId = await registerProof(audioFile, 'audio', audioPost.id);
          if (txnId) {
            setBlockchainTxnId(txnId);
            console.log('Audio content successfully registered on blockchain:', txnId);
          }
        }
      } catch (blockchainError) {
        console.warn('Blockchain registration failed for audio content (post still saved):', blockchainError);
        // Don't fail the entire process if blockchain registration fails
      }

      setCurrentAudioPost(audioPost.id);
      toast.success('Audio post created successfully!');
    } catch (error) {
      console.error('Error creating audio post:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create audio post: ${error.message}`);
      } else {
        toast.error('Failed to create audio post');
      }
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border dark:border-gray-700">
        <div className="px-6 py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/create')}
                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Go back to create content"
                aria-label="Go back to create content"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Mic className="h-8 w-8 mr-3 text-purple-600 dark:text-purple-400" />
                  Create Audio Post
                </h2>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Generate AI-powered podcasts or upload your own audio content.
                </p>
                {!isApiAvailable && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                    Demo mode: Add VITE_ELEVENLABS_API_KEY to .env for real TTS
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:block">
              <ElevenLabsPoweredBy size="md" />
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
                  {loading ? 'Generating Audio...' : isApiAvailable ? 'Generate AI Podcast' : 'Generate Demo Audio'}
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
                
                {/* Blockchain Verification Badge */}
                {blockchainTxnId && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                      <Shield className="h-4 w-4 mr-2" />
                      Blockchain Verified
                      <a
                        href={`https://testnet.algoexplorer.io/tx/${blockchainTxnId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 inline-flex items-center text-green-600 hover:text-green-700"
                        title="View on blockchain"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                
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
                  {blockchainTxnId 
                    ? 'This content is permanently registered on the Algorand blockchain for authenticity verification.'
                    : 'This hash and timestamp can be used to verify the authenticity and creation time of your content.'
                  }
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