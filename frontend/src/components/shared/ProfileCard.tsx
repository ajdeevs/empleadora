
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Bookmark, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useSavedProfiles } from '@/context/SavedProfilesContext';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  id: string;
  name: string;
  avatar: string;
  title: string;
  rating: number;
  reviewCount: number;
  location: string;
  hourlyRate: number;
  tags: string[];
  featured?: boolean;
}

export function ProfileCard({ 
  id, 
  name, 
  avatar, 
  title, 
  rating, 
  reviewCount, 
  location, 
  hourlyRate, 
  tags, 
  featured = false 
}: ProfileCardProps) {
  const navigate = useNavigate();
  const { saveProfile, removeProfile, isSaved } = useSavedProfiles();
  const saved = isSaved(id);
  
  const handleTagClick = (tag: string) => {
    // In a real app, this would navigate to search results filtered by tag
    navigate(`/freelancers?tag=${encodeURIComponent(tag)}`);
    toast({
      title: 'Filtering by tag',
      description: `Showing freelancers with "${tag}" skills`
    });
  };
  
  const handleSave = () => {
    if (saved) {
      removeProfile(id);
      toast({
        title: 'Profile removed',
        description: `${name} has been removed from your saved profiles.`
      });
    } else {
      saveProfile({ id, name, avatar, title });
      toast({
        title: 'Profile saved',
        description: `${name} has been added to your saved profiles.`
      });
    }
  };
  
  const handleContact = () => {
    navigate(`/profile/${id}`);
    // Scroll to contact form or open message modal in a real implementation
    toast({
      title: 'Contact initiated',
      description: `You can now message ${name}.`
    });
  };
  
  const handleHire = () => {
    navigate(`/profile/${id}`);
    toast({
      title: 'Hire process started',
      description: `Continue to hire ${name}.`
    });
  };
  
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:translate-y-[-4px]",
        featured ? "border-gray-300 ring-1 ring-gray-200" : "border-gray-200"
      )}
    >
      {featured && (
        <div className="bg-gray-100 text-gray-700 text-xs font-medium text-center py-1.5">
          Featured Freelancer
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${id}`} className="shrink-0">
            <img 
              src={avatar} 
              alt={name} 
              className="w-16 h-16 rounded-full object-cover subtle-shadow"
            />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link to={`/profile/${id}`} className="hover:text-gray-900 transition-colors">
                  <h3 className="font-semibold text-lg truncate text-gray-900">{name}</h3>
                </Link>
                <p className="text-gray-600 text-sm mb-1">{title}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "text-gray-500",
                  saved && "text-gray-900 hover:text-gray-900"
                )}
                onClick={handleSave}
              >
                <Bookmark size={18} className={saved ? "fill-current" : ""} />
              </Button>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <div className="flex items-center mr-3">
                <Star size={16} className="text-amber-500 mr-1" />
                <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
                <span className="mx-1">({reviewCount})</span>
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {location}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500">Hourly Rate</span>
                <p className="font-semibold text-gray-900">₹{hourlyRate.toFixed(2)}/hr</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full h-9 border-gray-200 text-gray-700 hover:bg-gray-100"
                  onClick={handleContact}
                >
                  <MessageSquare size={16} className="mr-1" />
                  Contact
                </Button>
                <Button 
                  size="sm" 
                  className="rounded-full h-9 bg-gray-900 hover:bg-gray-800 text-white"
                  onClick={handleHire}
                >
                  Hire
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700 border-gray-200 transition-colors"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
