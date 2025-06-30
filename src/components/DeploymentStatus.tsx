import React from 'react';
import { Shield, AlertTriangle, Database, Link } from 'lucide-react';

const DeploymentStatus: React.FC = () => {
  const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE || 'full';
  const isBlockchainOnlyMode = deploymentMode === 'blockchain-only';

  if (isBlockchainOnlyMode) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Link className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Blockchain-Only Mode
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Content is protected on Algorand blockchain. Database features are disabled for this deployment.
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="flex items-center text-xs text-green-700">
                <Shield className="h-3 w-3 mr-1" />
                Blockchain Protection: Active
              </span>
              <span className="flex items-center text-xs text-blue-700">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Cross-user Verification: Limited
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Database className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-green-800">
            Full Protection Mode
          </h3>
          <p className="text-sm text-green-700 mt-1">
            Complete ownership verification with blockchain and database integration.
          </p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="flex items-center text-xs text-green-700">
              <Shield className="h-3 w-3 mr-1" />
              Blockchain Protection: Active
            </span>
            <span className="flex items-center text-xs text-green-700">
              <Database className="h-3 w-3 mr-1" />
              Database Verification: Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStatus;
