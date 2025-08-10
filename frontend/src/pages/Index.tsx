import React from 'react';
import { Hero } from '@/components/home/Hero';
import { Button } from '@/components/ui/button';
import { Shield, Users, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserMode } from '@/context/UserModeContext';

const Index = () => {
  const { mode } = useUserMode();
  
  return (
    <>
      <Hero />
      
      {/* Simple Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Empleadora?</h2>
            <p className="text-xl text-gray-600">Simple, secure, and designed for success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Payments</h3>
              <p className="text-gray-600">Your money is protected with our secure escrow system until work is completed.</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Verified Talent</h3>
              <p className="text-gray-600">All freelancers are verified and rated by previous clients for your peace of mind.</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Work</h3>
              <p className="text-gray-600">Get professional results with our quality guarantee and project management tools.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {mode === 'client' ? (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Post Your Project</h3>
                  <p className="text-gray-600">Describe your project requirements and budget to attract the right freelancers.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Freelancer</h3>
                  <p className="text-gray-600">Review proposals, check portfolios, and hire the perfect freelancer for your needs.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Work Done</h3>
                  <p className="text-gray-600">Collaborate safely with secure payments and get your project completed on time.</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">1</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Create Profile</h3>
                  <p className="text-gray-600">Build your professional profile and showcase your skills and portfolio.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">2</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Find Projects</h3>
                  <p className="text-gray-600">Browse projects that match your skills and submit winning proposals.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">3</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Earn Money</h3>
                  <p className="text-gray-600">Complete projects, build your reputation, and grow your freelance business.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Simple CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {mode === 'client' ? 'Ready to hire?' : 'Ready to earn?'}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {mode === 'client' ? 
                'Join thousands of businesses that trust Empleadora for their freelancing needs.' : 
                'Start building your freelance career on India\'s most trusted platform.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
                <Link to={mode === 'client' ? "/post-project" : "/projects"}>
                  {mode === 'client' ? "Post Your First Project" : "Find Your First Job"}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl">
                <Link to={mode === 'client' ? "/freelancers" : "/how-it-works"}>
                  {mode === 'client' ? "Browse Freelancers" : "Learn More"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;