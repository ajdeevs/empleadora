import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle, 
  ExternalLink, 
  Copy,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectionProps {
  onWalletConnected?: (address: string) => void;
  showBalance?: boolean;
  className?: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onWalletConnected, 
  showBalance = true,
  className = "" 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Avalanche Mainnet and Testnet chain IDs
  const AVALANCHE_MAINNET_CHAIN_ID = '0xa86a'; // 43114
  const AVALANCHE_TESTNET_CHAIN_ID = '0xa869'; // 43113

  useEffect(() => {
    checkWalletConnection();
    setupEventListeners();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const address = accounts[0];
          setAddress(address);
          setIsConnected(true);
          onWalletConnected?.(address);
          
          // Get balance and chain info
          await updateWalletInfo(address);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const newAddress = accounts[0];
      setAddress(newAddress);
      onWalletConnected?.(newAddress);
      updateWalletInfo(newAddress);
      toast({
        title: "Account Changed",
        description: `Switched to ${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`,
      });
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(chainId);
    window.location.reload(); // Reload page on chain change
  };

  const updateWalletInfo = async (address: string) => {
    try {
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      
      // Convert wei to AVAX
      const balanceInAvax = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInAvax.toFixed(4));

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
    } catch (error) {
      console.error('Error getting wallet info:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install it to continue.');
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setAddress(address);
        setIsConnected(true);
        onWalletConnected?.(address);
        
        await updateWalletInfo(address);
        
        toast({
          title: "Wallet Connected! 🎉",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });

        // Check if on correct network
        await checkAndSwitchNetwork();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const checkAndSwitchNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== AVALANCHE_MAINNET_CHAIN_ID && chainId !== AVALANCHE_TESTNET_CHAIN_ID) {
        // Try to switch to Avalanche testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AVALANCHE_TESTNET_CHAIN_ID }],
          });
        } catch (switchError: any) {
          // If the chain hasn't been added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: AVALANCHE_TESTNET_CHAIN_ID,
                chainName: 'Avalanche Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
                blockExplorerUrls: ['https://testnet.snowtrace.io/'],
              }],
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking/switching network:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    setBalance('');
    setChainId('');
    setError('');
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case AVALANCHE_MAINNET_CHAIN_ID:
        return 'Avalanche Mainnet';
      case AVALANCHE_TESTNET_CHAIN_ID:
        return 'Avalanche Testnet';
      default:
        return 'Unknown Network';
    }
  };

  const isCorrectNetwork = () => {
    return chainId === AVALANCHE_MAINNET_CHAIN_ID || chainId === AVALANCHE_TESTNET_CHAIN_ID;
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your MetaMask wallet to use the escrow system
              </p>
            </div>
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              size="lg"
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Wallet Connected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCorrectNetwork() && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Avalanche network to use the escrow system.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={checkAndSwitchNetwork}
              >
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Address:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://snowtrace.io/address/${address}`, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {showBalance && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance:</span>
              <span className="font-bold">{balance} AVAX</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <Badge variant={isCorrectNetwork() ? "default" : "destructive"}>
              {getNetworkName(chainId)}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateWalletInfo(address)}
            className="flex-1"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
            className="flex-1"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
