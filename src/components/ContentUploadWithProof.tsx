import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Shield, AlertCircle, CheckCircle, Hash, User, Calendar, ExternalLink } from 'lucide-react';
import { useBlockchainProof, OwnershipResult } from '../hooks/useBlockchainProof';
import BlockchainVerificationBadge from './BlockchainVerificationBadge';

interface ContentUploadWithProofProps {
  onProofRegistered?: (txnId: string, fileHash: string) => void;
  contentType: string;
  acceptedFileTypes?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

const ContentUploadWithProof: React.FC<ContentUploadWithProofProps> = ({
  onProofRegistered,
  contentType,
  acceptedFileTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
    'audio/*': ['.mp3', '.wav', '.m4a', '.aac']
  },
  maxSize = 100 * 1024 * 1024, // 100MB default
  className = ''
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'checking' | 'hashing' | 'registering' | 'success' | 'error' | 'ownership-conflict'>('idle');
  const [txnId, setTxnId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [ownershipInfo, setOwnershipInfo] = useState<OwnershipResult | null>(null);

  const { registerProof, checkOwnership, isLoading } = useBlockchainProof();

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setError('');
    setOwnershipInfo(null);
    setRegistrationStatus('checking');

    try {
      // First, check ownership
      const ownership = await checkOwnership(file);
      setOwnershipInfo(ownership);

      // Handle authentication or other errors
      if (ownership.error) {
        setRegistrationStatus('error');
        setError(ownership.error);
        return;
      }

      if (ownership.exists && !ownership.isOwner) {
        // Content exists and belongs to someone else
        setRegistrationStatus('ownership-conflict');
        setError(`This content is already owned by @${ownership.ownerUsername || 'unknown user'}. You cannot upload content that belongs to someone else.`);
        return;
      }

      if (ownership.exists && ownership.isOwner) {
        // Content exists and user is the owner - show existing registration
        setTxnId(ownership.txnId || '');
        setRegistrationStatus('success');
        const hash = await calculateFileHash(file);
        setFileHash(hash);
        onProofRegistered?.(ownership.txnId || '', hash);
        return;
      }

      // Content doesn't exist - proceed with registration
      setRegistrationStatus('hashing');
      
      // Calculate file hash
      const hash = await calculateFileHash(file);
      setFileHash(hash);
      
      setRegistrationStatus('registering');
      
      // Register proof on blockchain
      const result = await registerProof(file, contentType);
      
      if (result) {
        setTxnId(result);
        setRegistrationStatus('success');
        onProofRegistered?.(result, hash);
      } else {
        setRegistrationStatus('error');
        setError('Failed to register proof on blockchain');
      }
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRegistrationStatus('error');
    }
  }, [registerProof, checkOwnership, contentType, onProofRegistered]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize,
    multiple: false,
    disabled: registrationStatus === 'ownership-conflict' || isLoading
  });

  const getStatusIcon = () => {
    switch (registrationStatus) {
      case 'checking':
        return <Shield className="h-5 w-5 text-yellow-600 animate-pulse" />;
      case 'hashing':
        return <Hash className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'registering':
        return <Shield className="h-5 w-5 text-purple-600 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'ownership-conflict':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (registrationStatus) {
      case 'checking':
        return 'Checking content ownership...';
      case 'hashing':
        return 'Calculating file hash...';
      case 'registering':
        return 'Registering on Algorand blockchain...';
      case 'success':
        return ownershipInfo?.exists 
          ? 'Content already registered by you!'
          : 'Successfully registered on blockchain!';
      case 'ownership-conflict':
        return 'Content Ownership Conflict';
      case 'error':
        return error || 'Registration failed';
      default:
        return 'Drop files here or click to upload';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
          ${registrationStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${registrationStatus === 'ownership-conflict' ? 'border-red-500 bg-red-50 cursor-not-allowed' : ''}
          ${registrationStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          {getStatusIcon()}
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {getStatusMessage()}
            </p>
            
            {registrationStatus === 'idle' && (
              <p className="text-sm text-gray-500 mt-1">
                Supports {Object.values(acceptedFileTypes).flat().join(', ')} 
                (max {Math.round(maxSize / (1024 * 1024))}MB)
              </p>
            )}
            
            {uploadedFile && (
              <p className="text-sm text-gray-600 mt-2">
                File: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
              <ul className="text-sm text-red-700 mt-1">
                {fileRejections.map((rejection) => (
                  <li key={rejection.file.name}>
                    {rejection.file.name}: {rejection.errors.map(e => e.message).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* File Hash Display */}
      {fileHash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-3"
        >
          <div className="flex items-start space-x-2">
            <Hash className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">File Hash (SHA-256)</p>
              <p className="text-xs font-mono text-gray-600 break-all">{fileHash}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blockchain Verification Badge */}
      {registrationStatus === 'success' && txnId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BlockchainVerificationBadge
            proof={{
              id: '',
              user_id: '',
              content_id: null,
              content_type: contentType,
              filename: uploadedFile?.name || '',
              file_hash: fileHash,
              file_size: uploadedFile?.size || null,
              algorand_txn_id: txnId,
              algorand_explorer_url: `https://testnet.algoexplorer.io/tx/${txnId}`,
              verification_status: 'confirmed',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }}
            showDetails={true}
          />
        </motion.div>
      )}

      {/* Loading State */}
      {(isLoading || registrationStatus === 'hashing' || registrationStatus === 'registering') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-300 border-t-blue-600 mr-3"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Processing Blockchain Registration
              </p>
              <p className="text-xs text-blue-700">
                This may take a few moments as we register your content on the Algorand blockchain...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-indigo-900">
              Blockchain Content Protection
            </h4>
            <p className="text-sm text-indigo-700 mt-1">
              Your content will be cryptographically signed and registered on the Algorand blockchain, 
              providing immutable proof of ownership and authenticity.
            </p>
          </div>
        </div>
      </div>

      {/* Ownership Information */}
      {ownershipInfo && registrationStatus === 'ownership-conflict' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">Content Already Owned</h4>
              <div className="text-sm text-red-700 space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Owner: <strong>@{ownershipInfo.ownerUsername || 'Unknown User'}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Registered: {ownershipInfo.registrationDate ? new Date(ownershipInfo.registrationDate).toLocaleDateString() : 'Unknown'}</span>
                </div>
                {ownershipInfo.explorerUrl && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={ownershipInfo.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      View on Algorand Explorer
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-3 p-3 bg-red-100 rounded border text-sm text-red-800">
                <strong>⚠️ Upload Blocked:</strong> This content is protected by blockchain ownership verification. 
                Only the original owner can upload this content to prevent unauthorized copying and piracy.
              </div>
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setOwnershipInfo(null);
                    setRegistrationStatus('idle');
                    setError('');
                    setFileHash('');
                    setTxnId('');
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Try Different File
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Ownership Info */}
      {ownershipInfo && ownershipInfo.exists && ownershipInfo.isOwner && registrationStatus === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-2">Content Verified - You Are the Owner</h4>
              <div className="text-sm text-green-700 space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Originally registered: {ownershipInfo.registrationDate ? new Date(ownershipInfo.registrationDate).toLocaleDateString() : 'Unknown'}</span>
                </div>
                {ownershipInfo.explorerUrl && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <a 
                      href={ownershipInfo.explorerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      View Proof on Algorand Explorer
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContentUploadWithProof;
