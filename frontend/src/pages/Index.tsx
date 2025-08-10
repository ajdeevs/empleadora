
import React from 'react';
import { Hero } from '@/components/home/Hero';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProfileCard } from '@/components/shared/ProfileCard';
import { ProjectCard } from '@/components/shared/ProjectCard';
import { ContestCard } from '@/components/shared/ContestCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserMode } from '@/context/UserModeContext';

// Sample data for demonstration
const topFreelancers = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    title: 'UI/UX Designer & Mobile App Specialist',
    rating: 4.9,
    reviewCount: 156,
    location: 'Bangalore, Karnataka',
    hourlyRate: 1200,
    tags: ['UI/UX Design', 'Mobile Apps', 'Figma'],
    featured: true
  },
  {
    id: '2',
    name: 'Arjun Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    title: 'Full Stack Developer',
    rating: 4.8,
    reviewCount: 142,
    location: 'Pune, Maharashtra',
    hourlyRate: 1500,
    tags: ['React', 'Node.js', 'Python'],
    featured: false
  },
  {
    id: '3',
    name: 'Kavya Reddy',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    title: 'Content Writer & Digital Marketing Expert',
    rating: 4.7,
    reviewCount: 98,
    location: 'Hyderabad, Telangana',
    hourlyRate: 800,
    tags: ['Content Writing', 'SEO', 'Social Media'],
    featured: false
  }
];

const topProjects = [
  {
    id: '1',
    title: 'E-commerce Website for Indian Fashion Brand',
    description: 'Looking for an experienced UI/UX designer to create a mobile-first e-commerce platform for our ethnic wear brand targeting tier-2 cities.',
    budget: { min: 25000, max: 60000 },
    duration: '3-6 weeks',
    location: 'Remote',
    tags: ['UI/UX Design', 'E-commerce', 'Mobile-first'],
    proposals: 12,
    postedTime: '2 days ago',
    clientInfo: {
      name: 'Ethnic Styles Pvt Ltd',
      avatar: 'https://images.unsplash.com/photo-1549924231-f129b911e442',
      verified: true
    },
    featured: true
  },
  {
    id: '2',
    title: 'Food Delivery App - Android Development',
    description: 'Need a skilled Android developer to build a local food delivery app for our restaurant chain across Mumbai with real-time tracking.',
    budget: { min: 80000, max: 150000 },
    duration: '2-3 months',
    location: 'Mumbai or Remote',
    tags: ['Android Development', 'Food Tech', 'GPS'],
    proposals: 8,
    postedTime: '3 days ago',
    clientInfo: {
      name: 'Spice Route Restaurants',
      avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      verified: true
    },
    featured: false
  },
  {
    id: '3',
    title: 'Hindi Content Writing for EdTech Platform',
    description: 'Seeking a bilingual content writer to create educational content in Hindi and English for our online learning platform.',
    budget: { min: 15000, max: 25000 },
    duration: 'Ongoing',
    location: 'Remote',
    tags: ['Hindi Content', 'Education', 'SEO'],
    proposals: 15,
    postedTime: '1 day ago',
    clientInfo: {
      name: 'LearnIndia EdTech',
      avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623',
      verified: false
    },
    featured: false
  }
];

const activeContests = [
  {
    id: '1',
    title: 'Logo Design for Ayurvedic Startup',
    description: 'Create a modern yet traditional logo for our ayurvedic wellness brand that appeals to urban millennials while respecting Indian heritage.',
    prize: 15000,
    deadline: 'Jan 25, 2025',
    timeLeft: '5 days left',
    entries: 24,
    category: 'Logo Design',
    featured: true
  },
  {
    id: '2',
    title: 'Regional Language App UI',
    description: 'Design an intuitive UI for a language learning app focused on Indian regional languages with cultural elements.',
    prize: 12000,
    deadline: 'Jan 20, 2025',
    timeLeft: '8 hours left',
    entries: 15,
    category: 'UI Design',
    featured: false
  },
  {
    id: '3',
    title: 'Agricultural Tech Product Naming',
    description: 'Help us name our new farmer-friendly IoT device and create a catchy Hindi/English tagline for rural markets.',
    prize: 8000,
    deadline: 'Jan 30, 2025',
    timeLeft: '10 days left',
    entries: 42,
    category: 'Naming & Taglines',
    featured: false
  }
];

const Index = () => {
  const { mode } = useUserMode();
  
  return (
    <>
      <Hero />
      <FeaturesSection />
      <HowItWorks />
      
      {/* Top Freelancers Section */}
      {mode === 'client' && (
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Top Talent</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Connect with India's best verified freelancers across design, development, content, and more.
                </p>
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/freelancers">
                  Browse All Talent
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {topFreelancers.map((freelancer) => (
                <ProfileCard 
                  key={freelancer.id}
                  {...freelancer}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Top Projects Section */}
      {mode === 'freelancer' && (
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Featured Opportunities</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Discover exciting projects from Indian businesses looking for talent like yours.
                </p>
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/projects">
                  Explore All Jobs
                  <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {topProjects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  {...project}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Active Contests Section */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">Active Contests</h2>
                          <p className="text-muted-foreground max-w-2xl">
              {mode === 'client' 
                ? 'Launch contests to get creative solutions from India\'s best freelancers.' 
                : 'Showcase your skills and win prizes in contests tailored for Indian talent.'}
            </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/contests">
                {mode === 'client' ? 'Start a Contest' : 'View All Contests'}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeContests.map((contest) => (
              <ContestCard 
                key={contest.id}
                {...contest}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Call-to-Action Section */}
      <section className="py-20 bg-primary/5 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-background -z-10"></div>
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {mode === 'client' 
                ? 'Ready to hire the best talent from India?' 
                : 'Ready to start your freelancing journey?'}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              {mode === 'client' 
                ? 'Join thousands of Indian businesses who trust Empleadora for finding skilled freelancers with secure payments and quality assurance.' 
                : 'Join India\'s most trusted freelancing platform and start earning from projects that value your skills and expertise.'}
            </p>
            <Button size="lg" className="rounded-full px-8">
              {mode === 'client' ? 'Post Your First Project' : 'Start Freelancing'}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
