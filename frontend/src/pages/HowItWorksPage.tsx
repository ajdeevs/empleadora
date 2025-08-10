import React from 'react';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Shield, Users, Award, Smartphone, MapPin, Handshake } from 'lucide-react';

const additionalFeatures = [
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description: 'Money is held safely until work is completed and approved by both parties.'
  },
  {
    icon: Smartphone,
    title: 'UPI & Local Payments',
    description: 'Pay and get paid through familiar Indian payment methods like UPI, Paytm, and bank transfers.'
  },
  {
    icon: Award,
    title: 'Verified Professionals',
    description: 'All freelancers undergo KYC verification and skill validation for your peace of mind.'
  },
  {
    icon: MapPin,
    title: 'Location-Based Matching',
    description: 'Find local talent for on-site work or collaborate remotely across India.'
  },
  {
    icon: Users,
    title: 'AI-Powered Recommendations',
    description: 'Smart algorithms match you with the most suitable freelancers or projects.'
  },
  {
    icon: Handshake,
    title: 'Dispute Resolution',
    description: 'Professional mediation in Hindi and English for any project disagreements.'
  }
];

const HowItWorksPage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How Empleadora Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            India's most trusted freelancing platform connecting skilled professionals 
            with businesses across the country. Simple, secure, and designed for success.
          </p>
        </div>
      </section>

      {/* How It Works Component */}
      <HowItWorks />

      {/* Features Grid */}
      <section className="py-20 bg-secondary">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Empleadora?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the Indian market with local payment methods, 
              language support, and cultural understanding.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="card-elevated rounded-xl p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-lg bg-primary/10 text-primary">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from freelancers and clients who have found success on Empleadora.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-elevated rounded-xl p-8 border">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" 
                  alt="Priya" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Priya Sharma</h4>
                  <p className="text-sm text-muted-foreground">UI/UX Designer, Bangalore</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "I've earned over ₹5 lakhs in my first year on Empleadora. The secure payment system 
                and quality clients make it the best platform for freelancers in India."
              </p>
            </div>
            
            <div className="card-elevated rounded-xl p-8 border">
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" 
                  alt="Rahul" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">Rahul Gupta</h4>
                  <p className="text-sm text-muted-foreground">CEO, TechStart Solutions</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                "Found an amazing development team through Empleadora. The escrow system gave us 
                confidence, and the quality of work exceeded our expectations."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of successful freelancers and businesses on India's 
            most trusted freelancing platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-background text-foreground px-8 py-3 rounded-full font-semibold hover:bg-background/90 transition-colors">
              Start as Freelancer
            </button>
            <button className="border-2 border-background text-background px-8 py-3 rounded-full font-semibold hover:bg-background hover:text-foreground transition-colors">
              Hire Talent
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;
