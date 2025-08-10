import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientFundingModal } from '@/components/shared/ClientFundingModal';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Calendar,
  User,
  Shield,
  ArrowRight,
  Wallet,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Milestone {
  milestoneId: number;
  title: string;
  description: string;
  amount: string;
  amountWei: string;
  funded: boolean;
  released: boolean;
  fundedTxHash?: string;
  releasedTxHash?: string;
}

interface Project {
  projectId: number;
  onchainPid: string;
  clientWalletAddress: string;
  totalMilestones: number;
  fundedCount: number;
  releasedCount: number;
  milestones: Milestone[];
}

const FundingManagement = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  console.log('Current projects state:', projects);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Form state for funding and approval
  const [fundForm, setFundForm] = useState({
    projectId: '',
    milestoneId: '',
    clientWalletAddress: '',
    amount: ''
  });

  const [approveForm, setApproveForm] = useState({
    projectId: '',
    milestoneId: '',
    clientWalletAddress: ''
  });

  // Fetch real project data from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData = await response.json();
        console.log('Raw projects data:', projectsData);
        
        // Transform backend data to frontend format
        const transformedProjects = projectsData.map((project: any) => ({
          projectId: project.id,
          onchainPid: project.onchain_pid,
          clientWalletAddress: project.client.wallet_address,
          totalMilestones: project.milestones.length,
          fundedCount: project.milestones.filter((m: any) => m.funded).length,
          releasedCount: project.milestones.filter((m: any) => m.released).length,
          milestones: project.milestones.map((milestone: any) => ({
            milestoneId: milestone.id, // Use actual database ID
            title: `Milestone ${milestone.mid + 1}`,
            description: `Project milestone ${milestone.mid + 1}`,
            amount: (parseInt(milestone.amount_wei) / 1e18).toString(), // Convert wei to ETH
            amountWei: milestone.amount_wei,
            funded: milestone.funded,
            released: milestone.released,
            fundedTxHash: milestone.funded_tx_hash || undefined,
            releasedTxHash: milestone.released_tx_hash || undefined
          }))
        }));
        
        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load projects",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const fundMilestone = async () => {
    if (!fundForm.projectId || !fundForm.milestoneId || !fundForm.clientWalletAddress || !fundForm.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/funding/fund-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: fundForm.projectId,
          milestoneId: fundForm.milestoneId,
          clientWalletAddress: fundForm.clientWalletAddress,
          amount: fundForm.amount
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fund milestone');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Milestone funded successfully! Transaction: ${result.transactionHash}`,
      });

      setFundForm({ projectId: '', milestoneId: '', clientWalletAddress: '', amount: '' });
      
      // Refetch projects to get updated data
      const refreshResponse = await fetch('http://localhost:3001/projects');
      if (refreshResponse.ok) {
        const projectsData = await refreshResponse.json();
        
        // Transform backend data to frontend format
        const transformedProjects = projectsData.map((project: any) => ({
          projectId: project.id,
          onchainPid: project.onchain_pid,
          clientWalletAddress: project.client.wallet_address,
          totalMilestones: project.milestones.length,
          fundedCount: project.milestones.filter((m: any) => m.funded).length,
          releasedCount: project.milestones.filter((m: any) => m.released).length,
          milestones: project.milestones.map((milestone: any) => ({
            milestoneId: milestone.id, // Use actual database ID
            title: `Milestone ${milestone.mid + 1}`,
            description: `Project milestone ${milestone.mid + 1}`,
            amount: (parseInt(milestone.amount_wei) / 1e18).toString(), // Convert wei to ETH
            amountWei: milestone.amount_wei,
            funded: milestone.funded,
            released: milestone.released,
            fundedTxHash: milestone.funded_tx_hash || undefined,
            releasedTxHash: milestone.released_tx_hash || undefined
          }))
        }));
        
        setProjects(transformedProjects);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fund milestone",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async () => {
    if (!approveForm.projectId || !approveForm.milestoneId || !approveForm.clientWalletAddress) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/funding/approve-milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: approveForm.projectId,
          milestoneId: approveForm.milestoneId,
          clientWalletAddress: approveForm.clientWalletAddress
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve milestone');
      }

      const result = await response.json();
      
      toast({
        title: "Success",
        description: `Milestone approved and funds released! Transaction: ${result.transactionHash}`,
      });

      setApproveForm({ projectId: '', milestoneId: '', clientWalletAddress: '' });
      
      // Refetch projects to get updated data
      const refreshResponse = await fetch('http://localhost:3001/projects');
      if (refreshResponse.ok) {
        const projectsData = await refreshResponse.json();
        
        // Transform backend data to frontend format
        const transformedProjects = projectsData.map((project: any) => ({
          projectId: project.id,
          onchainPid: project.onchain_pid,
          clientWalletAddress: project.client.wallet_address,
          totalMilestones: project.milestones.length,
          fundedCount: project.milestones.filter((m: any) => m.funded).length,
          releasedCount: project.milestones.filter((m: any) => m.released).length,
          milestones: project.milestones.map((milestone: any) => ({
            milestoneId: milestone.id, // Use actual database ID
            title: `Milestone ${milestone.mid + 1}`,
            description: `Project milestone ${milestone.mid + 1}`,
            amount: (parseInt(milestone.amount_wei) / 1e18).toString(), // Convert wei to ETH
            amountWei: milestone.amount_wei,
            funded: milestone.funded,
            released: milestone.released,
            fundedTxHash: milestone.funded_tx_hash || undefined,
            releasedTxHash: milestone.released_tx_hash || undefined
          }))
        }));
        
        setProjects(transformedProjects);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve milestone",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (funded: boolean, released: boolean) => {
    if (released) {
      return <Badge variant="default" className="bg-green-500">Released</Badge>;
    } else if (funded) {
      return <Badge variant="default" className="bg-blue-500">Funded</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusIcon = (funded: boolean, released: boolean) => {
    if (released) {
      return <Shield className="text-green-500" size={20} />;
    } else if (funded) {
      return <DollarSign className="text-blue-500" size={20} />;
    } else {
      return <Clock className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="pt-20 pb-8">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Funding Management</h1>
            <p className="text-muted-foreground">
              Fund and approve milestones with secure escrow payments
            </p>
          </div>
          <Button onClick={() => setActiveTab('overview')}>
            <DollarSign className="mr-2" size={16} />
            Funding Dashboard
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="fund">Fund Milestones</TabsTrigger>
            <TabsTrigger value="approve">Approve Milestones</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <h3 className="text-2xl font-bold">{projects.length}</h3>
                    </div>
                    <FileText className="text-blue-500" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Milestones</p>
                      <h3 className="text-2xl font-bold">
                        {projects.reduce((sum, p) => sum + p.totalMilestones, 0)}
                      </h3>
                    </div>
                    <Calendar className="text-purple-500" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Funded Milestones</p>
                      <h3 className="text-2xl font-bold">
                        {projects.reduce((sum, p) => sum + p.fundedCount, 0)}
                      </h3>
                    </div>
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Released Milestones</p>
                      <h3 className="text-2xl font-bold">
                        {projects.reduce((sum, p) => sum + p.releasedCount, 0)}
                      </h3>
                    </div>
                    <Shield className="text-green-500" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Recent Funding Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.flatMap(project => 
                    project.milestones
                      .filter(m => m.funded || m.released)
                      .map(milestone => ({
                        ...milestone,
                        projectId: project.projectId,
                        onchainPid: project.onchainPid
                      }))
                  ).slice(0, 5).map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(milestone.funded, milestone.released)}
                        <div>
                          <p className="font-medium">Project #{milestone.onchainPid} - Milestone {milestone.milestoneId + 1}</p>
                          <p className="text-sm text-muted-foreground">{milestone.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{milestone.amount} AVAX</span>
                        {getStatusBadge(milestone.funded, milestone.released)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fund" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client-Side Payment with Wallet */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} />
                    Send Payments with MetaMask
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Connect your MetaMask wallet to send payments directly to freelancers.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {projects.map((project) => (
                        <Card key={project.projectId} className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium">Project #{project.onchainPid}</h4>
                              <p className="text-sm text-muted-foreground">
                                {project.fundedCount}/{project.totalMilestones} milestones funded
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {project.milestones.filter(m => !m.funded).length} payments available
                              </span>
                              <ClientFundingModal
                                project={{
                                  id: project.projectId,
                                  onchain_pid: project.onchainPid,
                                  title: `Project ${project.onchainPid}`,
                                  description: `Project with ${project.totalMilestones} milestones`,
                                  budget: `${project.milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0)} AVAX`,
                                  status: project.fundedCount === project.totalMilestones ? 'COMPLETED' : 'IN_PROGRESS',
                                  milestones: project.milestones.map(m => ({
                                    id: m.milestoneId,
                                    mid: m.milestoneId,
                                    amount_wei: m.amountWei,
                                    funded: m.funded,
                                    released: m.released
                                  })),
                                  client: {
                                    id: 0,
                                    email: '',
                                    wallet_address: project.clientWalletAddress
                                  }
                                }}
                                onFundingComplete={() => {
                                  const fetchProjects = async () => {
                                    try {
                                      setLoading(true);
                                      const response = await fetch('http://localhost:3001/projects');
                                      if (!response.ok) {
                                        throw new Error('Failed to fetch projects');
                                      }
                                      const projectsData = await response.json();
                                      
                                      const transformedProjects = projectsData.map((project: any) => ({
                                        projectId: project.id,
                                        onchainPid: project.onchain_pid,
                                        clientWalletAddress: project.client.wallet_address,
                                        totalMilestones: project.milestones.length,
                                        fundedCount: project.milestones.filter((m: any) => m.funded).length,
                                        releasedCount: project.milestones.filter((m: any) => m.released).length,
                                        milestones: project.milestones.map((milestone: any) => ({
                                          milestoneId: milestone.id,
                                          title: `Milestone ${milestone.mid + 1}`,
                                          description: `Project milestone ${milestone.mid + 1}`,
                                          amount: (parseInt(milestone.amount_wei) / 1e18).toString(),
                                          amountWei: milestone.amount_wei,
                                          funded: milestone.funded,
                                          released: milestone.released,
                                          fundedTxHash: milestone.funded_tx_hash || undefined,
                                          releasedTxHash: milestone.released_tx_hash || undefined
                                        }))
                                      }));
                                      
                                      setProjects(transformedProjects);
                                    } catch (error) {
                                      console.error('Error fetching projects:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to refresh projects",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setLoading(false);
                                    }
                                  };
                                  fetchProjects();
                                }}
                                                                  trigger={
                                    <Button variant="outline" size="sm">
                                      <DollarSign className="mr-2 h-4 w-4" />
                                      Send Payment
                                    </Button>
                                  }
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Milestones */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Available for Funding</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.flatMap(project => 
                      project.milestones
                        .filter(m => !m.funded)
                        .map(milestone => ({
                          ...milestone,
                          projectId: project.projectId,
                          onchainPid: project.onchainPid,
                          clientWalletAddress: project.clientWalletAddress
                        }))
                    ).map((milestone, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Project #{milestone.onchainPid} - Milestone {milestone.milestoneId + 1}</h4>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{milestone.amount} AVAX</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setFundForm({
                                projectId: milestone.projectId.toString(),
                                milestoneId: milestone.milestoneId.toString(),
                                clientWalletAddress: milestone.clientWalletAddress,
                                amount: milestone.amount
                              });
                              setActiveTab('fund');
                            }}
                          >
                            Fund
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="approve" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Approve Milestone Form */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle size={20} />
                    Approve Milestone
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="approve-project-id">Project ID</Label>
                    <Input
                      id="approve-project-id"
                      value={approveForm.projectId}
                      onChange={(e) => setApproveForm({...approveForm, projectId: e.target.value})}
                      placeholder="Enter project ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="approve-milestone-id">Milestone ID</Label>
                    <Input
                      id="approve-milestone-id"
                      value={approveForm.milestoneId}
                      onChange={(e) => setApproveForm({...approveForm, milestoneId: e.target.value})}
                      placeholder="Enter milestone ID"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="approve-wallet">Client Wallet Address</Label>
                    <Input
                      id="approve-wallet"
                      value={approveForm.clientWalletAddress}
                      onChange={(e) => setApproveForm({...approveForm, clientWalletAddress: e.target.value})}
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This will release funds to the freelancer. Make sure the milestone is complete.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={approveMilestone} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Approving Milestone...' : 'Approve & Release Funds'}
                  </Button>
                </CardContent>
              </Card>

              {/* Funded Milestones Ready for Approval */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle>Ready for Approval</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects.flatMap(project => 
                      project.milestones
                        .filter(m => m.funded && !m.released)
                        .map(milestone => ({
                          ...milestone,
                          projectId: project.projectId,
                          onchainPid: project.onchainPid
                        }))
                    ).map((milestone, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Project #{milestone.onchainPid} - Milestone {milestone.milestoneId + 1}</h4>
                          <Badge variant="default" className="bg-blue-500">Funded</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{milestone.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{milestone.amount} AVAX</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setApproveForm({
                                projectId: milestone.projectId.toString(),
                                milestoneId: milestone.milestoneId.toString(),
                                clientWalletAddress: ''
                              });
                              setActiveTab('approve');
                            }}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div key={project.projectId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium">Project #{project.onchainPid}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.fundedCount}/{project.totalMilestones} milestones funded • 
                            {project.releasedCount}/{project.totalMilestones} milestones released
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedProject(project)}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {project.milestones.map((milestone) => (
                          <div key={milestone.milestoneId} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(milestone.funded, milestone.released)}
                              <div>
                                <p className="font-medium">Milestone {milestone.milestoneId + 1}</p>
                                <p className="text-sm text-muted-foreground">{milestone.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{milestone.amount} AVAX</span>
                              {getStatusBadge(milestone.funded, milestone.released)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FundingManagement;
