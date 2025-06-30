import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ContentUploadWithProof from '../components/ContentUploadWithProof';
import { DatabaseStatus } from '../components/DatabaseStatus';
import { AlgorandSetup } from '../components/AlgorandSetup';

const OwnershipDemo = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Blockchain Content Ownership
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Protect your content with blockchain-based ownership verification. 
            Only the original creator can upload protected content.
          </p>
        </motion.div>

        {/* Authentication Check */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center">
              <LogIn className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Authentication Required</h3>
                <p className="text-yellow-700 mt-1">
                  You need to log in to test blockchain ownership verification. 
                  <a href="/login" className="font-medium underline ml-1">
                    Please log in here
                  </a>.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <DatabaseStatus />
          <AlgorandSetup />
        </motion.div>

        {/* How it Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Lock className="h-6 w-6 text-indigo-600 mr-2" />
            How Content Protection Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload & Hash</h3>
              <p className="text-gray-600 text-sm">
                When you upload content, we calculate its unique SHA-256 hash fingerprint
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Blockchain Registration</h3>
              <p className="text-gray-600 text-sm">
                The hash is registered on Algorand blockchain with your ownership proof
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Protection Active</h3>
              <p className="text-gray-600 text-sm">
                Anyone trying to upload the same content will be blocked unless they're the owner
              </p>
            </div>
          </div>
        </motion.div>

        {/* Demo Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Demo Scenarios</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-800">✅ Allowed Upload</h3>
              </div>
              <p className="text-green-700 text-sm">
                When you upload new content or content you already own, 
                it will be successfully registered or verified on the blockchain.
              </p>
            </div>
            
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="font-semibold text-red-800">🚫 Blocked Upload</h3>
              </div>
              <p className="text-red-700 text-sm">
                If you try to upload content that belongs to someone else, 
                the system will block the upload and show the original owner.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Demo - Only show when authenticated */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Try It Yourself</h2>
            <p className="text-gray-600 mb-6">
              Upload any file to see the ownership verification in action. 
              Try uploading the same file multiple times to see how the system detects duplicates.
            </p>
            
            <ContentUploadWithProof
              contentType="demo"
              onProofRegistered={(txnId, hash) => {
                console.log('Demo file registered:', { txnId, hash });
              }}
              acceptedFileTypes={{
                'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
                'audio/*': ['.mp3', '.wav', '.m4a', '.aac'],
                'application/*': ['.pdf', '.doc', '.docx', '.txt']
              }}
              className="border-2 border-dashed border-indigo-300"
            />
          </motion.div>
        )}

        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Status</h2>
          <DatabaseStatus />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 p-6 bg-indigo-50 rounded-lg"
        >
          <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-semibold text-indigo-900 mb-2">Powered by Algorand Blockchain</h3>
          <p className="text-indigo-700 text-sm">
            Content ownership proofs are immutably stored on the Algorand blockchain, 
            providing transparent and tamper-proof verification of your creative rights.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OwnershipDemo;
