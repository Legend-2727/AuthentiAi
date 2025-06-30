import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ExternalLink, Hash, Clock, User } from 'lucide-react';
import { Database } from '../lib/database.types';

type ProofRecord = Database['public']['Tables']['proofs']['Row'];

interface BlockchainVerificationBadgeProps {
  proof: ProofRecord | null;
  isLoading?: boolean;
  showDetails?: boolean;
}

const BlockchainVerificationBadge: React.FC<BlockchainVerificationBadgeProps> = ({
  proof,
  isLoading = false,
  showDetails = false
}) => {
  if (isLoading) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
        Verifying...
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
        <Shield className="h-4 w-4 mr-2" />
        Not Verified
      </div>
    );
  }

  const statusColor = proof.verification_status === 'confirmed' 
    ? 'bg-green-100 text-green-800' 
    : 'bg-yellow-100 text-yellow-800';

  if (!showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${statusColor}`}
      >
        <Shield className="h-4 w-4 mr-2" />
        Blockchain Verified
        {proof.algorand_explorer_url && (
          <a
            href={proof.algorand_explorer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hover:opacity-70"
            title="View on Algorand Explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${
        proof.verification_status === 'confirmed' 
          ? 'border-green-200 bg-green-50' 
          : 'border-yellow-200 bg-yellow-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <Shield className={`h-5 w-5 mr-2 ${
            proof.verification_status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
          }`} />
          <div>
            <h4 className={`font-medium ${
              proof.verification_status === 'confirmed' ? 'text-green-900' : 'text-yellow-900'
            }`}>
              Blockchain Verified
            </h4>
            <p className={`text-sm ${
              proof.verification_status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'
            }`}>
              Content authenticity registered on Algorand
            </p>
          </div>
        </div>
        {proof.algorand_explorer_url && (
          <a
            href={proof.algorand_explorer_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
              proof.verification_status === 'confirmed'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            View on Explorer
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <Hash className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">File Hash:</span>
            <p className="font-mono text-gray-600 break-all">
              {proof.file_hash.slice(0, 16)}...{proof.file_hash.slice(-8)}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Registered:</span>
            <p className="text-gray-600">
              {new Date(proof.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Transaction:</span>
            <p className="font-mono text-gray-600 break-all">
              {proof.algorand_txn_id.slice(0, 12)}...{proof.algorand_txn_id.slice(-6)}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className={`capitalize ${
              proof.verification_status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {proof.verification_status}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded border">
        <h5 className="font-medium text-gray-900 mb-2">What this means:</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Content ownership is permanently recorded on Algorand blockchain</li>
          <li>• File integrity is cryptographically verified via SHA-256 hash</li>
          <li>• Timestamp proves when content was first registered</li>
          <li>• Immutable proof prevents unauthorized ownership claims</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default BlockchainVerificationBadge;
