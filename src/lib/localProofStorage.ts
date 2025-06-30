// localStorage-based proof storage as fallback for Supabase limitations
// This provides client-side ownership verification when database is unavailable

export interface LocalProof {
  hash: string;
  filename: string;
  userId: string;
  contentType: string;
  fileSize: number;
  txnId: string;
  timestamp: number;
  explorerUrl: string;
}

const PROOFS_STORAGE_KEY = 'veridica_proofs';

export class LocalProofStorage {
  static saveProof(proof: LocalProof): void {
    try {
      const existingProofs = this.getAllProofs();
      const updatedProofs = [proof, ...existingProofs.filter(p => p.hash !== proof.hash)];
      localStorage.setItem(PROOFS_STORAGE_KEY, JSON.stringify(updatedProofs));
      console.log('Proof saved to localStorage:', proof.hash);
    } catch (error) {
      console.error('Failed to save proof to localStorage:', error);
    }
  }

  static getProofByHash(hash: string): LocalProof | null {
    try {
      const proofs = this.getAllProofs();
      return proofs.find(p => p.hash === hash) || null;
    } catch (error) {
      console.error('Failed to get proof from localStorage:', error);
      return null;
    }
  }

  static getUserProofs(userId: string): LocalProof[] {
    try {
      const proofs = this.getAllProofs();
      return proofs.filter(p => p.userId === userId);
    } catch (error) {
      console.error('Failed to get user proofs from localStorage:', error);
      return [];
    }
  }

  static getAllProofs(): LocalProof[] {
    try {
      const stored = localStorage.getItem(PROOFS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse proofs from localStorage:', error);
      return [];
    }
  }

  static checkOwnership(hash: string, userId: string): {
    exists: boolean;
    isOwner: boolean;
    proof?: LocalProof;
  } {
    try {
      const proof = this.getProofByHash(hash);
      if (!proof) {
        return { exists: false, isOwner: false };
      }
      return {
        exists: true,
        isOwner: proof.userId === userId,
        proof
      };
    } catch (error) {
      console.error('Failed to check ownership from localStorage:', error);
      return { exists: false, isOwner: false };
    }
  }

  static clearAll(): void {
    try {
      localStorage.removeItem(PROOFS_STORAGE_KEY);
      console.log('All proofs cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear proofs from localStorage:', error);
    }
  }

  static getStorageInfo(): {
    totalProofs: number;
    storageSize: number;
  } {
    try {
      const proofs = this.getAllProofs();
      const storageSize = new Blob([localStorage.getItem(PROOFS_STORAGE_KEY) || '']).size;
      return {
        totalProofs: proofs.length,
        storageSize
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { totalProofs: 0, storageSize: 0 };
    }
  }
}
