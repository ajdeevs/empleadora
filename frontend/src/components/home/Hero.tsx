
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, MapPin, Sparkles, TrendingUp, Users, Award } from 'lucide-react';
import { useUserMode } from '@/context/UserModeContext';
import { cn } from '@/lib/utils';

export function Hero() {
  const { mode } = useUserMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const features = [
    'Secure Escrow Payments',
    'KYC Verified Professionals',
    'AI-Powered Matching',
    '24/7 Local Support'
  ];
  
  const stats = [
    { label: 'Active Projects', value: '2,500+', icon: TrendingUp },
    { label: 'Verified Users', value: '25K+', icon: Users },
    { label: 'Success Rate', value: '98%', icon: Award }
  ];
  
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

  // Rotate through features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typing effect for KYC Verified Professionals
  useEffect(() => {
    if (features[currentFeature] === 'KYC Verified Professionals') {
      // Add a small delay before starting to type
      const delayTimer = setTimeout(() => {
        setIsTyping(true);
        setTypingText('');
        let index = 0;
        const text = features[currentFeature];
        
        const typingInterval = setInterval(() => {
          if (index < text.length) {
            setTypingText(text.slice(0, index + 1));
            index++;
          } else {
            setIsTyping(false);
            clearInterval(typingInterval);
          }
        }, 80); // Slightly faster typing speed

        return () => clearInterval(typingInterval);
      }, 500); // 500ms delay before starting to type

      return () => clearTimeout(delayTimer);
    } else {
      setIsTyping(false);
      setTypingText(features[currentFeature]);
    }
  }, [currentFeature]);
  
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary -z-10"></div>
      <div className="absolute right-0 top-1/4 w-1/2 aspect-square rounded-full bg-primary/5 blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute left-0 bottom-1/4 w-1/3 aspect-square rounded-full bg-purple-500/5 blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6 animate-slide-in-down">
            <Sparkles className="w-4 h-4 text-primary animate-bounce" />
            <span className="text-sm font-medium text-primary">India's #1 Freelancing Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
            <span className="text-foreground">
              {mode === 'client' ? 
                'Hire skilled freelancers from across India' : 
                'Discover your next gig opportunity in India'}
            </span>
          </h1>
          
          {/* Dynamic Feature Display with Typing Effect */}
          <div className="h-8 mb-6 flex items-center justify-center">
            <div className="text-lg md:text-xl text-primary font-medium">
              {isTyping ? (
                <span className="animate-fade-in">
                  {typingText}
                  <span className="typing-cursor">|</span>
                </span>
              ) : (
                <span className="animate-fade-in">
                  {features[currentFeature]}
                </span>
              )}
            </div>
          </div>
          
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
          
          {/* Enhanced Feature Points */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-8">
            {heroPoints[mode].map((point, index) => (
              <div key={index} className="flex items-center text-sm text-muted-foreground animate-slide-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CheckCircle size={16} className="text-primary mr-2 animate-bounce-x" />
                {point}
              </div>
            ))}
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card/50 border border-border/50 hover:scale-105 transition-transform">
                <stat.icon className="w-6 h-6 text-primary" />
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
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
                  <Sparkles className="w-4 h-4 text-primary animate-bounce" />
                  <span className="text-sm font-medium text-primary">India's #1 Freelancing Platform</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-foreground">
                    {mode === 'client' ? 'Connect with' : 'Join'}
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    {mode === 'client' ? 'Top Indian Talent' : 'India\'s Best Platform'}
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
              
              {/* Enhanced Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold animate-bounce">A</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold animate-bounce" style={{ animationDelay: '0.1s' }}>B</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold animate-bounce" style={{ animationDelay: '0.2s' }}>C</div>
                  </div>
                  <span className="text-sm text-muted-foreground">25K+ verified users</span>
                </div>
                <div className="w-px h-6 bg-border"></div>
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-amber-500 rounded-sm animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
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
                  
                  {/* Enhanced Feature Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="card-elevated rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl animate-bounce">💼</span>
                      </div>
                      <div className="text-sm font-medium">Secure Payments</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl animate-bounce" style={{ animationDelay: '0.1s' }}>🛡️</span>
                      </div>
                      <div className="text-sm font-medium">KYC Verified</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>🤖</span>
                      </div>
                      <div className="text-sm font-medium">AI Matching</div>
                    </div>
                    <div className="card-elevated rounded-lg p-4 text-center hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>🇮🇳</span>
                      </div>
                      <div className="text-sm font-medium">Local Support</div>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-primary animate-pulse">₹50M+</div>
                      <div className="text-xs text-muted-foreground">Paid Out</div>
                    </div>
                    <div className="text-center hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-primary animate-pulse" style={{ animationDelay: '0.2s' }}>98%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center hover:scale-105 transition-transform">
                      <div className="text-lg font-bold text-primary animate-pulse" style={{ animationDelay: '0.4s' }}>24/7</div>
                      <div className="text-xs text-muted-foreground">Support</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 -right-2 w-4 h-4 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -top-2 left-1/2 w-3 h-3 bg-green-500/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>
          </div>
          
          {/* Enhanced Bottom Trust Bar */}
          <div className="mt-12 card-elevated rounded-xl p-6 hover:scale-102 transition-transform">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <Shield className="w-5 h-5 text-primary animate-bounce" />
                  <span className="text-sm font-medium">Escrow Protected</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <CheckCircle className="w-5 h-5 text-green-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="text-sm font-medium">KYC Verified</span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2 hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5 text-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="text-sm font-medium">India Focused</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Trusted by <span className="text-primary font-medium animate-pulse">25,000+</span> professionals
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
