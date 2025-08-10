import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Wallet,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FundingFormData {
  projectId: string;
  milestoneId: string;
  clientWalletAddress: string;
  amount: string;
}

interface ApprovalFormData {
  projectId: string;
  milestoneId: string;
  clientWalletAddress: string;
}

interface MilestoneStatus {
  milestoneId: number;
  amount: string;
  amountWei: string;
  funded: boolean;
  released: boolean;
  projectId: number;
  onchainPid: string;
  fundedTxHash?: string;
  releasedTxHash?: string;
  title?: string;
  description?: string;
}

const FundingDashboard: React.FC = () => {
  const [fundingForm, setFundingForm] = useState<FundingFormData>({
    projectId: '',
    milestoneId: '',
    clientWalletAddress: '',
    amount: ''
  });

  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    projectId: '',
    milestoneId: '',
    clientWalletAddress: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestoneStatus, setMilestoneStatus] = useState<MilestoneStatus | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          setFundingForm(prev => ({ ...prev, clientWalletAddress: accounts[0] }));
          setApprovalForm(prev => ({ ...prev, clientWalletAddress: accounts[0] }));
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
        setApprovalForm(prev => ({ ...prev, clientWalletAddress: accounts[0] }));
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

  const checkMilestoneStatus = async (projectId: string, milestoneId: string) => {
    if (!projectId || !milestoneId) return;

    try {
      const response = await fetch(`http://localhost:5000/funding/milestone-status/${projectId}/${milestoneId}`);
      
      if (response.ok) {
        const status = await response.json();
        setMilestoneStatus(status);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to fetch milestone status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking milestone status:', error);
      toast({
        title: "Error",
        description: "Failed to check milestone status",
        variant: "destructive"
      });
    }
  };

  const handleFundMilestone = async () => {
    if (!fundingForm.projectId || !fundingForm.milestoneId || !fundingForm.clientWalletAddress || !fundingForm.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/funding/fund-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: parseInt(fundingForm.projectId),
          milestoneId: parseInt(fundingForm.milestoneId),
          clientWalletAddress: fundingForm.clientWalletAddress,
          amount: fundingForm.amount
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Milestone funded successfully! TX: ${result.transactionHash}`,
        });

        // Refresh milestone status
        checkMilestoneStatus(fundingForm.projectId, fundingForm.milestoneId);
        
        // Reset form
        setFundingForm(prev => ({
          ...prev,
          projectId: '',
          milestoneId: '',
          amount: ''
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

  const handleApproveMilestone = async () => {
    if (!approvalForm.projectId || !approvalForm.milestoneId || !approvalForm.clientWalletAddress) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/funding/approve-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId: parseInt(approvalForm.projectId),
          milestoneId: parseInt(approvalForm.milestoneId),
          clientWalletAddress: approvalForm.clientWalletAddress
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: `Milestone approved and funds released! TX: ${result.transactionHash}`,
        });

        // Refresh milestone status
        checkMilestoneStatus(approvalForm.projectId, approvalForm.milestoneId);
        
        // Reset form
        setApprovalForm(prev => ({
          ...prev,
          projectId: '',
          milestoneId: ''
        }));
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to approve milestone",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving milestone:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const MilestoneStatusCard: React.FC = () => {
    if (!milestoneStatus) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Milestone Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Project ID</Label>
              <p className="text-lg">{milestoneStatus.projectId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Milestone ID</Label>
              <p className="text-lg">{milestoneStatus.milestoneId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Amount</Label>
              <p className="text-lg font-bold">{milestoneStatus.amount} AVAX</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Onchain Project ID</Label>
              <p className="text-lg">{milestoneStatus.onchainPid}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Badge variant={milestoneStatus.funded ? "default" : "secondary"}>
              {milestoneStatus.funded ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Funded
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Not Funded
                </>
              )}
            </Badge>
            
            <Badge variant={milestoneStatus.released ? "default" : "secondary"}>
              {milestoneStatus.released ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Released
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Not Released
                </>
              )}
            </Badge>
          </div>

          {milestoneStatus.title && (
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <p>{milestoneStatus.title}</p>
            </div>
          )}

          {milestoneStatus.description && (
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p>{milestoneStatus.description}</p>
            </div>
          )}

          {(milestoneStatus.fundedTxHash || milestoneStatus.releasedTxHash) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transaction History</Label>
              {milestoneStatus.fundedTxHash && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Funded</Badge>
                  <span className="font-mono text-xs">
                    {milestoneStatus.fundedTxHash.slice(0, 10)}...{milestoneStatus.fundedTxHash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://snowtrace.io/tx/${milestoneStatus.fundedTxHash}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {milestoneStatus.releasedTxHash && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="default">Released</Badge>
                  <span className="font-mono text-xs">
                    {milestoneStatus.releasedTxHash.slice(0, 10)}...{milestoneStatus.releasedTxHash.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://snowtrace.io/tx/${milestoneStatus.releasedTxHash}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Funding Dashboard</h1>
        <p className="text-muted-foreground">
          Fund milestones and approve payments for your projects
        </p>
      </div>

      {/* Wallet Connection */}
      {!connectedWallet ? (
        <Alert className="mb-6">
          <Wallet className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connect your wallet to interact with the escrow system</span>
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

      <Tabs defaultValue="fund" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fund">Fund Milestone</TabsTrigger>
          <TabsTrigger value="approve">Approve Milestone</TabsTrigger>
          <TabsTrigger value="status">Check Status</TabsTrigger>
        </TabsList>

        {/* Fund Milestone Tab */}
        <TabsContent value="fund" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Fund Milestone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label htmlFor="fund-amount">Amount (AVAX)</Label>
                <Input
                  id="fund-amount"
                  type="number"
                  step="0.001"
                  min="0"
                  value={fundingForm.amount}
                  onChange={(e) => setFundingForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <Button
                onClick={handleFundMilestone}
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
                    Fund Milestone
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approve Milestone Tab */}
        <TabsContent value="approve" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approve Milestone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Only approve milestones after verifying that the deliverables meet your requirements. 
                  This action will release funds to the freelancer and cannot be undone.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approve-project-id">Project ID</Label>
                  <Input
                    id="approve-project-id"
                    type="number"
                    value={approvalForm.projectId}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, projectId: e.target.value }))}
                    placeholder="Enter project ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="approve-milestone-id">Milestone ID</Label>
                  <Input
                    id="approve-milestone-id"
                    type="number"
                    value={approvalForm.milestoneId}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, milestoneId: e.target.value }))}
                    placeholder="Enter milestone ID"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="approve-wallet">Client Wallet Address</Label>
                <Input
                  id="approve-wallet"
                  value={approvalForm.clientWalletAddress}
                  onChange={(e) => setApprovalForm(prev => ({ ...prev, clientWalletAddress: e.target.value }))}
                  placeholder="0x..."
                  disabled={!!connectedWallet}
                />
              </div>

              <Button
                onClick={handleApproveMilestone}
                disabled={isSubmitting || !connectedWallet}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve & Release Funds
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Check Milestone Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status-project-id">Project ID</Label>
                  <Input
                    id="status-project-id"
                    type="number"
                    placeholder="Enter project ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status-milestone-id">Milestone ID</Label>
                  <Input
                    id="status-milestone-id"
                    type="number"
                    placeholder="Enter milestone ID"
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  const projectId = (document.getElementById('status-project-id') as HTMLInputElement)?.value;
                  const milestoneId = (document.getElementById('status-milestone-id') as HTMLInputElement)?.value;
                  checkMilestoneStatus(projectId, milestoneId);
                }}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Status
              </Button>
            </CardContent>
          </Card>

          <MilestoneStatusCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FundingDashboard;
