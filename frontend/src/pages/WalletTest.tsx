import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WalletConnectButton, WalletStatus, useWallet } from '@/components/shared/WalletAdapter';
import { WalletDebug } from '@/components/shared/WalletDebug';
import { NetworkSwitcher } from '@/components/shared/NetworkSwitcher';
import { Wallet, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const WalletTest = () => {
  const { isConnected, address, getBalance } = useWallet();
  const [balance, setBalance] = React.useState<string>('0');

  React.useEffect(() => {
    if (isConnected) {
      loadBalance();
    }
  }, [isConnected]);

  const loadBalance = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Wallet Adapter Test</h1>
        <p className="text-muted-foreground">
          Test the MetaMask wallet integration for funding projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Wallet Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet size={20} />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WalletConnectButton />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <WalletStatus />
              </div>
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <NetworkSwitcher />

          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Wallet Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Address:</span>
                    <span className="text-sm font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Balance:</span>
                    <span className="text-sm">
                      {(parseInt(balance) / 1e18).toFixed(4)} AVAX
                    </span>
                  </div>
                  <Button onClick={loadBalance} size="sm" variant="outline">
                    Refresh Balance
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Connect your wallet to see information
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle size={20} />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p>1. Click "Connect Wallet" to connect MetaMask</p>
                <p>2. Approve the connection in MetaMask</p>
                <p>3. Switch to Avalanche Fuji Testnet if needed</p>
                <p>4. Your wallet address and balance will appear</p>
                <p>5. Go to Funding Management to fund projects</p>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="text-xs">
                  Make sure you're on Avalanche Fuji Testnet
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Debug Information */}
          <WalletDebug />
        </div>
      </div>



      {/* Test Funding Section */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Test Funding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your wallet is connected! You can now go to the Funding Management page to test funding projects.
            </p>
            <Button asChild>
              <a href="/funding-management">Go to Funding Management</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WalletTest;
