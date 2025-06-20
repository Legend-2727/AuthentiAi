import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Zap } from 'lucide-react';
import { useAudioThreads } from '../hooks/useAudioPosts';
import { AudioThread } from '../types/audio';

interface AudioThreadsProps {
  audioPostId: string;
  onRegenerateRequest: (feedback: string) => void;
}

const AudioThreads = ({ audioPostId, onRegenerateRequest }: AudioThreadsProps) => {
  const { threads, addThread } = useAudioThreads(audioPostId);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addThread(newMessage, 'user_feedback');
      setNewMessage('');
    } catch (error) {
      console.error('Error adding thread:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateRequest = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addThread(newMessage, 'regeneration_request');
      onRegenerateRequest(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error requesting regeneration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageIcon = (messageType: AudioThread['message_type']) => {
    switch (messageType) {
      case 'user_feedback':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'regeneration_request':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'system_response':
        return <div className="h-4 w-4 bg-green-500 rounded-full" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageBgColor = (messageType: AudioThread['message_type']) => {
    switch (messageType) {
      case 'user_feedback':
        return 'bg-blue-50 border-blue-200';
      case 'regeneration_request':
        return 'bg-orange-50 border-orange-200';
      case 'system_response':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
          Feedback & Iterations
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Provide feedback to improve your audio or request regeneration with modifications.
        </p>
      </div>

      <div className="px-6 py-4">
        {/* Thread Messages */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No feedback yet. Start a conversation about your audio!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${getMessageBgColor(thread.message_type)}`}
              >
                <div className="flex items-start space-x-2">
                  {getMessageIcon(thread.message_type)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{thread.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(thread.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* New Message Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your feedback or request changes... (e.g., 'Make it more enthusiastic', 'Slow down the pace', 'Add more emotion')"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
            disabled={isSubmitting}
          />
          
          <div className="flex space-x-2">
            <motion.button
              type="submit"
              disabled={!newMessage.trim() || isSubmitting}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-4 w-4 mr-2" />
              Add Feedback
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleRegenerateRequest}
              disabled={!newMessage.trim() || isSubmitting}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Regenerate with Changes
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AudioThreads;