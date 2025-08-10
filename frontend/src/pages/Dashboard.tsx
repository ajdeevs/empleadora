import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIJobMatcher } from '@/components/shared/AIJobMatcher';
import { EscrowPaymentCard } from '@/components/shared/EscrowPaymentCard';
import { ProjectMessaging } from '@/components/shared/ProjectMessaging';
import { PortfolioCard } from '@/components/shared/PortfolioCard';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Star, 
  MessageSquare, 
  Shield, 
  Calendar,
  Award,
  Target,
  Zap,
  Bell,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  userType: 'client' | 'freelancer';
}

const Dashboard = ({ userType = 'freelancer' }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data
  const stats = {
    freelancer: {
      activeProjects: 3,
      totalEarnings: 245000,
      completedProjects: 24,
      rating: 4.9,
      responseTime: '2 hours',
      availableJobs: 156
    },
    client: {
      activeProjects: 5,
      totalSpent: 180000,
      hiredFreelancers: 12,
      avgProjectTime: '3 weeks',
      savedProfiles: 8,
      newProposals: 23
    }
  };

  const currentUserStats = stats[userType];

  const recentActivity = [
    {
      id: '1',
      type: 'payment',
      title: 'Payment received from TechStart Solutions',
      amount: 45000,
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'message',
      title: 'New message from Rajesh Kumar',
      content: 'Great work on the wireframes!',
      timestamp: '4 hours ago',
      status: 'unread'
    },
    {
      id: '3',
      type: 'proposal',
      title: 'Proposal accepted for E-commerce Project',
      timestamp: '1 day ago',
      status: 'accepted'
    },
    {
      id: '4',
      type: 'review',
      title: 'New 5-star review received',
      content: '"Excellent work and communication!"',
      timestamp: '2 days ago',
      status: 'positive'
    }
  ];

  const activeProjects = [
    {
      id: '1',
      title: 'E-commerce Mobile App UI/UX',
      client: 'TechStart Solutions',
      progress: 75,
      deadline: '2025-01-25',
      budget: 85000,
      status: 'in_progress',
      lastActivity: '2 hours ago'
    },
    {
      id: '2',
      title: 'Brand Identity for Food Startup',
      client: 'Spice Route Restaurants',
      progress: 45,
      deadline: '2025-01-30',
      budget: 45000,
      status: 'in_progress',
      lastActivity: '1 day ago'
    },
    {
      id: '3',
      title: 'Landing Page Redesign',
      client: 'LearnIndia EdTech',
      progress: 90,
      deadline: '2025-01-20',
      budget: 25000,
      status: 'review',
      lastActivity: '3 hours ago'
    }
  ];

  const portfolioItems = [
    {
      id: '1',
      title: 'FoodieApp - Food Delivery Mobile App',
      description: 'Complete UI/UX design for a local food delivery platform',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136',
      category: 'Mobile App',
      tags: ['UI/UX', 'Mobile', 'Food Tech'],
      likes: 245,
      views: 1200,
      client: 'FoodieApp',
      completedDate: 'Dec 2024'
    },
    {
      id: '2',
      title: 'EcoTech Brand Identity',
      description: 'Complete branding package for sustainable technology startup',
      image: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea',
      category: 'Branding',
      tags: ['Logo', 'Branding', 'Sustainability'],
      likes: 189,
      views: 856,
      client: 'EcoTech Solutions',
      completedDate: 'Nov 2024'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="text-green-500" size={16} />;
      case 'message': return <MessageSquare className="text-blue-500" size={16} />;
      case 'proposal': return <Target className="text-purple-500" size={16} />;
      case 'review': return <Star className="text-yellow-500" size={16} />;
      default: return <Bell className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="pt-20 pb-8">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {userType === 'freelancer' ? 'Priya' : 'Rajesh'}! 👋
            </h1>
            <p className="text-muted-foreground">
              {userType === 'freelancer' 
                ? 'Here\'s your freelancing dashboard with AI-powered insights'
                : 'Manage your projects and discover top talent'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Calendar className="mr-2" size={16} />
              Schedule Call
            </Button>
            <Button>
              {userType === 'freelancer' ? '+ Apply to Jobs' : '+ Post Project'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {userType === 'freelancer' ? (
            <>
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.activeProjects}</h3>
                    </div>
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">↗ 2 new this week</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earnings</p>
                      <h3 className="text-2xl font-bold">₹{currentUserStats.totalEarnings.toLocaleString()}</h3>
                    </div>
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">↗ +₹45k this month</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.rating}/5</h3>
                    </div>
                    <Star className="text-yellow-500" size={24} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">24 completed projects</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available Jobs</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.availableJobs}</h3>
                    </div>
                    <Target className="text-purple-500" size={24} />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">23 match your skills</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.activeProjects}</h3>
                    </div>
                    <Users className="text-blue-500" size={24} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">2 completed this month</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <h3 className="text-2xl font-bold">₹{currentUserStats.totalSpent.toLocaleString()}</h3>
                    </div>
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Across 12 freelancers</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New Proposals</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.newProposals}</h3>
                    </div>
                    <Bell className="text-orange-500" size={24} />
                  </div>
                  <p className="text-xs text-blue-600 mt-2">5 need review</p>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Saved Profiles</p>
                      <h3 className="text-2xl font-bold">{currentUserStats.savedProfiles}</h3>
                    </div>
                    <Award className="text-purple-500" size={24} />
                  </div>
                  <p className="text-xs text-green-600 mt-2">3 available now</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-matches">AI Matches</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock size={20} />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          {activity.content && (
                            <p className="text-xs text-muted-foreground">{activity.content}</p>
                          )}
                          {activity.amount && (
                            <p className="text-sm font-bold text-green-600">
                              +₹{activity.amount.toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                        </div>
                        <Badge variant={activity.status === 'unread' ? 'default' : 'secondary'} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Projects Overview */}
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Active Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeProjects.map((project) => (
                      <div key={project.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{project.title}</h4>
                          <Badge variant={project.status === 'review' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{project.client}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress: {project.progress}%</span>
                          <span>₹{project.budget.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-matches" className="space-y-6">
            <AIJobMatcher 
              userType={userType}
              userSkills={['UI/UX Design', 'React', 'Figma']}
              userLocation="Bangalore"
            />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            {userType === 'freelancer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle>My Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {portfolioItems.map((item) => (
                        <PortfolioCard key={item.id} {...item} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="card-elevated">
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeProjects.map((project) => (
                        <div key={project.id} className="border-l-2 border-primary pl-4">
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">Due: {project.deadline}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs">Last activity: {project.lastActivity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <EscrowPaymentCard
              projectId="1"
              projectTitle="E-commerce Mobile App UI/UX"
              amount={85000}
              status="in_progress"
              freelancerName="Priya Sharma"
              clientName="TechStart Solutions"
              userRole={userType}
              milestones={[
                { id: '1', title: 'Wireframes', amount: 25000, status: 'completed', dueDate: '2025-01-15' },
                { id: '2', title: 'UI Design', amount: 35000, status: 'completed', dueDate: '2025-01-20' },
                { id: '3', title: 'Final Delivery', amount: 25000, status: 'pending', dueDate: '2025-01-25' }
              ]}
            />
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <ProjectMessaging
              projectId="1"
              projectTitle="E-commerce Mobile App UI/UX"
              participants={[
                {
                  id: 'client1',
                  name: 'Rajesh Kumar',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
                  role: 'client',
                  isOnline: true
                },
                {
                  id: 'freelancer1',
                  name: 'Priya Sharma',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
                  role: 'freelancer',
                  isOnline: false
                }
              ]}
              currentUserId={userType === 'freelancer' ? 'freelancer1' : 'client1'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
