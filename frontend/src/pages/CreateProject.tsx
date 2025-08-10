import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: string;
}

const CreateProject: React.FC = () => {
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    freelancerWallet: '',
    clientWallet: '',
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: '', description: '', amount: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const { toast } = useToast();

  const addMilestone = () => {
    const newId = (milestones.length + 1).toString();
    setMilestones([...milestones, { id: newId, title: '', description: '', amount: '' }]);
  };

  const removeMilestone = (id: string) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };

  const updateMilestone = (id: string, field: keyof Milestone, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const calculateTotalAmount = () => {
    return milestones.reduce((total, milestone) => {
      const amount = parseFloat(milestone.amount) || 0;
      return total + amount;
    }, 0).toFixed(2);
  };

  const validateForm = () => {
    if (!projectData.title.trim()) return 'Project title is required';
    if (!projectData.description.trim()) return 'Project description is required';
    if (!projectData.freelancerWallet.trim()) return 'Freelancer wallet address is required';
    if (!projectData.clientWallet.trim()) return 'Client wallet address is required';
    
    for (let i = 0; i < milestones.length; i++) {
      const milestone = milestones[i];
      if (!milestone.title.trim()) return `Milestone ${i + 1} title is required`;
      if (!milestone.description.trim()) return `Milestone ${i + 1} description is required`;
      if (!milestone.amount || parseFloat(milestone.amount) <= 0) return `Milestone ${i + 1} amount must be greater than 0`;
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (validation) {
      toast({
        title: "Validation Error",
        description: validation,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the project on the blockchain and get onchain_pid
      // For demo purposes, we'll simulate this
      const onchain_pid = Math.floor(Math.random() * 1000) + 1;

      // Prepare data for backend
      const amounts_wei = milestones.map(m => parseFloat(m.amount).toString());
      
      const projectPayload = {
        onchain_pid,
        client_wallet: projectData.clientWallet,
        freelancer_wallet: projectData.freelancerWallet,
        amounts_wei
      };

      const response = await fetch('http://localhost:5000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectPayload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const result = await response.json();
      setCreatedProject(result);

      toast({
        title: "Success!",
        description: "Project created successfully",
      });

      // Reset form
      setProjectData({
        title: '',
        description: '',
        freelancerWallet: '',
        clientWallet: '',
      });
      setMilestones([{ id: '1', title: '', description: '', amount: '' }]);

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const connectWallet = async (field: 'clientWallet' | 'freelancerWallet') => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setProjectData(prev => ({ ...prev, [field]: accounts[0] }));
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

  if (createdProject) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <h3 className="font-semibold">Project Created Successfully! 🎉</h3>
              <p><strong>Project ID:</strong> {createdProject.id}</p>
              <p><strong>Onchain ID:</strong> {createdProject.onchain_pid}</p>
              <p><strong>Total Milestones:</strong> {createdProject.milestones?.length || 0}</p>
              <Button 
                onClick={() => setCreatedProject(null)} 
                className="mt-4"
              >
                Create Another Project
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new escrow-based project with milestones and secure payments
        </p>
      </div>

      <div className="space-y-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={projectData.title}
                onChange={(e) => setProjectData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={projectData.description}
                onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project requirements and deliverables"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Wallet Addresses */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientWallet">Client Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="clientWallet"
                  value={projectData.clientWallet}
                  onChange={(e) => setProjectData(prev => ({ ...prev, clientWallet: e.target.value }))}
                  placeholder="0x..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => connectWallet('clientWallet')}
                  className="shrink-0"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="freelancerWallet">Freelancer Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  id="freelancerWallet"
                  value={projectData.freelancerWallet}
                  onChange={(e) => setProjectData(prev => ({ ...prev, freelancerWallet: e.target.value }))}
                  placeholder="0x..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => connectWallet('freelancerWallet')}
                  className="shrink-0"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Project Milestones</span>
              <Badge variant="secondary">
                Total: {calculateTotalAmount()} AVAX
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Milestone {index + 1}</h4>
                  {milestones.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor={`milestone-title-${milestone.id}`}>Title</Label>
                    <Input
                      id={`milestone-title-${milestone.id}`}
                      value={milestone.title}
                      onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                      placeholder="Milestone title"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor={`milestone-desc-${milestone.id}`}>Description</Label>
                    <Input
                      id={`milestone-desc-${milestone.id}`}
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      placeholder="Describe what needs to be delivered"
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-48">
                  <Label htmlFor={`milestone-amount-${milestone.id}`}>Amount (AVAX)</Label>
                  <Input
                    id={`milestone-amount-${milestone.id}`}
                    type="number"
                    step="0.001"
                    min="0"
                    value={milestone.amount}
                    onChange={(e) => updateMilestone(milestone.id, 'amount', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="min-w-32"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
