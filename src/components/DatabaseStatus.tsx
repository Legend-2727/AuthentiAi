import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface DatabaseStatusProps {
  className?: string;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'available' | 'missing' | 'error'>('checking');
  const [details, setDetails] = useState<string>('');

  const checkTableStatus = async () => {
    setStatus('checking');
    try {
      const { error } = await supabase
        .from('proofs')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('PRO FEATURE ONLY') || error.message?.includes('failed to parse')) {
          setStatus('missing');
          setDetails('Table does not exist or access is restricted (free tier limitation)');
        } else {
          setStatus('error');
          setDetails(`Error: ${error.message}`);
        }
      } else {
        setStatus('available');
        setDetails('Table is accessible and working');
      }
    } catch (err) {
      setStatus('error');
      setDetails(`Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  React.useEffect(() => {
    checkTableStatus();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return 'text-yellow-600';
      case 'available': return 'text-green-600';
      case 'missing': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔄';
      case 'available': return '✅';
      case 'missing': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <h3 className="font-semibold">Database Status</h3>
        <button
          onClick={checkTableStatus}
          className="ml-auto px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className={`text-sm ${getStatusColor()}`}>
        <p className="font-medium">Proofs Table: {status.toUpperCase()}</p>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{details}</p>
      </div>

      {status === 'missing' && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Setup Required:</strong> The blockchain proofs table needs to be created in Supabase.
            See the <code>SUPABASE_SETUP_GUIDE.md</code> file for instructions.
          </p>
        </div>
      )}

      {status === 'available' && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✨ Blockchain ownership verification is fully operational!
          </p>
        </div>
      )}
    </div>
  );
};
