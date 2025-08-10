import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, Users, Briefcase } from 'lucide-react';
import { useUserMode } from '@/context/UserModeContext';
import { cn } from '@/lib/utils';

export function Hero() {
  const { mode } = useUserMode();
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <section className="relative pt-32 pb-20 bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-30"></div>
      
      <div className="container px-4 mx-auto relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            {mode === 'client' ? (
              <>
                Find the right
                <span className="text-gray-600"> freelancer</span>
                <br />
                for your project
              </>
            ) : (
              <>
                Build your
                <span className="text-gray-600"> freelance</span>
                <br />
                career today
              </>
            )}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {mode === 'client' ? 
              'Connect with skilled professionals who deliver quality work on time. Secure payments, verified talent.' : 
              'Join thousands of freelancers earning on India\'s most trusted platform. Get paid securely for your skills.'}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus-within:border-gray-400 transition-colors">
              <Search className="absolute left-6 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={mode === 'client' ? "Search for services or skills..." : "Search for projects or jobs..."}
                className="flex-1 pl-14 pr-6 py-5 text-lg bg-transparent border-0 outline-none placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="m-2 px-8 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white">
                Search
              </Button>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Button asChild size="lg" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              <Link to={mode === 'client' ? "/post-project" : "/projects"}>
                {mode === 'client' ? "Post a Project" : "Find Jobs"}
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl">
              <Link to={mode === 'client' ? "/freelancers" : "/how-it-works"}>
                {mode === 'client' ? "Browse Talent" : "How it Works"}
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users size={24} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">10k+</div>
              <div className="text-sm text-gray-600">Active Freelancers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase size={24} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">5k+</div>
              <div className="text-sm text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star size={24} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}