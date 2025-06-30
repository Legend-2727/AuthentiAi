import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export const AlgorandSetup: React.FC = () => {
  const [mnemonicSet, setMnemonicSet] = useState(false);
  const [isValidFormat, setIsValidFormat] = useState(false);

  useEffect(() => {
    // Check if mnemonic is configured
    const mnemonic = import.meta.env.VITE_ALGORAND_BACKEND_MNEMONIC || '';
    const hasValue = mnemonic.trim().length > 0;
    const isValid = hasValue && mnemonic.split(' ').length === 25;
    
    setMnemonicSet(hasValue);
    setIsValidFormat(isValid);
  }, []);

  const getStatusIcon = () => {
    if (!mnemonicSet) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (!isValidFormat) return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getStatusMessage = () => {
    if (!mnemonicSet) return 'Algorand mnemonic not configured';
    if (!isValidFormat) return 'Invalid mnemonic format (needs 25 words)';
    return 'Algorand blockchain integration ready';
  };

  const getStatusColor = () => {
    if (!mnemonicSet) return 'border-red-200 bg-red-50';
    if (!isValidFormat) return 'border-orange-200 bg-orange-50';
    return 'border-green-200 bg-green-50';
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center gap-3 mb-3">
        <Shield className="h-6 w-6 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Blockchain Configuration</h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">{getStatusMessage()}</p>
        
        {!mnemonicSet && (
          <div className="text-sm text-gray-700">
            <p className="mb-2">To enable blockchain ownership verification:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create an Algorand testnet account</li>
              <li>Add your 25-word mnemonic to <code className="px-1 py-0.5 bg-gray-200 rounded text-xs">.env</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        )}

        {mnemonicSet && !isValidFormat && (
          <div className="text-sm text-orange-800">
            <p>The configured mnemonic is invalid. Please check that:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>It contains exactly 25 words</li>
              <li>Words are separated by single spaces</li>
              <li>No extra characters or line breaks</li>
            </ul>
          </div>
        )}

        {mnemonicSet && isValidFormat && (
          <div className="text-sm text-green-800">
            <p>✨ Blockchain features are active! Files will be registered on Algorand testnet.</p>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <a
            href="https://algodesktool.web.app/wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Create Wallet <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://bank.testnet.algorand.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Get Testnet ALGOs <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://github.com/your-repo/blob/main/ALGORAND_SETUP_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Setup Guide <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
