import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, ArrowRight } from 'lucide-react';

const CreateContent = () => {
  const navigate = useNavigate();

  const handleCreateVideo = () => {
    navigate('/dashboard/create/video');
  };

  const handleCreateAudio = () => {
    // TODO: Implement audio creation flow
    alert('Audio creation coming soon!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200 bg-indigo-50">
          <h2 className="text-3xl font-bold text-gray-900">Create Content</h2>
          <p className="mt-1 text-gray-600">
            Choose the type of content you want to create.
          </p>
        </div>

        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Video Card */}
            <motion.div
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateVideo}
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <Video className="h-12 w-12" />
                  <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Create Video</h3>
                <p className="text-purple-100 mb-4">
                  Generate AI-powered videos with custom scripts and templates.
                </p>
                <div className="flex items-center text-sm text-purple-200">
                  <span>Click to start creating</span>
                </div>
              </div>
            </motion.div>

            {/* Create Audio Card */}
            <motion.div
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateAudio}
            >
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg p-8 text-white shadow-lg hover:shadow-xl transition-shadow opacity-50">
                <div className="flex items-center justify-between mb-4">
                  <Mic className="h-12 w-12" />
                  <ArrowRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Create Audio</h3>
                <p className="text-green-100 mb-4">
                  Generate AI-powered audio content and voiceovers.
                </p>
                <div className="flex items-center text-sm text-green-200">
                  <span>Coming soon</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features Section */}
          <div className="mt-12">
            <h3 className="text-lg font-medium text-gray-900 mb-6">What you can create:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Video className="h-6 w-6 text-indigo-600" />
                </div>
                <h4 className="font-medium text-gray-900">AI Videos</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Create professional videos with AI-generated content
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Mic className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900">Voice Content</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Generate natural-sounding voiceovers and audio
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900">Quick Export</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Export and share your content in multiple formats
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateContent;