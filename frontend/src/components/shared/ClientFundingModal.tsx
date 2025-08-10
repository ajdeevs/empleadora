import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useWallet } from './WalletAdapter';
import { toast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

interface Milestone {
  id: number;
  mid: number;
  amount_wei: string;
  funded: boolean;
  released: boolean;
  deliverable_cid?: string;
}

interface Project {
  id: number;
  onchain_pid: string;
  title: string;
  description: string;
  budget: string;
  status: string;
  milestones: Milestone[];
  client: {
    id: number;
    email: string;
    wallet_address: string;
  };
}

interface ClientFundingModalProps {
  project: Project;
  onFundingComplete?: () => void;
  trigger?: React.ReactNode;
}

export const ClientFundingModal: React.FC<ClientFundingModalProps> = ({
  project,
  onFundingComplete,
  trigger
}) => {
  const { isConnected, address, sendTransaction, getBalance } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isFunding, setIsFunding] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [contractAddress, setContractAddress] = useState<string>('');

  // Contract ABI for the fundMilestone function
  const contractABI = [
    "function fundMilestone(uint256 pid, uint256 mid) external payable",
    "event MilestoneFunded(uint256 indexed projectId, uint256 indexed mid, uint256 amount)"
  ];

  useEffect(() => {
    if (isOpen && isConnected) {
      loadBalance();
      loadContractAddress();
    }
  }, [isOpen, isConnected]);

  const loadBalance = async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadContractAddress = async () => {
    try {
      // Fetch contract address from backend
      const response = await fetch('http://localhost:3001/admin/contract-info');
      if (response.ok) {
        const data = await response.json();
        setContractAddress(data.contractAddress);
      }
    } catch (error) {
      console.error('Error loading contract address:', error);
    }
  };

  const handleFundMilestone = async (milestone: Milestone) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    // Remove client verification - allow anyone to fund
    // const freelancerAddress = "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604";

    setSelectedMilestone(milestone);
    setIsFunding(true);

    try {
      // Convert amount from wei to ether for display
      const amountEther = ethers.formatEther(milestone.amount_wei);
      const amountWei = ethers.parseEther(amountEther);

      // Check balance
      const currentBalance = await getBalance();
      if (BigInt(currentBalance) < BigInt(milestone.amount_wei)) {
        throw new Error(`Insufficient balance. Required: ${amountEther} AVAX, Available: ${ethers.formatEther(currentBalance)} AVAX`);
      }

      // Send funds directly to the specified address instead of using contract
      const freelancerAddress = "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604";
      
      console.log('Sending funds directly to:', {
        to: freelancerAddress,
        amount: amountEther,
        amountWei: amountWei.toString(),
        from: address
      });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Send direct transaction to freelancer address
      const tx = await signer.sendTransaction({
        to: freelancerAddress,
        value: amountWei,
        gasLimit: 200000
      });

      toast({
        title: "Transaction Sent",
        description: `Funding transaction submitted. Hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      toast({
        title: "Payment Sent!",
        description: `Successfully sent ${amountEther} AVAX to freelancer. Transaction confirmed!`,
      });

      // Update backend
      await updateBackendMilestone(milestone.id);

      // Close modal and refresh
      setIsOpen(false);
      onFundingComplete?.();

    } catch (error: any) {
      console.error('Funding error:', error);
      toast({
        title: "Funding Failed",
        description: error.message || "Failed to fund milestone",
        variant: "destructive",
      });
    } finally {
      setIsFunding(false);
      setSelectedMilestone(null);
    }
  };

  const updateBackendMilestone = async (milestoneId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/milestones/${milestoneId}/mark-funded`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funded: true,
          transactionHash: 'client-side-transaction'
        }),
      });

      if (!response.ok) {
        console.warn('Failed to update backend milestone status');
      }
    } catch (error) {
      console.error('Error updating backend:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (wei: string) => {
    return ethers.formatEther(wei);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2">
            <DollarSign size={16} />
            Send Payment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
          <DollarSign size={20} />
          Send Payment to Freelancer
        </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{project.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Budget: {project.budget}</Badge>
                <Badge variant={project.status === 'OPEN' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Wallet size={16} />
                Wallet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connected Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{formatAddress(address!)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(address!)}
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Balance:</span>
                    <span className="text-sm">{formatBalance(balance)} AVAX</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Ready to send payment to freelancer
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-800">
                    Please connect your MetaMask wallet to fund milestones
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Milestone {milestone.mid + 1}</h4>
                        <p className="text-sm text-muted-foreground">
                          Amount: {formatBalance(milestone.amount_wei)} AVAX
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {milestone.funded ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle size={12} />
                            Funded
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Funded</Badge>
                        )}
                      </div>
                    </div>

                    {!milestone.funded && (
                      <Button
                        onClick={() => handleFundMilestone(milestone)}
                                                 disabled={
                           !isConnected ||
                           isFunding ||
                           BigInt(balance) < BigInt(milestone.amount_wei)
                         }
                        className="w-full"
                      >
                                                 {isFunding && selectedMilestone?.id === milestone.id ? (
                           <>
                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                             Sending Payment...
                           </>
                         ) : (
                           <>
                             <DollarSign size={16} className="mr-2" />
                             Send Payment
                           </>
                         )}
                      </Button>
                    )}

                                         {milestone.funded && (
                       <Badge variant="outline" className="w-full justify-center">
                         Payment Sent
                       </Badge>
                     )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payments Sent</span>
                  <span>
                    {project.milestones.filter(m => m.funded).length} / {project.milestones.length}
                  </span>
                </div>
                <Progress
                  value={
                    (project.milestones.filter(m => m.funded).length / project.milestones.length) * 100
                  }
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
