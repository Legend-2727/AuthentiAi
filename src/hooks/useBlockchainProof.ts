import { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { algorandService, BlockchainProof } from '../lib/algorand';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../lib/database.types';
import { LocalProofStorage, type LocalProof } from '../lib/localProofStorage';

type ProofRecord = Database['public']['Tables']['proofs']['Row'];

export interface UseBlockchainProofResult {
  isLoading: boolean;
  registerProof: (file: File, contentType: string, contentId?: string) => Promise<string | null>;
  verifyProof: (txnId: string) => Promise<boolean>;
  checkOwnership: (file: File) => Promise<OwnershipResult>;
  getUserProofs: () => Promise<(ProofRecord | LocalProof)[]>;
  testConnection: () => Promise<boolean>;
}

export interface OwnershipResult {
  exists: boolean;
  isOwner: boolean;
  ownerEmail?: string;
  ownerUsername?: string;
  registrationDate?: string;
  txnId?: string;
  explorerUrl?: string;
  error?: string;
}

export const useBlockchainProof = (): UseBlockchainProofResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [proofs, setProofs] = useState<ProofRecord[]>([]);
  const { user } = useAuth();

  // Check deployment mode
  const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE || 'full';
  const isBlockchainOnlyMode = deploymentMode === 'blockchain-only';

  const registerProof = async (
    file: File, 
    contentType: string, 
    contentId?: string
  ): Promise<string | null> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return null;
    }

    setIsLoading(true);
    try {
      console.log('Starting blockchain proof registration...');
      
      // Calculate file hash
      const fileHash = await algorandService.calculateFileHash(file);
      console.log('File hash calculated:', fileHash);

      // Check if this hash already exists and get owner info
      const { data: existingProof } = await supabase
        .from('proofs')
        .select('*')
        .eq('file_hash', fileHash)
        .single();

      if (existingProof) {
        // Check if current user is the owner
        if (existingProof.user_id === user.id) {
          toast.info('This content is already registered by you on the blockchain');
          return existingProof.algorand_txn_id;
        } else {
          // Content belongs to someone else - get owner info
          const { data: ownerData } = await supabase
            .from('users')
            .select('username')
            .eq('id', existingProof.user_id)
            .single();
          
          const ownerUsername = ownerData?.username || 'unknown user';
          toast.error(
            `This content is already owned by @${ownerUsername}. You cannot upload content that belongs to someone else.`
          );
          return null;
        }
      }

      // Create blockchain proof
      const proof: BlockchainProof = {
        hash: fileHash,
        filename: file.name,
        userId: user.id,
        contentType,
        fileSize: file.size
      };

      // Register on Algorand
      const blockchainResult = await algorandService.registerProof(proof);
      
      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error || 'Failed to register proof on blockchain');
      }

      console.log('Blockchain registration successful:', blockchainResult);

      // Skip database operations in blockchain-only mode
      if (isBlockchainOnlyMode) {
        console.log('Blockchain-only mode: Skipping database storage');
        toast.success('Content registered on blockchain (blockchain-only mode)');
        return blockchainResult.txnId!;
      }

      // Save to database (only in full mode)
      const { data: dbResult, error: dbError } = await supabase
        .from('proofs')
        .insert({
          user_id: user.id,
          content_id: contentId || null,
          content_type: contentType,
          filename: file.name,
          file_hash: fileHash,
          file_size: file.size,
          algorand_txn_id: blockchainResult.txnId!,
          algorand_explorer_url: blockchainResult.explorerUrl!,
          verification_status: 'confirmed'
        })
        .select()
        .single();

      if (dbError) {
        // Handle table not found or other database errors
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist') || dbError.message?.includes('PRO FEATURE ONLY')) {
          console.warn('Database unavailable. Checking environment...');
          
          // Prevent localStorage usage in production
          if (process.env.NODE_ENV === 'production') {
            console.error('❌ PRODUCTION ERROR: Database access required for production deployment');
            toast.error('Database required for ownership verification. Please contact support.');
            throw new Error('Database access required for production deployment');
          }
          
          console.warn('Development mode: Saving proof to localStorage as fallback.');
          
          // Save to localStorage as fallback (development only)
          const localProof: LocalProof = {
            hash: fileHash,
            filename: file.name,
            userId: user.id,
            contentType,
            fileSize: file.size,
            txnId: blockchainResult.txnId!,
            timestamp: Date.now(),
            explorerUrl: blockchainResult.explorerUrl!
          };
          
          LocalProofStorage.saveProof(localProof);
          toast.success('Content registered on blockchain (stored locally - DEV MODE)');
          return blockchainResult.txnId!;
        }
        
        console.error('Database error:', dbError);
        throw new Error('Failed to save proof record');
      }

      console.log('Proof saved to database:', dbResult);
      
      toast.success(
        `Content successfully registered on Algorand blockchain! Transaction: ${blockchainResult.txnId?.slice(0, 8)}...`
      );

      return blockchainResult.txnId!;

    } catch (error) {
      console.error('Error registering proof:', error);
      toast.error(`Failed to register proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyProof = async (txnId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await algorandService.verifyProof(txnId);
      
      if (result.verified) {
        toast.success('Proof verified successfully on blockchain!');
        return true;
      } else {
        toast.error(`Verification failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
      toast.error('Failed to verify proof');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkOwnership = async (file: File): Promise<OwnershipResult> => {
    try {
      console.log('Checking content ownership...');
      
      // Calculate file hash
      const fileHash = await algorandService.calculateFileHash(file);
      console.log('File hash for ownership check:', fileHash);

      // Check if user is authenticated
      if (!user) {
        console.warn('User not authenticated. Ownership verification requires login.');
        return {
          exists: false,
          isOwner: false,
          error: 'Authentication required for ownership verification'
        };
      }

      // In blockchain-only mode, skip ownership checks
      if (isBlockchainOnlyMode) {
        console.log('Blockchain-only mode: Skipping ownership verification');
        return {
          exists: false,
          isOwner: false,
          error: 'Ownership verification disabled in blockchain-only mode'
        };
      }

      // Check if this hash exists in our database (simple query without joins)
      const { data: existingProof, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('file_hash', fileHash)
        .single();

      if (error) {
        // Handle authentication/authorization errors (common with RLS)
        if (error.message?.includes('Invalid API key') || 
            error.message?.includes('PRO FEATURE ONLY') || 
            error.details?.includes('PRO FEATURE ONLY') ||
            JSON.stringify(error).includes('PRO FEATURE ONLY') ||
            error.code === '401' ||
            error.code === '400') {
          console.warn('Database access restricted. Checking environment...');
          
          // Prevent localStorage usage in production
          if (process.env.NODE_ENV === 'production') {
            console.error('❌ PRODUCTION ERROR: Database access required for ownership verification');
            return {
              exists: false,
              isOwner: false,
              error: 'Database access required for production deployment'
            };
          }
          
          console.warn('Development mode: Checking localStorage fallback...');
          
          // Try localStorage fallback (development only)
          const localOwnership = LocalProofStorage.checkOwnership(fileHash, user.id);
          if (localOwnership.exists) {
            return {
              exists: true,
              isOwner: localOwnership.isOwner,
              txnId: localOwnership.proof?.txnId,
              explorerUrl: localOwnership.proof?.explorerUrl,
              error: 'Using local storage (database unavailable - DEV MODE)'
            };
          }
          
          return {
            exists: false,
            isOwner: false,
            error: 'Database unavailable - content ownership unknown (DEV MODE)'
          };
        }
        
        // Handle table not found or other database errors
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Proofs table not found or inaccessible. Content ownership verification is disabled.');
          // Return that content doesn't exist (allow upload) when table is not available
          return {
            exists: false,
            isOwner: false
          };
        }
        
        if (error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Database error during ownership check:', error);
          // Instead of throwing, return a safe fallback
          console.warn('Allowing upload due to database verification failure');
          return {
            exists: false,
            isOwner: false,
            error: 'Content ownership verification failed - allowing upload'
          };
        }
      }

      if (!existingProof) {
        // Content doesn't exist - user can upload
        return {
          exists: false,
          isOwner: false
        };
      }

      // Content exists - check ownership
      const isOwner = existingProof.user_id === user?.id;
      
      // If we need owner info and it's not the current user, fetch it separately
      let ownerInfo = null;
      if (!isOwner) {
        // Try to get owner information from the public users table
        const { data: ownerData } = await supabase
          .from('users')
          .select('email, username')
          .eq('id', existingProof.user_id)
          .single();
        
        ownerInfo = ownerData;
      }
      
      return {
        exists: true,
        isOwner,
        ownerEmail: ownerInfo?.email || (isOwner ? user?.email : 'Unknown'),
        ownerUsername: ownerInfo?.username || (isOwner ? user?.user_metadata?.username : 'Unknown User'),
        registrationDate: existingProof.created_at,
        txnId: existingProof.algorand_txn_id,
        explorerUrl: existingProof.algorand_explorer_url || undefined
      };

    } catch (error) {
      console.error('Error checking ownership:', error);
      throw error;
    }
  };

  const getUserProofs = async (): Promise<(ProofRecord | LocalProof)[]> => {
    if (!user?.id) {
      return [];
    }

    try {
      // Try database first
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // If database fails, fall back to localStorage
        console.warn('Database unavailable for user proofs, using localStorage:', error);
        const localProofs = LocalProofStorage.getUserProofs(user.id);
        return localProofs;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user proofs:', error);
      // Fallback to localStorage
      return LocalProofStorage.getUserProofs(user.id);
    }
  };

  const testConnection = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await algorandService.testConnection();
      
      if (result.connected) {
        toast.success('Successfully connected to Algorand network!');
        console.log('Algorand status:', result.status);
        return true;
      } else {
        toast.error(`Connection failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    registerProof,
    verifyProof,
    checkOwnership,
    getUserProofs,
    testConnection
  };
};
