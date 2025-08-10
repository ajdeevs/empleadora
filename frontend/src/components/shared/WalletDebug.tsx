import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from './WalletAdapter';
import { Wallet, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export const WalletDebug: React.FC = () => {
  const { isConnected, address, isConnecting, connect, disconnect, getBalance } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [debugInfo, setDebugInfo] = useState<any>({});

  const checkMetaMask = () => {
    const info: any = {};
    
    // Check if window.ethereum exists
    info.hasEthereum = typeof window !== 'undefined' && !!window.ethereum;
    
    if (info.hasEthereum) {
      info.isMetaMask = window.ethereum?.isMetaMask;
      info.ethereumType = typeof window.ethereum;
    }
    
    // Check if we're in a browser environment
    info.isBrowser = typeof window !== 'undefined';
    
    // Check if we're in development
    info.isDevelopment = process.env.NODE_ENV === 'development';
    
    setDebugInfo(info);
  };

  const loadBalance = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Error loading balance:', error);
      setBalance('Error');
    }
  };

  React.useEffect(() => {
    checkMetaMask();
    if (isConnected) {
      loadBalance();
    }
  }, [isConnected]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} />
          Wallet Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
            {isConnected ? (
              <>
                <CheckCircle size={12} />
                Connected
              </>
            ) : (
              <>
                <AlertTriangle size={12} />
                Not Connected
              </>
            )}
          </Badge>
        </div>

        {/* Connection State */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">isConnected:</span> {isConnected.toString()}
          </div>
          <div>
            <span className="font-medium">isConnecting:</span> {isConnecting.toString()}
          </div>
          <div>
            <span className="font-medium">Address:</span> {address || 'None'}
          </div>
          <div>
            <span className="font-medium">Balance:</span> {balance} wei
          </div>
        </div>

        {/* Debug Information */}
        <div className="space-y-2">
          <h4 className="font-medium">Environment Check:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Has Ethereum:</span> {debugInfo.hasEthereum?.toString() || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Is MetaMask:</span> {debugInfo.isMetaMask?.toString() || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Is Browser:</span> {debugInfo.isBrowser?.toString() || 'Unknown'}
            </div>
            <div>
              <span className="font-medium">Is Development:</span> {debugInfo.isDevelopment?.toString() || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={checkMetaMask} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Debug Info
          </Button>
          {isConnected && (
            <Button onClick={loadBalance} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Balance
            </Button>
          )}
        </div>

        {/* Connection Actions */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connect} disabled={isConnecting} className="flex-1">
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive" className="flex-1">
              Disconnect
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Troubleshooting Steps:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Make sure MetaMask is installed and unlocked</li>
            <li>2. Check if MetaMask is on Avalanche Fuji Testnet (Chain ID: 43113)</li>
            <li>3. Try refreshing the page if connection fails</li>
            <li>4. Check browser console for error messages</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
