import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Users, 
  Calendar,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Project {
  id: number;
  onchain_pid: string;
  clientId: number;
  freelancerId: number;
  milestones: Milestone[];
  client?: User;
  freelancer?: User;
  disputed?: boolean;
}

interface Milestone {
  id: number;
  mid: number;
  amount_wei: string;
  funded: boolean;
  released: boolean;
  title?: string;
  description?: string;
  funded_tx_hash?: string;
  released_tx_hash?: string;
  deliverable_cid?: string;
}

interface User {
  id: number;
  wallet_address: string;
  role: string;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalValue: number;
  disputedProjects: number;
}

const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalValue: 0,
    disputedProjects: 0
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockProjects: Project[] = [
    {
      id: 1,
      onchain_pid: "0",
      clientId: 1,
      freelancerId: 2,
      disputed: false,
      client: { id: 1, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "client" },
      freelancer: { id: 2, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "freelancer" },
      milestones: [
        { id: 1, mid: 0, amount_wei: "0.1", funded: true, released: false, title: "Design Phase", description: "Complete UI/UX design" },
        { id: 2, mid: 1, amount_wei: "0.2", funded: false, released: false, title: "Development Phase", description: "Implement features" }
      ]
    },
    {
      id: 2,
      onchain_pid: "1",
      clientId: 1,
      freelancerId: 2,
      disputed: true,
      client: { id: 1, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "client" },
      freelancer: { id: 2, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "freelancer" },
      milestones: [
        { id: 3, mid: 0, amount_wei: "0.5", funded: true, released: false, title: "Full Development", description: "Complete project development" }
      ]
    },
    {
      id: 3,
      onchain_pid: "2",
      clientId: 1,
      freelancerId: 2,
      disputed: false,
      client: { id: 1, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "client" },
      freelancer: { id: 2, wallet_address: "0x8eA5D17B6DCd1eF005E41829AA20e5Ec03113604", role: "freelancer" },
      milestones: [
        { id: 4, mid: 0, amount_wei: "0.1", funded: true, released: true, title: "Setup", description: "Project setup and planning" },
        { id: 5, mid: 1, amount_wei: "0.2", funded: false, released: false, title: "Implementation", description: "Core feature implementation" }
      ]
    }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // For now, using mock data. In production, you'd fetch from API
      setProjects(mockProjects);
      calculateStats(mockProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectList: Project[]) => {
    const stats = projectList.reduce((acc, project) => {
      acc.totalProjects++;
      
      if (project.disputed) {
        acc.disputedProjects++;
      }
      
      const isCompleted = project.milestones.every(m => m.released);
      const hasActiveMilestones = project.milestones.some(m => m.funded && !m.released);
      
      if (isCompleted) {
        acc.completedProjects++;
      } else if (hasActiveMilestones) {
        acc.activeProjects++;
      }
      
      const projectValue = project.milestones.reduce((sum, m) => sum + parseFloat(m.amount_wei), 0);
      acc.totalValue += projectValue;
      
      return acc;
    }, { totalProjects: 0, activeProjects: 0, completedProjects: 0, totalValue: 0, disputedProjects: 0 });
    
    setStats(stats);
  };

  const getProjectStatus = (project: Project) => {
    if (project.disputed) return { status: 'Disputed', color: 'destructive' };
    
    const totalMilestones = project.milestones.length;
    const fundedMilestones = project.milestones.filter(m => m.funded).length;
    const releasedMilestones = project.milestones.filter(m => m.released).length;
    
    if (releasedMilestones === totalMilestones) return { status: 'Completed', color: 'default' };
    if (fundedMilestones > 0) return { status: 'Active', color: 'secondary' };
    return { status: 'Pending', color: 'outline' };
  };

  const getMilestoneProgress = (project: Project) => {
    const totalMilestones = project.milestones.length;
    const releasedMilestones = project.milestones.filter(m => m.released).length;
    return totalMilestones > 0 ? (releasedMilestones / totalMilestones) * 100 : 0;
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { status, color } = getProjectStatus(project);
    const progress = getMilestoneProgress(project);
    const totalValue = project.milestones.reduce((sum, m) => sum + parseFloat(m.amount_wei), 0);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">Project #{project.id}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Onchain ID: {project.onchain_pid}
              </p>
            </div>
            <Badge variant={color as any}>
              {project.disputed && <AlertTriangle className="w-3 h-3 mr-1" />}
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span>{totalValue.toFixed(3)} AVAX</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{project.milestones.length} milestones</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{project.client?.wallet_address.slice(0, 6)}...{project.client?.wallet_address.slice(-4)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProject(project)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProjectDetails: React.FC<{ project: Project }> = ({ project }) => {
    const { status } = getProjectStatus(project);
    
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Project #{project.id} Details</CardTitle>
              <p className="text-muted-foreground">Onchain ID: {project.onchain_pid}</p>
            </div>
            <Button variant="outline" onClick={() => setSelectedProject(null)}>
              Back to List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {project.disputed && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This project is currently under dispute. Contact admin for resolution.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Client Information</h4>
              <div className="text-sm">
                <p><strong>Address:</strong> {project.client?.wallet_address}</p>
                <p><strong>Role:</strong> {project.client?.role}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Freelancer Information</h4>
              <div className="text-sm">
                <p><strong>Address:</strong> {project.freelancer?.wallet_address}</p>
                <p><strong>Role:</strong> {project.freelancer?.role}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3">Milestones</h4>
            <div className="space-y-3">
              {project.milestones.map((milestone, index) => (
                <Card key={milestone.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-medium">
                          {milestone.title || `Milestone ${index + 1}`}
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{milestone.amount_wei} AVAX</p>
                        <div className="flex gap-2 mt-1">
                          {milestone.funded ? (
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Funded
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          
                          {milestone.released ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Released
                            </Badge>
                          ) : milestone.funded ? (
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Awaiting Approval
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Started
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(milestone.funded_tx_hash || milestone.released_tx_hash) && (
                      <div className="mt-3 text-xs text-muted-foreground space-y-1">
                        {milestone.funded_tx_hash && (
                          <p><strong>Funded TX:</strong> {milestone.funded_tx_hash.slice(0, 10)}...{milestone.funded_tx_hash.slice(-8)}</p>
                        )}
                        {milestone.released_tx_hash && (
                          <p><strong>Released TX:</strong> {milestone.released_tx_hash.slice(0, 10)}...{milestone.released_tx_hash.slice(-8)}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        <ProjectDetails project={selectedProject} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Project Management</h1>
        <p className="text-muted-foreground">
          Manage and track all your escrow-based projects
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeProjects}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedProjects}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disputed</p>
                <p className="text-2xl font-bold text-red-600">{stats.disputedProjects}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{stats.totalValue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">AVAX</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="disputed">Disputed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(p => !p.disputed && p.milestones.some(m => m.funded && !m.released))
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(p => p.milestones.every(m => m.released))
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="disputed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(p => p.disputed)
              .map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectManagement;
