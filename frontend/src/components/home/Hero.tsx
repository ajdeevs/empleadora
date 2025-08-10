
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, MapPin } from 'lucide-react';
import { useUserMode } from '@/context/UserModeContext';
import { cn } from '@/lib/utils';

export function Hero() {
  const { mode } = useUserMode();
  const [searchQuery, setSearchQuery] = useState('');
  
  const heroPoints = {
    client: [
      'KYC verified Indian freelancers',
      'Secure payments with UPI/Razorpay integration',
      'AI-powered matching for better results'
    ],
    freelancer: [
      'Local and remote opportunities',
      'Guaranteed payments via escrow system',
      'Skill-based job recommendations'
    ]
  };
  
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-background -z-10"></div>
      <div className="absolute right-0 top-1/4 w-1/2 aspect-square rounded-full bg-primary/5 blur-3xl -z-10"></div>
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
            {mode === 'client' ? 
              'Hire skilled freelancers from across India' : 
              'Discover your next gig opportunity in India'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {mode === 'client' ? 
              'Connect with talented professionals in design, development, writing, photography and more. Secure payments through escrow, guaranteed quality.' : 
              'Join India\'s fastest-growing freelance platform. Find projects that match your skills with secure payments and local support.'}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <div className={cn(
              "relative flex items-center w-full max-w-md",
              "subtle-shadow rounded-full bg-card border border-border transition-all duration-300 overflow-hidden",
              "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
            )}>
              <input
                type="text"
                placeholder={mode === 'client' ? "Search for designers, developers, writers..." : "Search for web development, logo design..."}
                className="flex-1 px-6 py-3 bg-transparent border-0 outline-none focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1 rounded-full">
                Search
              </Button>
            </div>
            
            <Button asChild size="lg" className="rounded-full px-6 gap-2 whitespace-nowrap">
              <Link to={mode === 'client' ? "/post-project" : "/projects"}>
                {mode === 'client' ? "Post a Project" : "Find Jobs"}
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {heroPoints[mode].map((point, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground">
                <CheckCircle size={16} className="text-primary mr-2" />
                {point}
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Professional Hero Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-primary">India's #1 Freelancing Platform</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-foreground">Connect with</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Top Indian Talent
                  </span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  {mode === 'client' ? 
                    'Find skilled professionals across design, development, writing, and more. Secure payments, guaranteed quality.' : 
                    'Join thousands of successful freelancers. Find projects that match your skills with secure payments and local support.'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-lg px-8 py-3 text-lg">
                  <Link to={mode === 'client' ? "/post-project" : "/projects"}>
                    {mode === 'client' ? "Post a Project" : "Find Jobs"}
                    <ArrowRight size={20} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-lg px-8 py-3 text-lg">
                  <Link to="/how-it-works">
                    How It Works
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold">A</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">B</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">C</div>
                  </div>
                  <span className="text-sm text-muted-foreground">25K+ verified users</span>
                </div>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-amber-500 rounded-sm"></div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative">
              <div className="card-elevated rounded-2xl p-8 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-primary rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500 rounded-full translate-x-12 translate-y-12"></div>
                  <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-blue-500 rounded-full -translate-x-8 -translate-y-8"></div>
                </div>
                
                {/* Main Content */}
                <div className="relative z-10 space-y-6">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      Empleadora
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Where Talent Meets Opportunity
                    </div>
                  </div>
                  
                  {/* Feature Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-elevated rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">💼</span>
                      </div>
                      <div className="text-sm font-medium">Secure Payments</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🛡️</span>
                      </div>
                      <div className="text-sm font-medium">KYC Verified</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🤖</span>
                      </div>
                      <div className="text-sm font-medium">AI Matching</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🇮🇳</span>
                      </div>
                      <div className="text-sm font-medium">Local Support</div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">₹50M+</div>
                      <div className="text-xs text-muted-foreground">Paid Out</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">98%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">24/7</div>
                      <div className="text-xs text-muted-foreground">Support</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
          
          {/* Bottom Trust Bar */}
          <div className="mt-12 card-elevated rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Escrow Protected</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">KYC Verified</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">India Focused</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Trusted by <span className="text-primary font-medium">25,000+</span> professionals
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
