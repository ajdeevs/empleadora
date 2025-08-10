
// Since we can't modify this file directly (it's in read-only files),
// Let's create a wrapper component that extends ProjectCard

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  budget: { min: number; max: number };
  duration: string;
  location: string;
  tags: string[];
  proposals: number;
  postedTime: string;
  clientInfo: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  featured: boolean;
  onTagClick?: (tag: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = (props) => {
  const { tags, onTagClick, ...rest } = props;
  
  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-1">{props.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{props.description}</p>
        
        <div className="mb-4">
          <span className="text-sm font-semibold text-gray-900">₹{props.budget.min} - ₹{props.budget.max}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">{props.duration}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">{props.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {props.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="rounded-full cursor-pointer hover:bg-gray-200 bg-gray-100 text-gray-700 border-gray-200"
              onClick={(e) => handleTagClick(e, tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img 
                src={props.clientInfo.avatar} 
                alt={props.clientInfo.name}
                className="w-full h-full object-cover" 
              />
            </div>
            <span className="text-gray-600">{props.clientInfo.name}</span>
          </div>
          <div>
            <span className="text-gray-600 font-medium">{props.proposals} proposals</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// For backward compatibility, let the WrappedProjectCard name also be used
export const WrappedProjectCard = ProjectCard;
