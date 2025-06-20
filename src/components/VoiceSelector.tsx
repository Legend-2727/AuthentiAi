import { useState, useEffect } from 'react';
import { ChevronDown, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ElevenLabsVoice } from '../lib/elevenlabs';

interface VoiceSelectorProps {
  voices: ElevenLabsVoice[];
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  loading?: boolean;
}

const VoiceSelector = ({ voices, selectedVoice, onVoiceSelect, loading }: VoiceSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const selectedVoiceData = voices.find(v => v.voice_id === selectedVoice);

  useEffect(() => {
    // Cleanup audio elements on unmount
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);

  const playPreview = async (voice: ElevenLabsVoice) => {
    if (!voice.preview_url) return;

    // Stop any currently playing audio
    if (playingVoice && audioElements[playingVoice]) {
      audioElements[playingVoice].pause();
      setPlayingVoice(null);
    }

    // If clicking the same voice that's playing, just stop it
    if (playingVoice === voice.voice_id) {
      return;
    }

    try {
      let audio = audioElements[voice.voice_id];
      
      if (!audio) {
        audio = new Audio(voice.preview_url);
        audio.addEventListener('ended', () => setPlayingVoice(null));
        setAudioElements(prev => ({ ...prev, [voice.voice_id]: audio }));
      }

      setPlayingVoice(voice.voice_id);
      await audio.play();
    } catch (error) {
      console.error('Error playing preview:', error);
      setPlayingVoice(null);
    }
  };

  const stopPreview = (voiceId: string) => {
    if (audioElements[voiceId]) {
      audioElements[voiceId].pause();
      setPlayingVoice(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Voice
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <span className="block truncate">
            {selectedVoiceData ? selectedVoiceData.name : 'Select a voice...'}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
            >
              {voices.map((voice) => (
                <div
                  key={voice.voice_id}
                  className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                    selectedVoice === voice.voice_id ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  }`}
                  onClick={() => {
                    onVoiceSelect(voice.voice_id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="block font-medium">{voice.name}</span>
                      {voice.description && (
                        <span className="block text-xs text-gray-500 truncate">
                          {voice.description}
                        </span>
                      )}
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded mt-1">
                        {voice.category}
                      </span>
                    </div>
                    
                    {voice.preview_url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playingVoice === voice.voice_id) {
                            stopPreview(voice.voice_id);
                          } else {
                            playPreview(voice);
                          }
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        {playingVoice === voice.voice_id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {selectedVoice === voice.voice_id && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceSelector;