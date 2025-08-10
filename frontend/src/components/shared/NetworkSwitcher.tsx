import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from './WalletAdapter';
import { Network, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AVALANCHE_FUJI = {
  chainId: '0xa869', // 43113 in hex
  chainName: 'Avalanche Fuji C-Chain',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export const NetworkSwitcher: React.FC = () => {
  const { isConnected, provider } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<string>('');
  const [isSwitching, setIsSwitching] = useState(false);

  const checkCurrentNetwork = async () => {
    if (!provider) return;
    
    try {
      const network = await provider.getNetwork();
      setCurrentChainId(network.chainId.toString());
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const switchToAvalancheFuji = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to switch networks",
        variant: "destructive",
      });
      return;
    }

    setIsSwitching(true);

    try {
      // Try to switch to Avalanche Fuji
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: AVALANCHE_FUJI.chainId }],
      });
      
      toast({
        title: "Network Switched",
        description: "Successfully switched to Avalanche Fuji Testnet",
      });
      
      // Refresh the page to update the provider
      window.location.reload();
      
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [AVALANCHE_FUJI],
          });
          
          toast({
            title: "Network Added",
            description: "Avalanche Fuji Testnet has been added to MetaMask",
          });
          
          // Refresh the page to update the provider
          window.location.reload();
          
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast({
            title: "Network Add Failed",
            description: "Failed to add Avalanche Fuji Testnet to MetaMask",
            variant: "destructive",
          });
        }
      } else {
        console.error('Error switching network:', switchError);
        toast({
          title: "Network Switch Failed",
          description: "Failed to switch to Avalanche Fuji Testnet",
          variant: "destructive",
        });
      }
    } finally {
      setIsSwitching(false);
    }
  };

  React.useEffect(() => {
    if (isConnected) {
      checkCurrentNetwork();
    }
  }, [isConnected, provider]);

  const isCorrectNetwork = currentChainId === '43113';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network size={20} />
          Network Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="text-yellow-600" size={16} />
            <span className="text-sm text-yellow-800">
              Connect your wallet first to check network
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Network Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">Current Network:</span>
                <div className="text-sm text-muted-foreground">
                  Chain ID: {currentChainId || 'Unknown'}
                </div>
              </div>
              <Badge variant={isCorrectNetwork ? "default" : "destructive"} className="gap-1">
                {isCorrectNetwork ? (
                  <>
                    <CheckCircle size={12} />
                    Correct Network
                  </>
                ) : (
                  <>
                    <AlertTriangle size={12} />
                    Wrong Network
                  </>
                )}
              </Badge>
            </div>

            {/* Network Information */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-blue-800 mb-2">Required Network:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Name:</strong> Avalanche Fuji C-Chain</div>
                <div><strong>Chain ID:</strong> 43113 (0xa869)</div>
                <div><strong>Currency:</strong> AVAX</div>
                <div><strong>RPC URL:</strong> https://api.avax-test.network/ext/bc/C/rpc</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                onClick={checkCurrentNetwork} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              {!isCorrectNetwork && (
                <Button 
                  onClick={switchToAvalancheFuji}
                  disabled={isSwitching}
                  className="flex-1"
                >
                  {isSwitching ? 'Switching...' : 'Switch to Avalanche Fuji'}
                </Button>
              )}
            </div>

            {/* Instructions */}
            {!isCorrectNetwork && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <h4 className="font-medium text-orange-800 mb-2">Manual Setup:</h4>
                <ol className="text-sm text-orange-700 space-y-1">
                  <li>1. Open MetaMask</li>
                  <li>2. Click the network dropdown</li>
                  <li>3. Select "Add Network"</li>
                  <li>4. Add the following details:</li>
                  <li className="ml-4">• Network Name: Avalanche Fuji C-Chain</li>
                  <li className="ml-4">• RPC URL: https://api.avax-test.network/ext/bc/C/rpc</li>
                  <li className="ml-4">• Chain ID: 43113</li>
                  <li className="ml-4">• Currency Symbol: AVAX</li>
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
