import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Wallet, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: any) => Promise<any>;
  sendTransaction: (transaction: any) => Promise<any>;
  getBalance: () => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
    return () => removeEventListeners();
  }, []);

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }
  };

  const removeEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', handleDisconnect);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnect();
    } else {
      // User switched accounts
      setAddress(accounts[0]);
      setupProvider();
    }
  };

  const handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Checking for existing connection...');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('Found accounts:', accounts);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await setupProvider();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const setupProvider = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Setting up provider...');
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const signer = await provider.getSigner();
        setSigner(signer);
        console.log('Provider and signer setup complete');
      } catch (error) {
        console.error('Error setting up provider:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this feature",
        variant: "destructive",
      });
      return;
    }

    if (isConnecting) {
      return; // Prevent multiple connection attempts
    }

    setIsConnecting(true);

    try {
      console.log('Requesting accounts...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('Received accounts:', accounts);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        await setupProvider();
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      } else {
        throw new Error('No accounts found');
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      let errorMessage = "Failed to connect to MetaMask";
      if (error.code === 4001) {
        errorMessage = "Connection rejected by user";
      } else if (error.code === -32002) {
        errorMessage = "Please check MetaMask for pending connection request";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setIsConnecting(false);
    
    toast({
      title: "Wallet Disconnected",
      description: "You have been disconnected from MetaMask",
    });
  };

  const signTransaction = async (transaction: any) => {
    if (!signer) {
      throw new Error('No signer available');
    }
    return await signer.signTransaction(transaction);
  };

  const sendTransaction = async (transaction: any) => {
    if (!signer) {
      throw new Error('No signer available');
    }
    return await signer.sendTransaction(transaction);
  };

  const getBalance = async (): Promise<string> => {
    if (!provider || !address) {
      return '0';
    }
    try {
      const balance = await provider.getBalance(address);
      return balance.toString();
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const getNetwork = async () => {
    if (!provider) return null;
    try {
      const network = await provider.getNetwork();
      return network;
    } catch (error) {
      console.error('Error getting network:', error);
      return null;
    }
  };

  const value: WalletContextType = {
    isConnected,
    address,
    isConnecting,
    connect,
    disconnect,
    signTransaction,
    sendTransaction,
    getBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletConnectButton: React.FC = () => {
  const { isConnected, address, connect, disconnect, isConnecting } = useWallet();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={isConnected ? "outline" : "default"} className="gap-2">
          <Wallet size={16} />
          {isConnected 
            ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
            : "Connect Wallet"
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wallet Connection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
                <div>
                  <p className="font-medium text-green-800">Connected to MetaMask</p>
                  <p className="text-sm text-green-600">{address}</p>
                </div>
              </div>
              <Button onClick={disconnect} variant="destructive" className="w-full">
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-yellow-800">Connect your MetaMask wallet to fund projects</p>
              </div>
              <Button 
                onClick={connect} 
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WalletStatus: React.FC = () => {
  const { isConnected, address } = useWallet();

  if (!isConnected) {
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle size={12} />
        Not Connected
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1">
      <CheckCircle size={12} />
      {address?.slice(0, 6)}...{address?.slice(-4)}
    </Badge>
  );
};
