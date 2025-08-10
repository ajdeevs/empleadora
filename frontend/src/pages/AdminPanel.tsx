import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Shield, 
  DollarSign,
  Activity,
  Server,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemStatus {
  contract_address: string;
  network_name: string;
  network_chain_id: string;
  contract_deployed: boolean;
  admin_wallet: string;
  admin_balance_eth: string;
  contract_code_size: number;
}

interface DisputeFormData {
  pid: string;
}

interface RefundFormData {
  pid: string;
  mid: string;
}

const AdminPanel: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [disputeForm, setDisputeForm] = useState<DisputeFormData>({ pid: '' });
  const [refundForm, setRefundForm] = useState<RefundFormData>({ pid: '', mid: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/admin/status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch system status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching system status:', error);
      toast({
        title: "Connection Error",
        description: "Could not connect to the backend",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeForm.pid) {
      toast({
        title: "Validation Error",
        description: "Please enter a project ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/admin/dispute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pid: parseInt(disputeForm.pid) })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! ⚖️",
          description: `Dispute raised for project ${disputeForm.pid}. TX: ${result.tx}`,
        });
        setLastTransaction(result.tx);
        setDisputeForm({ pid: '' });
      } else {
        toast({
          title: "Dispute Failed",
          description: result.error || "Failed to raise dispute",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundMilestone = async () => {
    if (!refundForm.pid || !refundForm.mid) {
      toast({
        title: "Validation Error",
        description: "Please enter both project ID and milestone ID",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/admin/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          pid: parseInt(refundForm.pid),
          mid: parseInt(refundForm.mid)
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success! 💰",
          description: `Milestone ${refundForm.mid} refunded. TX: ${result.tx}`,
        });
        setLastTransaction(result.tx);
        setRefundForm({ pid: '', mid: '' });
      } else {
        toast({
          title: "Refund Failed",
          description: result.error || "Failed to process refund",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SystemStatusCard: React.FC = () => {
    if (!systemStatus) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {systemStatus.contract_deployed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">Deployed</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Not Deployed</span>
                      </>
                    )}
                  </div>
                </div>
                <Server className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network</p>
                  <p className="text-lg font-bold">{systemStatus.network_name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">Chain ID: {systemStatus.network_chain_id}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin Balance</p>
                  <p className="text-lg font-bold">{parseFloat(systemStatus.admin_balance_eth).toFixed(4)} AVAX</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="font-medium">Contract Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs bg-muted p-1 rounded">
                    {systemStatus.contract_address}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://snowtrace.io/address/${systemStatus.contract_address}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-medium">Admin Wallet</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs bg-muted p-1 rounded">
                    {systemStatus.admin_wallet.slice(0, 10)}...{systemStatus.admin_wallet.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://snowtrace.io/address/${systemStatus.admin_wallet}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="font-medium">Contract Code Size</Label>
                <p className="mt-1">{systemStatus.contract_code_size} bytes</p>
              </div>

              <div>
                <Label className="font-medium">Deployment Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={systemStatus.contract_deployed ? "default" : "destructive"}>
                    {systemStatus.contract_deployed ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          System administration, dispute resolution, and emergency controls
        </p>
      </div>

      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Admin Access Required:</strong> These operations require administrative privileges 
          and should only be performed by authorized personnel.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Management</TabsTrigger>
          <TabsTrigger value="refunds">Refund Processing</TabsTrigger>
        </TabsList>

        {/* System Status Tab */}
        <TabsContent value="status" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">System Status Overview</h2>
            <Button onClick={checkSystemStatus} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Loading system status...</p>
              </CardContent>
            </Card>
          ) : (
            <SystemStatusCard />
          )}

          {lastTransaction && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <span>Last transaction successful: {lastTransaction.slice(0, 10)}...{lastTransaction.slice(-8)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://snowtrace.io/tx/${lastTransaction}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Dispute Management Tab */}
        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Raise Dispute
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Raising a dispute will freeze all project activities. 
                  This action should only be taken when there are legitimate concerns about project delivery or payment.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="dispute-pid">Project ID</Label>
                <Input
                  id="dispute-pid"
                  type="number"
                  value={disputeForm.pid}
                  onChange={(e) => setDisputeForm({ pid: e.target.value })}
                  placeholder="Enter project ID to dispute"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Dispute Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Dispute will be recorded on the blockchain</li>
                  <li>All project milestones will be frozen</li>
                  <li>No new funding or approvals can occur</li>
                  <li>Admin can process refunds for disputed milestones</li>
                  <li>Resolution requires manual intervention</li>
                </ol>
              </div>

              <Button
                onClick={handleRaiseDispute}
                disabled={isSubmitting || !disputeForm.pid}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Raising Dispute...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Raise Dispute
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Processing Tab */}
        <TabsContent value="refunds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Process Refund
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Prerequisites:</strong> The project must be in disputed status before refunds can be processed. 
                  Refunds will return the milestone funds to the client's wallet.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="refund-pid">Project ID</Label>
                  <Input
                    id="refund-pid"
                    type="number"
                    value={refundForm.pid}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, pid: e.target.value }))}
                    placeholder="Enter project ID"
                  />
                </div>

                <div>
                  <Label htmlFor="refund-mid">Milestone ID</Label>
                  <Input
                    id="refund-mid"
                    type="number"
                    value={refundForm.mid}
                    onChange={(e) => setRefundForm(prev => ({ ...prev, mid: e.target.value }))}
                    placeholder="Enter milestone ID"
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Refund Conditions:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Project must be in disputed status</li>
                  <li>Milestone must be funded but not released</li>
                  <li>Funds will be returned to the client wallet</li>
                  <li>Transaction is irreversible once confirmed</li>
                  <li>Milestone will be marked as released (refunded)</li>
                </ul>
              </div>

              <Button
                onClick={handleRefundMilestone}
                disabled={isSubmitting || !refundForm.pid || !refundForm.mid}
                className="w-full"
                size="lg"
                variant="destructive"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing Refund...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Process Refund
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
