
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
    <div className="card-elevated rounded-xl border overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-2 line-clamp-1">{props.title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{props.description}</p>
        
        <div className="mb-4">
          <span className="text-sm font-medium">${props.budget.min} - ${props.budget.max}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{props.duration}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{props.location}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {props.tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="rounded-full cursor-pointer hover:bg-primary/20"
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
            <span className="text-muted-foreground">{props.clientInfo.name}</span>
          </div>
          <div>
            <span className="text-primary font-medium">{props.proposals} proposals</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// For backward compatibility, let the WrappedProjectCard name also be used
export const WrappedProjectCard = ProjectCard;
