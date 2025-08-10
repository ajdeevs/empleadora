import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  DollarSign, 
  Send, 
  RefreshCw,
  ExternalLink,
  Info,
  Wallet,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

interface SupportedTokens {
  [key: string]: TokenInfo;
}

interface TokenFundingFormData {
  projectId: string;
  milestoneId: string;
  clientWalletAddress: string;
  amount: string;
  selectedToken: string;
}

interface ProjectCreationData {
  clientWallet: string;
  freelancerWallet: string;
  amounts: string[];
  tokens: string[];
  milestones: Array<{
    amount: string;
    token: string;
    title: string;
    description: string;
  }>;
}

const TokenFunding: React.FC = () => {
  const [supportedTokens, setSupportedTokens] = useState<SupportedTokens>({});
  const [fundingForm, setFundingForm] = useState<TokenFundingFormData>({
    projectId: '',
    milestoneId: '',
    clientWalletAddress: '',
    amount: '',
    selectedToken: ''
  });

  const [projectForm, setProjectForm] = useState<ProjectCreationData>({
    clientWallet: '',
    freelancerWallet: '',
    amounts: [''],
    tokens: [''],
    milestones: [{ amount: '', token: '', title: '', description: '' }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [activeTab, setActiveTab] = useState('fund');
  const { toast } = useToast();

  useEffect(() => {
    loadSupportedTokens();
    checkWalletConnection();
  }, []);

  const loadSupportedTokens = async () => {
    try {
      const response = await fetch('http://localhost:5000/funding-with-tokens/supported-tokens');
      if (response.ok) {
        const data = await response.json();
        setSupportedTokens(data.tokens);
      }
    } catch (error) {
      console.error('Error loading supported tokens:', error);
      // Fallback to mock data
      setSupportedTokens({
        'Native AVAX': {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'AVAX',
          decimals: 18,
          name: 'Avalanche'
        },
        'USDC': {
          address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
          symbol: 'USDC',
          decimals: 6,
          name: 'USD Coin'
        },
        'USDT': {
          address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
          symbol: 'USDT',
          decimals: 6,
          name: 'Tether USD'
        },
        'DAI': {
          address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
          symbol: 'DAI',
          decimals: 18,
          name: 'Dai Stablecoin'
        }
      });
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setFundingForm(prev => ({ ...prev, clientWalletAddress: accounts[0] }));
          setProjectForm(prev => ({ ...prev, clientWallet: accounts[0] }));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedWallet(accounts[0]);
        setFundingForm(prev => ({ ...prev, clientWalletAddress: accounts[0] }));
        setProjectForm(prev => ({ ...prev, clientWallet: accounts[0] }));
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0]}`,
        });
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive"
      });
    }
  };

  const handleTokenFunding = async () => {
    if (!fundingForm.projectId || !fundingForm.milestoneId || !fundingForm.amount || !fundingForm.selectedToken) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedTokenInfo = Object.values(supportedTokens).find(token => token.symbol === fundingForm.selectedToken);
      
      const response = await fetch('http://localhost:5000/funding-with-tokens/fund-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: parseInt(fundingForm.projectId),
          milestoneId: parseInt(fundingForm.milestoneId),
          clientWalletAddress: fundingForm.clientWalletAddress,
          amount: fundingForm.amount,
          tokenAddress: selectedTokenInfo?.address || '0x0000000000000000000000000000000000000000'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Milestone funded with ${fundingForm.selectedToken}! TX: ${result.transactionHash}`,
        });

        // Reset form
        setFundingForm(prev => ({
          ...prev,
          projectId: '',
          milestoneId: '',
          amount: '',
          selectedToken: ''
        }));
      } else {
        toast({
          title: "Funding Failed",
          description: result.error || "Failed to fund milestone",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error funding milestone:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMilestone = () => {
    setProjectForm(prev => ({
      ...prev,
      amounts: [...prev.amounts, ''],
      tokens: [...prev.tokens, ''],
      milestones: [...prev.milestones, { amount: '', token: '', title: '', description: '' }]
    }));
  };

  const removeMilestone = (index: number) => {
    if (projectForm.milestones.length > 1) {
      setProjectForm(prev => ({
        ...prev,
        amounts: prev.amounts.filter((_, i) => i !== index),
        tokens: prev.tokens.filter((_, i) => i !== index),
        milestones: prev.milestones.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    setProjectForm(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      
      const newAmounts = [...prev.amounts];
      const newTokens = [...prev.tokens];
      
      if (field === 'amount') {
        newAmounts[index] = value;
      } else if (field === 'token') {
        const tokenInfo = Object.values(supportedTokens).find(token => token.symbol === value);
        newTokens[index] = tokenInfo?.address || '0x0000000000000000000000000000000000000000';
      }
      
      return {
        ...prev,
        amounts: newAmounts,
        tokens: newTokens,
        milestones: newMilestones
      };
    });
  };

  const handleCreateTokenProject = async () => {
    if (!projectForm.clientWallet || !projectForm.freelancerWallet || projectForm.milestones.some(m => !m.amount || !m.token)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/funding-with-tokens/create-project-with-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientWallet: projectForm.clientWallet,
          freelancerWallet: projectForm.freelancerWallet,
          amounts: projectForm.amounts,
          tokens: projectForm.tokens
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Multi-token project created! TX: ${result.transactionHash}`,
        });

        // Reset form
        setProjectForm({
          clientWallet: connectedWallet,
          freelancerWallet: '',
          amounts: [''],
          tokens: [''],
          milestones: [{ amount: '', token: '', title: '', description: '' }]
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create project",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const TokenCard: React.FC<{ token: TokenInfo; symbol: string }> = ({ token, symbol }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <span className="font-semibold">{symbol}</span>
          </div>
          <Badge variant="secondary">{token.decimals} decimals</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{token.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-muted p-1 rounded text-muted-foreground">
            {token.address === '0x0000000000000000000000000000000000000000' 
              ? 'Native Token' 
              : `${token.address.slice(0, 6)}...${token.address.slice(-4)}`
            }
          </span>
          {token.address !== '0x0000000000000000000000000000000000000000' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://snowtrace.io/token/${token.address}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Coins className="w-8 h-8" />
          Multi-Token Funding
        </h1>
        <p className="text-muted-foreground">
          Fund milestones and create projects using various cryptocurrencies
        </p>
      </div>

      {/* Wallet Connection */}
      {!connectedWallet ? (
        <Alert className="mb-6">
          <Wallet className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connect your wallet to interact with multi-token funding</span>
            <Button onClick={connectWallet} size="sm">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <span>Wallet connected: {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fund">Fund Milestone</TabsTrigger>
          <TabsTrigger value="create">Create Project</TabsTrigger>
          <TabsTrigger value="tokens">Supported Tokens</TabsTrigger>
        </TabsList>

        {/* Fund Milestone Tab */}
        <TabsContent value="fund" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Fund Milestone with Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You can fund milestones using AVAX or any supported ERC-20 token. 
                  Make sure you have sufficient balance and token allowance.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fund-project-id">Project ID</Label>
                  <Input
                    id="fund-project-id"
                    type="number"
                    value={fundingForm.projectId}
                    onChange={(e) => setFundingForm(prev => ({ ...prev, projectId: e.target.value }))}
                    placeholder="Enter project ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fund-milestone-id">Milestone ID</Label>
                  <Input
                    id="fund-milestone-id"
                    type="number"
                    value={fundingForm.milestoneId}
                    onChange={(e) => setFundingForm(prev => ({ ...prev, milestoneId: e.target.value }))}
                    placeholder="Enter milestone ID"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fund-wallet">Client Wallet Address</Label>
                <Input
                  id="fund-wallet"
                  value={fundingForm.clientWalletAddress}
                  onChange={(e) => setFundingForm(prev => ({ ...prev, clientWalletAddress: e.target.value }))}
                  placeholder="0x..."
                  disabled={!!connectedWallet}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fund-amount">Amount</Label>
                  <Input
                    id="fund-amount"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={fundingForm.amount}
                    onChange={(e) => setFundingForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="fund-token">Token</Label>
                  <Select
                    value={fundingForm.selectedToken}
                    onValueChange={(value) => setFundingForm(prev => ({ ...prev, selectedToken: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedTokens).map(([key, token]) => (
                        <SelectItem key={key} value={token.symbol}>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            <span>{token.symbol} - {token.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleTokenFunding}
                disabled={isSubmitting || !connectedWallet}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Funding...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Fund with {fundingForm.selectedToken || 'Token'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Project Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Create Multi-Token Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Create a project where each milestone can be funded with different tokens. 
                  This provides maximum flexibility for payment arrangements.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="client-wallet">Client Wallet</Label>
                  <Input
                    id="client-wallet"
                    value={projectForm.clientWallet}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, clientWallet: e.target.value }))}
                    placeholder="0x..."
                    disabled={!!connectedWallet}
                  />
                </div>

                <div>
                  <Label htmlFor="freelancer-wallet">Freelancer Wallet</Label>
                  <Input
                    id="freelancer-wallet"
                    value={projectForm.freelancerWallet}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, freelancerWallet: e.target.value }))}
                    placeholder="0x..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Milestones</Label>
                  <Button onClick={addMilestone} variant="outline" size="sm">
                    Add Milestone
                  </Button>
                </div>

                {projectForm.milestones.map((milestone, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Milestone {index + 1}</h4>
                        {projectForm.milestones.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label htmlFor={`milestone-title-${index}`}>Title</Label>
                          <Input
                            id={`milestone-title-${index}`}
                            value={milestone.title}
                            onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                            placeholder="Milestone title"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`milestone-description-${index}`}>Description</Label>
                          <Input
                            id={`milestone-description-${index}`}
                            value={milestone.description}
                            onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                            placeholder="Brief description"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`milestone-amount-${index}`}>Amount</Label>
                          <Input
                            id={`milestone-amount-${index}`}
                            type="number"
                            step="0.000001"
                            min="0"
                            value={milestone.amount}
                            onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`milestone-token-${index}`}>Payment Token</Label>
                          <Select
                            value={milestone.token}
                            onValueChange={(value) => updateMilestone(index, 'token', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(supportedTokens).map(([key, token]) => (
                                <SelectItem key={key} value={token.symbol}>
                                  <div className="flex items-center gap-2">
                                    <Coins className="w-4 h-4" />
                                    <span>{token.symbol}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleCreateTokenProject}
                disabled={isSubmitting || !connectedWallet}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Create Multi-Token Project
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supported Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Supported Tokens</h2>
            <p className="text-muted-foreground mb-6">
              These tokens are supported for milestone funding and project creation on the Avalanche network.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(supportedTokens).map(([key, token]) => (
                <TokenCard key={key} token={token} symbol={key} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenFunding;
